import * as ort from 'onnxruntime-web';

// Set path to WASM binaries (using local public folder instead of jsdelivr CDN)
ort.env.wasm.wasmPaths = '/wasm/onnx/';

let session: ort.InferenceSession | null = null;

async function init() {
  try {
    session = await ort.InferenceSession.create('/illumskin_net.onnx', {
      executionProviders: ['wasm']
    });
    console.log("ONNX Session Loaded Successfully in Web Worker");
    postMessage({ type: 'STATUS', status: 'READY' });
  } catch (e: any) {
    console.error("Failed to load ONNX model:", e);
    postMessage({ type: 'error', message: e.message || 'Failed to initialize ONNX session' });
  }
}

init();

self.onmessage = async (e: MessageEvent) => {
  if (!session) return;
  
  const { type, imageData, skinPoints } = e.data;
  
  if (type === 'INFERENCE' && imageData) {
    try {
      // imageData is an ImageData object from the 224x224 canvas
      const data = imageData.data; // Uint8ClampedArray of RGBA values
      
      // We need a Float32Array of size 1 * 3 * 256 * 256
      const float32Data = new Float32Array(3 * 256 * 256);
      
      // The model expects [1, 3, 256, 256] (NCHW format, RGB)
      // Linearize pixel values 0-255 to 0.0-1.0 using gamma 2.2
      let i = 0;
      let minVal = Infinity;
      let maxVal = -Infinity;
      let sumVal = 0;
      
      for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
          const rgbaIdx = (y * 256 + x) * 4;
          
          const r = Math.pow(data[rgbaIdx] / 255.0, 2.2);
          const g = Math.pow(data[rgbaIdx + 1] / 255.0, 2.2);
          const b = Math.pow(data[rgbaIdx + 2] / 255.0, 2.2);
          
          float32Data[i] = r;
          float32Data[i + 256 * 256] = g;
          float32Data[i + 2 * 256 * 256] = b;
          
          if (r < minVal) minVal = r;
          if (g < minVal) minVal = g;
          if (b < minVal) minVal = b;
          
          if (r > maxVal) maxVal = r;
          if (g > maxVal) maxVal = g;
          if (b > maxVal) maxVal = b;
          
          sumVal += r + g + b;
          
          i++;
        }
      }
      
      console.log("[ONNX:INPUT]", {
        dims: [1, 3, 256, 256],
        dataLength: float32Data.length,
        min: minVal,
        max: maxVal,
        mean: sumVal / (3 * 256 * 256)
      });
      
      const tensor = new ort.Tensor('float32', float32Data, [1, 3, 256, 256]);
      
      // The input node name needs to match the exported model (often 'input' or similar)
      // If we don't know the exact input name, we can get it from the session
      const inputName = session.inputNames[0];
      const feeds: Record<string, ort.Tensor> = {};
      feeds[inputName] = tensor;
      
      const results = await session.run(feeds);
      const outputName = session.outputNames[0];
      const outputData = results[outputName].data; // Float32Array of size 3
      
      // Expected output: [R, G, B] estimated scene illuminant
      let illumination = [Number(outputData[0]), Number(outputData[1]), Number(outputData[2])];
      console.log("[ONNX:ILLUMINATION]", illumination);
      
      // 1. Positive Clamping
      let lc = [
        Math.max(illumination[0], 0.1),
        Math.max(illumination[1], 0.1),
        Math.max(illumination[2], 0.1)
      ];
      
      // 2. L2 Normalization
      const norm = Math.sqrt(lc[0]*lc[0] + lc[1]*lc[1] + lc[2]*lc[2]) + 1e-8;
      const lnorm = [lc[0]/norm, lc[1]/norm, lc[2]/norm];
      
      // 3. Mean Normalization
      const mean = (lnorm[0] + lnorm[1] + lnorm[2]) / 3.0 + 1e-8;
      
      // 4. Chromatic Adaptation Gains
      const gains = [
        1.0 / (lnorm[0]/mean),
        1.0 / (lnorm[1]/mean),
        1.0 / (lnorm[2]/mean)
      ];
      console.log("[ONNX:GAINS]", gains);
      
      // 5. Skin Sampling
      let skinR = 0, skinG = 0, skinB = 0;
      let validSamples = 0;
      
      if (skinPoints && skinPoints.length > 0) {
        for (const pt of skinPoints) {
          if (pt.x >= 0 && pt.x < 256 && pt.y >= 0 && pt.y < 256) {
            const idx = (pt.y * 256 + pt.x) * 4;
            // Convert sampled RGB to linear space
            skinR += Math.pow(data[idx] / 255.0, 2.2);
            skinG += Math.pow(data[idx + 1] / 255.0, 2.2);
            skinB += Math.pow(data[idx + 2] / 255.0, 2.2);
            validSamples++;
          }
        }
      }
      
      if (validSamples > 0) {
        skinR /= validSamples;
        skinG /= validSamples;
        skinB /= validSamples;
      } else {
        // Fallback: Return error if skin sampling failed
        postMessage({ type: 'error', message: 'Insufficient skin-region data for accurate match' });
        return;
      }
      
      console.log("[ONNX:SKIN]", [skinR, skinG, skinB]);
      
      // 6. Apply gains (Chromatic Adaptation)
      const correctedR = skinR * gains[0];
      const correctedG = skinG * gains[1];
      const correctedB = skinB * gains[2];
      
      // 7. Gamma Correction and Clamp to [0,1]
      const albedoR = Math.max(0, Math.min(1.0, Math.pow(Math.max(0, correctedR), 1.0 / 2.2)));
      const albedoG = Math.max(0, Math.min(1.0, Math.pow(Math.max(0, correctedG), 1.0 / 2.2)));
      const albedoB = Math.max(0, Math.min(1.0, Math.pow(Math.max(0, correctedB), 1.0 / 2.2)));
      
      const albedo = [albedoR, albedoG, albedoB];
      console.log("[ONNX:ALBEDO]", albedo);
      
      // 8. Validation Guards
      if (!Number.isFinite(albedo[0]) || !Number.isFinite(albedo[1]) || !Number.isFinite(albedo[2])) {
        postMessage({ type: 'error', message: 'Math error: non-finite output' });
        return;
      }
      
      postMessage({ type: 'RESULT', albedo, illumination });
      
    } catch (error: any) {
      console.error("Inference Error:", error);
      postMessage({ type: 'error', message: error.message || 'Inference failed' });
    }
  }
};
