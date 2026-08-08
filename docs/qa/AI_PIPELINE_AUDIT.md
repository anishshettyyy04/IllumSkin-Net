# IllumSkin-Net End-to-End AI Pipeline Audit

## Stage 4.1: Model Inventory

### 1. Physical Model Files Identified
- **ONNX Models**:
  - `frontend/public/illumskin_net.onnx`
  - `frontend/dist/illumskin_net.onnx`
  - `weights/illumskin_net.onnx`
- **PyTorch Models**:
  - `weights/best_model.pth`
- **MediaPipe Models**:
  - `frontend/public/models/face_landmarker.task`
- **WASM Binaries**:
  - Located in `frontend/public/wasm/mediapipe/` and `frontend/public/wasm/onnx/`

### 2. Code Initialization Flow
#### MediaPipe Face Tracking
- **Configuration (`frontend/src/ai/mediapipe/config.ts`)**: Loads the Face Landmarker model from `/models/face_landmarker.task`.
- **Status**: Structurally correct. The model file `frontend/public/models/face_landmarker.task` matches this path. The WASM files are loaded from `/wasm/mediapipe`, which maps to `frontend/public/wasm/mediapipe/`.
- **Hook (`frontend/src/hooks/useFaceMesh.ts`)**: Implements `FaceLandmarker.createFromOptions` targeting the GPU delegate and processes video frames iteratively via `requestAnimationFrame`. Contains complex logic to estimate lighting, stability, pose orientation, and visibility scores.

#### IllumSkin-Net Inference
- **Worker (`frontend/src/workers/onnxWorker.ts`)**:
  - WASM path is explicitly set to `/wasm/onnx/`.
  - Attempts to create an `ort.InferenceSession` by requesting the model at `/illumskin_net.onnx`.
- **FIXED — ONNX MODEL PATH MISMATCH**: 
  - **Root cause**: The ONNX model is physically located at `frontend/public/illumskin_net.onnx` (served at `/illumskin_net.onnx`), but the worker originally requested `/models/illumskin_net.onnx`. This mismatch caused a 404 error during WebWorker initialization.
  - **Original path**: `/models/illumskin_net.onnx`
  - **Correct path**: `/illumskin_net.onnx`
  - **Fix applied**: Updated `onnxWorker.ts` to use `/illumskin_net.onnx`.
  - **HTTP 200 verification**: Verified HTTP 200 for model load.
  - **Worker initialization result**: Verified `ort.InferenceSession` initializes successfully.
  - **Actual inference verification**: **FAILED**. Although `session.run()` is reached, the frontend production code passes a 224x224 tensor to the ONNX model, but the model expects 256x256. This triggers an `INVALID_ARGUMENT` ONNXRuntimeError, causing inference to fail.
  - **Model Output Metadata (via isolated test)**: 
    - Input Tensor: `input_frame` (Type: `tensor(float)`, Dims: `[batch_size, 3, 256, 256]`)
    - Output Tensor: `estimated_illumination` (Type: `tensor(float)`, Dims: `[batch_size, 3]`)
  - **Build result**: `npm run build` executed successfully without errors.

### 3. Current Conclusion
- The MediaPipe face tracking pipeline configuration is structurally intact.
- The ONNX inference path mismatch was **fixed**, allowing the model file to load.
- **NEW CRITICAL DEFECT**: Inference fails in production because `onnxWorker.ts` and `TryOnStudio.tsx` construct and pass a 224x224 tensor, but the `illumskin_net.onnx` model was trained and exported for 256x256 inputs.
