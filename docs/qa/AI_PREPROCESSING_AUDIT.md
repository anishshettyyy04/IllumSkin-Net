# AI Preprocessing & Postprocessing Pipeline Audit

## 1. Executive Summary

This document presents the findings from the Stage 4.2 read-only audit of the IllumSkin-Net data preprocessing and postprocessing pipeline. The audit verifies the data transformation steps from camera input to the Euclidean matching algorithm.

**Overall Verdict:** STAGE 4.2 = AUDIT FINDING

The pipeline successfully captures and constructs the ONNX tensor, but contains **CRITICAL** semantic mismatches in how the model's output is interpreted and processed, as well as a **MAJOR** mismatch in input normalization. The frontend currently treats the scene's estimated *illuminant* (the color of the room lighting) as the user's *albedo* (true skin color). 

## 2. Input Pipeline

- **Camera Frame:** 1280x720 (from `navigator.mediaDevices.getUserMedia`) in `TryOnStudio.tsx`.
- **Canvas:** 256x256.
- **Resize:** The camera frame is center-cropped to a square `size = min(videoWidth, videoHeight)` and drawn to the 256x256 canvas using `ctx.drawImage`. 
- **Pixel Extraction:** `ctx.getImageData(0, 0, 256, 256)` extracts RGBA.
- **Channel Conversion:** Handled in `onnxWorker.ts`. The alpha channel is discarded, and the array is populated into R, G, B planar format.
- **Normalization:** `float32Data[i] = data[rgbaIdx] / 255.0`
- **Tensor Layout:** NCHW structure (`[1, 3, 256, 256]`) correctly assembled using a 1D `Float32Array`.

## 3. Resize/Crop Analysis

**Finding:** The frontend correctly utilizes a center-crop strategy. It calculates a square dimension based on the shortest side of the video, crops from the center, and scales it to 256x256. This correctly avoids stretching and preserves the aspect ratio without geometric distortion.

## 4. Channel Order

**Finding:** The `onnxWorker.ts` correctly extracts R, G, and B planes sequentially. The model was trained on RGB (verified in `dataset.py` via `cv2.cvtColor(image, cv2.COLOR_BGR2RGB)`), so the channel ordering is correct.

## 5. Normalization

**Finding:** The frontend performs linear scaling `pixel / 255.0` to achieve a `[0, 1]` range.
However, analysis of `infer.py` (the reference implementation) shows that the model was trained/designed to operate on **linearized RGB** images:
```python
# From infer.py
frame_linear = (frame_rgb.astype(np.float32) / 255.0) ** 2.2
```
The frontend is missing the inverse gamma correction (`** 2.2`). This is a **MAJOR** mismatch that affects the color distribution fed to the neural network.

## 6. Tensor Layout

**Finding:** The final tensor is constructed flawlessly as `[1, 3, 256, 256]` in a contiguous `Float32Array`. The channel offsets are:
- R starts at `0`
- G starts at `65536`
- B starts at `131072`

## 7. ONNX Model Contract

Inspected via `onnx` python library:
- **Input:** `input_frame`, float32, `[batch_size, 3, 256, 256]`
- **Output:** `estimated_illumination`, float32, `[batch_size, 3]`
- **Producer:** pytorch v2.7.1
- **Opset:** 11

## 8. Output Semantics

**CRITICAL FINDING:** 
The model's output is `estimated_illumination`, which represents the **color of the scene light source** (the illuminant). It does *not* represent the skin albedo. 
In the reference code (`infer.py`), the `estimated_illumination` vector is used to calculate white-balance gains, which are then applied to the original image to *reveal* the true albedo. The frontend currently takes the light source color and passes it to the backend as if it were the user's foundation shade.

## 9. Postprocessing

**CRITICAL FINDING:**
The frontend worker does **zero** postprocessing:
```typescript
// Current frontend behaviour
const albedo = [outputData[0], outputData[1], outputData[2]];
```
The reference pipeline (`infer.py`) requires extensive postprocessing:
1. Clamping to positive values (`min=0.1`)
2. L2 Normalization of the vector
3. Mean Normalization to compute white-balance gains
4. Applying gains to the image
5. Gamma correction `** (1.0 / 2.2)` to return to sRGB

Because postprocessing is omitted entirely, the raw lighting vector is incorrectly assumed to be the final answer.

## 10. Numerical Range Analysis

