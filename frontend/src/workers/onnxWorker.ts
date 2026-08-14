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

let emaAlbedo: [number, number, number] | null = null;
const EMA_ALPHA_BASELINE = 0.2;

export type PipelineMode = 'BASELINE' | 'MULTI_REGION_MEAN' | 'VARIANCE_WEIGHTED' | 'ADAPTIVE_EMA';

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
  
  const { type, mode = 'BASELINE', imageDataList, headPoseVelocity = 0 } = e.data;
  
  if (type === 'INFERENCE' && imageDataList && imageDataList.length > 0) {
    try {
      const startTime = performance.now();
      const N = imageDataList.length;
      const float32Data = new Float32Array(N * 3 * 256 * 256);
      
      // 1. EXACT TRAINING MATCH: Pure 0.0-1.0 scaling, NO Gamma 2.2 shift.
      for (let n = 0; n < N; n++) {
        const data = imageDataList[n].data;
        let i = n * (3 * 256 * 256);
        for (let y = 0; y < 256; y++) {
          for (let x = 0; x < 256; x++) {
            const rgbaIdx = (y * 256 + x) * 4;
            float32Data[i] = data[rgbaIdx] / 255.0;                 // R
            float32Data[i + 256 * 256] = data[rgbaIdx + 1] / 255.0; // G
            float32Data[i + 2 * 256 * 256] = data[rgbaIdx + 2] / 255.0; // B
            i++;
          }
        }
      }
      
      const tensor = new ort.Tensor('float32', float32Data, [N, 3, 256, 256]);
      const inputName = session.inputNames[0];
      const feeds: Record<string, ort.Tensor> = {};
      feeds[inputName] = tensor;
      
      // 2. Run Inference
      const results = await session.run(feeds);
      const outputName = session.outputNames[0];
      const outputData = results[outputName].data as Float32Array;
      const inferenceEnd = performance.now();
      const latencyMs = inferenceEnd - startTime;
      
      const illuminations: [number, number, number][] = [];
      for (let n = 0; n < N; n++) {
         illuminations.push([
           Number(outputData[n * 3]),
           Number(outputData[n * 3 + 1]),
           Number(outputData[n * 3 + 2])
         ]);
      }

      // Variance calculation for VARIANCE_WEIGHTED and ADAPTIVE_EMA modes
      const variances: number[] = [];
      const weights: number[] = [];
      const eps = 1e-5;

      if (mode === 'VARIANCE_WEIGHTED' || mode === 'ADAPTIVE_EMA') {
        for (let n = 0; n < N; n++) {
          const data = imageDataList[n].data;
          let sumY = 0;
          let sumY2 = 0;
          let validPixels = 0;
          for (let p = 0; p < 256 * 256; p++) {
             const r = data[p * 4] / 255.0;
             const g = data[p * 4 + 1] / 255.0;
             const b = data[p * 4 + 2] / 255.0;
             if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
                const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                sumY += y;
                sumY2 += y * y;
                validPixels++;
             }
          }
          if (validPixels > 0) {
            const meanY = sumY / validPixels;
            const meanY2 = sumY2 / validPixels;
            let variance = meanY2 - (meanY * meanY);
            if (variance < eps) variance = eps;
            variances.push(variance);
            weights.push(1.0 / variance);
          } else {
            variances.push(eps);
            weights.push(1.0 / eps);
          }
        }
      } else {
        // Equal weights
        for (let n = 0; n < N; n++) {
          variances.push(0);
          weights.push(1.0);
        }
      }

      const sumWeights = weights.reduce((a, b) => a + b, 0);
      const normalizedWeights = weights.map(w => sumWeights > 0 ? w / sumWeights : 1.0 / N);

      // Aggregate Illumination
      let finalIllum = [0, 0, 0];
      if (mode === 'BASELINE') {
        finalIllum = illuminations[0]; // Single crop
      } else {
        for (let n = 0; n < N; n++) {
           finalIllum[0] += illuminations[n][0] * normalizedWeights[n];
           finalIllum[1] += illuminations[n][1] * normalizedWeights[n];
           finalIllum[2] += illuminations[n][2] * normalizedWeights[n];
        }
      }

      // Check NaN/Inf
      if (!Number.isFinite(finalIllum[0]) || !Number.isFinite(finalIllum[1]) || !Number.isFinite(finalIllum[2])) {
         throw new Error("Invalid model outputs");
      }
      
      // 3. Positive Clamping & Normalization
      let lc = [
        Math.max(finalIllum[0], 0.1),
        Math.max(finalIllum[1], 0.1),
        Math.max(finalIllum[2], 0.1)
      ];
      const norm = Math.sqrt(lc[0]*lc[0] + lc[1]*lc[1] + lc[2]*lc[2]) + 1e-8;
      const lnorm = [lc[0]/norm, lc[1]/norm, lc[2]/norm];
      const mean = (lnorm[0] + lnorm[1] + lnorm[2]) / 3.0 + 1e-8;
      
      // 4. Chromatic Adaptation Gains
      const gains = [
        1.0 / (lnorm[0]/mean),
        1.0 / (lnorm[1]/mean),
        1.0 / (lnorm[2]/mean)
      ];
      
      // 5. Robust Skin Sampling (Trimmed Mean on all valid pixels from provided crops)
      interface Sample { r: number; g: number; b: number; y: number; }
      const samples: Sample[] = [];
      
      // Extract skin points from the first crop (baseline) or all crops (multi-region)
      const cropsToSample = mode === 'BASELINE' ? 1 : N;
      for (let n = 0; n < cropsToSample; n++) {
        const data = imageDataList[n].data;
        for (let p = 0; p < 256 * 256; p+=4) { // Sample a subset to keep it fast
             const r = data[p * 4] / 255.0;
             const g = data[p * 4 + 1] / 255.0;
             const b = data[p * 4 + 2] / 255.0;
             if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
               const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
               samples.push({ r, g, b, y });
             }
        }
      }
      
      if (samples.length === 0) {
        throw new Error('Insufficient skin-region data');
      }
      
      samples.sort((a, b) => a.y - b.y);
      const trimCount = Math.floor(samples.length * 0.15); // Discard top/bottom 15%
      const trimmed = samples.slice(trimCount, samples.length - trimCount);
      
      let sr = 0, sg = 0, sb = 0;
      for (const s of trimmed) { sr += s.r; sg += s.g; sb += s.b; }
      const skinR = sr / trimmed.length;
      const skinG = sg / trimmed.length;
      const skinB = sb / trimmed.length;
      
      // 6. Apply AI Illuminant Correction (Albedo Extraction)
      const correctedR = skinR * gains[0];
      const correctedG = skinG * gains[1];
      const correctedB = skinB * gains[2];
      
      // 7. Clamp to Physical Bounds (No inverse gamma needed)
      const rawAlbedo: [number, number, number] = [
        Math.max(0, Math.min(1.0, correctedR)),
        Math.max(0, Math.min(1.0, correctedG)),
        Math.max(0, Math.min(1.0, correctedB))
      ];
      
      // 8. Temporal EMA Stabilization
      let alpha = EMA_ALPHA_BASELINE;
      if (mode === 'ADAPTIVE_EMA') {
        const v = Math.max(0, Math.min(1.0, headPoseVelocity));
        const alphaMin = 0.05;
        const alphaMax = 0.35;
        alpha = alphaMin + (alphaMax - alphaMin) * v;
      }

      if (!emaAlbedo) {
        emaAlbedo = rawAlbedo;
      } else {
        const dist = Math.sqrt(
          Math.pow(rawAlbedo[0] - emaAlbedo[0], 2) +
          Math.pow(rawAlbedo[1] - emaAlbedo[1], 2) +
          Math.pow(rawAlbedo[2] - emaAlbedo[2], 2)
        );
        if (dist > 0.15) {
          emaAlbedo = rawAlbedo; // Reset on massive lighting shift
        } else {
          emaAlbedo = [
            alpha * rawAlbedo[0] + (1 - alpha) * emaAlbedo[0],
            alpha * rawAlbedo[1] + (1 - alpha) * emaAlbedo[1],
            alpha * rawAlbedo[2] + (1 - alpha) * emaAlbedo[2]
          ];
        }
      }
      
      if (!Number.isFinite(emaAlbedo[0])) {
        throw new Error('Math error: non-finite output');
      }
      
      const metrics = {
        batchSize: N,
        inferenceLatencyMs: latencyMs,
        headPoseVelocity,
        variances,
        weights: normalizedWeights,
        rawIlluminations: illuminations
      };

      postMessage({ type: 'RESULT', mode, albedo: emaAlbedo, illumination: finalIllum, metrics });
      
    } catch (error: any) {
      console.error("Inference Error:", error);
      emaAlbedo = null; 
      postMessage({ type: 'error', message: error.message || 'Inference failed' });
    }
  }
};