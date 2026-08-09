import * as ort from 'onnxruntime-web';
import wasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.jsep.wasm?url';
import mjsUrl from 'onnxruntime-web/ort-wasm-simd-threaded.jsep.mjs?url';

// Configure ONNX Runtime to use the Vite-bundled assets
ort.env.wasm.wasmPaths = {
  wasm: wasmUrl,
  mjs: mjsUrl
};
ort.env.wasm.numThreads = 1; // Force single thread to prevent SAB deadlock in Vercel

let session: ort.InferenceSession | null = null;
let lastLogTime = 0;

// EMA State for Temporal Stability
let emaAlbedo: [number, number, number] | null = null;
let emaSampleCount = 0;
let albedoHistory: [number, number, number][] = [];
const EMA_ALPHA = 0.2;

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
      
      // 5. Robust Skin Sampling
      interface Sample { r: number; g: number; b: number; y: number; }
      const samples: Sample[] = [];
      let totalSamples = 0;
      let rejectedHighlights = 0;
      let rejectedShadows = 0;
      
      if (skinPoints && skinPoints.length > 0) {
        for (const pt of skinPoints) {
          totalSamples++;
          if (pt.x >= 0 && pt.x < 256 && pt.y >= 0 && pt.y < 256) {
            const idx = (pt.y * 256 + pt.x) * 4;
            const r = Math.pow(data[idx] / 255.0, 2.2);
            const g = Math.pow(data[idx + 1] / 255.0, 2.2);
            const b = Math.pow(data[idx + 2] / 255.0, 2.2);
            
            // Reject invalid values
            if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b) &&
                r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1) {
              const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
              samples.push({ r, g, b, y });
            }
          }
        }
      }
      
      if (samples.length === 0) {
        emaAlbedo = null; // Reset EMA
        emaSampleCount = 0;
        albedoHistory = [];
        postMessage({ type: 'error', message: 'Insufficient skin-region data for accurate match' });
        return;
      }
      
      // Sort samples by luminance
      samples.sort((a, b) => a.y - b.y);
      const validCount = samples.length;
      
      const calcMean = (arr: Sample[]) => {
        if (arr.length === 0) return [0, 0, 0];
        let sr = 0, sg = 0, sb = 0;
        for (const s of arr) { sr += s.r; sg += s.g; sb += s.b; }
        return [sr / arr.length, sg / arr.length, sb / arr.length];
      };
      
      const baseline = calcMean(samples);
      
      const trimMean = (trimPercent: number) => {
        const trimCount = Math.floor(validCount * (trimPercent / 100.0));
        const trimmed = samples.slice(trimCount, validCount - trimCount);
        return { mean: calcMean(trimmed), count: trimCount };
      };
      
      const trim10 = trimMean(10);
      const trim15 = trimMean(15);
      const trim20 = trimMean(20);
      
      rejectedShadows = trim15.count;
      rejectedHighlights = trim15.count;
      
      const medianSample = samples[Math.floor(validCount / 2)];
      const median = [medianSample.r, medianSample.g, medianSample.b];
      
      // Use 15% trimmed mean as the selected albedo
      const [skinR, skinG, skinB] = trim15.mean;
      
      const now = Date.now();
      if (now - lastLogTime > 1000) {
        lastLogTime = now;
        console.log("[TRYON:SKIN:SAMPLES]", {
          totalSamples,
          validSamples: validCount,
          rejectedHighlights,
          rejectedShadows
        });
        console.log("[TRYON:SKIN:ALBEDO]", {
          baselineRGB: baseline,
          trim10RGB: trim10.mean,
          trim15RGB: trim15.mean,
          trim20RGB: trim20.mean,
          medianRGB: median
        });
      }
      
      // 6. Apply gains (Chromatic Adaptation)
      const correctedR = skinR * gains[0];
      const correctedG = skinG * gains[1];
      const correctedB = skinB * gains[2];
      
      // 7. Gamma Correction and Clamp to [0,1]
      const rawAlbedoR = Math.max(0, Math.min(1.0, Math.pow(Math.max(0, correctedR), 1.0 / 2.2)));
      const rawAlbedoG = Math.max(0, Math.min(1.0, Math.pow(Math.max(0, correctedG), 1.0 / 2.2)));
      const rawAlbedoB = Math.max(0, Math.min(1.0, Math.pow(Math.max(0, correctedB), 1.0 / 2.2)));
      
      const rawAlbedo: [number, number, number] = [rawAlbedoR, rawAlbedoG, rawAlbedoB];
      
      // 8. Temporal EMA Stabilization
      if (!emaAlbedo) {
        emaAlbedo = rawAlbedo;
      } else {
        // Detect major lighting transition (distance > 0.15)
        const dist = Math.sqrt(
          Math.pow(rawAlbedo[0] - emaAlbedo[0], 2) +
          Math.pow(rawAlbedo[1] - emaAlbedo[1], 2) +
          Math.pow(rawAlbedo[2] - emaAlbedo[2], 2)
        );
        if (dist > 0.15) {
          emaAlbedo = rawAlbedo; // Reset
          emaSampleCount = 0;
          albedoHistory = [];
        } else {
          emaAlbedo = [
            EMA_ALPHA * rawAlbedo[0] + (1 - EMA_ALPHA) * emaAlbedo[0],
            EMA_ALPHA * rawAlbedo[1] + (1 - EMA_ALPHA) * emaAlbedo[1],
            EMA_ALPHA * rawAlbedo[2] + (1 - EMA_ALPHA) * emaAlbedo[2]
          ];
        }
      }
      
      emaSampleCount++;
      albedoHistory.push(rawAlbedo);
      if (albedoHistory.length > 10) albedoHistory.shift();
      
      // Calculate StdDev for stability measurement
      let stdDev = [0, 0, 0];
      if (albedoHistory.length > 1) {
        const histMean = [
          albedoHistory.reduce((s, v) => s + v[0], 0) / albedoHistory.length,
          albedoHistory.reduce((s, v) => s + v[1], 0) / albedoHistory.length,
          albedoHistory.reduce((s, v) => s + v[2], 0) / albedoHistory.length
        ];
        const varSum = albedoHistory.reduce((s, v) => [
          s[0] + Math.pow(v[0] - histMean[0], 2),
          s[1] + Math.pow(v[1] - histMean[1], 2),
          s[2] + Math.pow(v[2] - histMean[2], 2)
        ], [0, 0, 0]);
        stdDev = [
          Math.sqrt(varSum[0] / (albedoHistory.length - 1)),
          Math.sqrt(varSum[1] / (albedoHistory.length - 1)),
          Math.sqrt(varSum[2] / (albedoHistory.length - 1))
        ];
      }

      if (now - lastLogTime > 1000) {
        console.log("[TRYON:ALBEDO:STABILITY]", {
          rawAlbedo,
          trimmedAlbedo: rawAlbedo, // (It is the trimmed albedo from step 5)
          stabilizedAlbedo: emaAlbedo,
          standardDeviation: stdDev,
          alpha: EMA_ALPHA,
          sampleCount: emaSampleCount
        });
      }
      
      const albedo = emaAlbedo;
      console.log("[ONNX:ALBEDO]", albedo);
      
      // 9. Validation Guards
      if (!Number.isFinite(albedo[0]) || !Number.isFinite(albedo[1]) || !Number.isFinite(albedo[2])) {
        postMessage({ type: 'error', message: 'Math error: non-finite output' });
        return;
      }
      
      postMessage({ type: 'RESULT', albedo, illumination });
      
    } catch (error: any) {
      console.error("Inference Error:", error);
      emaAlbedo = null; // Reset EMA on error
      emaSampleCount = 0;
      albedoHistory = [];
      postMessage({ type: 'error', message: error.message || 'Inference failed' });
    }
  }
};