Samples collected using dummy tensors simulating the worker:
- Output is generally in the range `[0.5, 1.0]` and strictly positive (due to the `F.softplus` activation in the model's final layer). 
- No `NaN` or `Infinity` values observed.
- The values represent raw magnitudes and are not bound to a strict `[0, 1]` range until L2 normalized.

## 11. Frontend ↔ Backend Data Flow

The frontend directly sends the unprocessed output `[outputData[0], outputData[1], outputData[2]]` from the worker as `user_albedo` in the `/match-shade` REST payload. The backend successfully parses this 3-element list.

## 12. Euclidean Matching Compatibility

**CRITICAL FINDING:**
The backend `math_utils.py` computes a 3D Euclidean distance between the provided `user_albedo` and the `Product.true_rgb`. 
Because the frontend is supplying the *room lighting color* instead of the *white-balanced skin color*, the backend is currently matching foundation shades to the color of the user's light bulb. This renders the recommendation fundamentally incorrect.

## 13. Determinism Test

Tested a fixed, constant input image (`128.0` for all pixels):
- **Run 1:** `[0.7282799, 0.8500779, 0.5957037]`
- **Run 2:** `[0.7282799, 0.8500779, 0.5957037]`
- **Absolute Difference:** `[0.0, 0.0, 0.0]`
- **Result:** Pass. The model runs deterministically in the ONNX Runtime.

## 14. Error Handling

- Handled gracefully in `onnxWorker.ts` with a `try/catch` block.
- Errors are propagated back to the main thread via `postMessage({ type: 'error' })` and displayed to the user via the UI state.
- Empty canvas/video frames are protected by `.readyState` checks in the UI loop.

## 15. Performance Measurements

- **Worker Overhead:** Full cycle (message passing, pixel looping, tensor creation, inference, and return) takes ~30-50ms locally.
- The UI mimics 55-60 FPS stream fluidity and displays accurate inference latency via `performance.now()`.

## 16. Findings & Severity Classification

| Finding | Severity | Description |
| :--- | :--- | :--- |
| **Missing Linearization** | MAJOR | Frontend scales pixels by `/ 255.0` but omits the `** 2.2` inverse gamma curve required by the model. |
| **Semantic Mismatch** | CRITICAL | The output is interpreted as "Albedo" when it actually represents "Scene Illumination". |
| **Missing Postprocessing** | CRITICAL | Frontend skips L2 normalization, Von Kries chromatic adaptation (gain application), and gamma correction. |

## 17. Recommended Fixes (For Stage 4.3)

1. **Preprocessing Fix:** Update `onnxWorker.ts` to apply `Math.pow(pixel / 255.0, 2.2)` during tensor construction.
2. **Postprocessing Fix (Worker):** 
   - Apply positive clamping (`Math.max(val, 0.1)`).
   - Compute L2 normalization of the illumination vector.
   - Calculate Von Kries gains.
3. **Albedo Extraction Fix:**
   - Sample the center of the user's face (the center of the input image) to get the raw skin RGB.
   - Apply the calculated gains to the sampled skin RGB.
   - Apply gamma correction `Math.pow(val, 1.0/2.2)` to the corrected skin RGB to produce the final `albedo`.
4. **Handoff:** Return the true, computed `albedo` to the main thread.

## Stage 4.3 — Resolution

The following actions were performed to fix the color constancy pipeline in `onnxWorker.ts`:

1. **Input Preprocessing**: The camera sRGB input is now correctly linearized before inference:
   ```typescript
   float32Data[i] = Math.pow(data[rgbaIdx] / 255.0, 2.2);
   ```
2. **Illumination Normalization**: The raw ONNX illumination vector (`estimated_illumination`) is clamped, L2-normalized, and mean-normalized.
3. **Chromatic Adaptation**: 
   - Von Kries chromatic adaptation gains are computed precisely as: `1.0 / mean_normalized_illuminant`.
   - MediaPipe is now instantiated in the main thread (`TryOnStudio.tsx`) and cheek region pixel coordinates are passed to the worker.
   - The worker samples linear skin RGB values directly from these stable cheek points, averaging them.
   - The adaptation gains are applied to this linear skin RGB.
4. **Postprocessing**: The corrected linear skin RGB is gamma-compressed (`Math.pow(val, 1/2.2)`) and clamped to `[0.0, 1.0]`.
5. **Output Contract**: The frontend-backend contract is restored. The worker now returns the `albedo` (derived skin color) and `illumination` (raw model output). Only `albedo` is sent to the `/api/match-shade` endpoint.

**Pipeline Flow:**
`Camera sRGB` → `Linear RGB` → `ONNX Illumination Estimation` → `Illumination Normalization` → `Chromatic Adaptation` → `MediaPipe Skin Sampling` → `Corrected Linear Skin RGB` → `Gamma Correction` → `Final Skin Albedo` → `Euclidean Foundation Matching`

**Important Notes:**
- `ONNX output != albedo`.
- The ONNX illumination output → derived albedo → backend matching.
