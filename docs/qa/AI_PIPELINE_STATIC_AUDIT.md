# Stage 4.4 — AI Pipeline Static & Contract Audit

## Overview
This document represents the final static code and contract verification of the IllumSkin-Net Edge AI Pipeline (Stage 4.4).

## 1. Model Contract
- **Input Name**: `input_frame` (mapped to `session.inputNames[0]`).
- **Tensor Type**: `float32`.
- **Dimensions**: `[1,3,256,256]`.
- **Element Count**: 196,608.
- **Channel Order**: RGB in NCHW layout.

## 2. Preprocessing
- Pixel linearization is strictly adhered to via: `Math.pow(data[idx] / 255.0, 2.2)`.

## 3. Tensor Construction
- `Float32Array(3 * 256 * 256)` is correctly assembled by channel offset (R, then G, then B) mapping continuous blocks.

## 4. ONNX Worker
- Separates `albedo` (skin surface) from `illumination` (ambient light estimation).
- Worker successfully returns both arrays as length 3 `[R,G,B]`.

## 5. Illumination Processing
- Positively clamps values (`Math.max(L, 0.1)`).
- Normalizes by L2 norm (`Math.sqrt(sum_sq)`).
- Normalizes by Mean (`(r+g+b)/3.0`).

## 6. Von Kries Adaptation
- Adaptation gains computed accurately as: `1.0 / mean_normalized_illuminant`.

## 7. Skin Sampling
- Uses MediaPipe left and right cheek landmarks.
- Accurately converts bounding box from MediaPipe coordinates `[0,1]` to precise canvas pixel coordinates `[0, 255]`.
- Strict bounds checking (`x >= 0 && x < 256`) applied before sampling.
- Safely falls back (throws worker error) if no valid skin pixels are detected.

## 8. Gamma Correction
- The adapted linear RGB is correctly re-compressed with `Math.pow(Math.max(0, val), 1.0/2.2)`.
- Values explicitly clamped to `[0,1]`.

## 9. Final Albedo
- Guaranteed to be finite, bounded to `[0,1]`, and precisely 3 elements long.

## 10. Frontend → Backend Contract
- Matches `MatchRequest` perfectly.
- Endpoint `/api/match-shade` receives exactly `albedo: [r,g,b]`.
- Receives correctly typed `APIResponse[MatchResponse]`.

## 11. Euclidean Matching
- `math.sqrt(r_diff**2 + g_diff**2 + b_diff**2)` logic inside `backend/app/core/math_utils.py` perfectly corresponds to the frontend's normalized `[0,1]` 3D color space.

## 12. Recommendation Pipeline
- Data logically flows through `TryOnStudio.tsx` -> `RecommendationService.matchShade` -> `RecommendationService.getCompleteLook` -> `VirtualMakeupEngine`.

## 13. Beauty Intelligence
- Undertone and match percentages cascade cleanly from the foundation object.

## 14. VirtualMakeupEngine
- Receives fully decoupled color coordinates, rendering foundation cleanly without interference from raw illumination.

## 15. Error Handling
- React UI effectively masks worker errors behind the `modelError` state overlay (`Analysis Interrupted`).
- Handles incomplete tensor sizes or inference crashes gracefully.

## 16. Stale-code Search
- No references to `albedo = illumination` or direct array overwriting.
- `jsdelivr` CDN dependencies were purged.
- Stale `224x224` reference exists only as a non-functional comment on line 30 of `onnxWorker.ts`.

## 17. TypeScript Build
- **PASS**: 0 errors.

## 18. Vite Build
- **PASS**: 0 errors.

## 19. Files Inspected
- `frontend/src/workers/onnxWorker.ts`
- `frontend/src/pages/TryOnStudio.tsx`
- `frontend/src/ai/mediapipe/regions.ts`
- `backend/app/api/endpoints/matching.py`
- `backend/app/schemas/matching.py`
- `backend/app/core/math_utils.py`

## 20. Findings
- Only a single stale comment referencing `224x224` remains. All production execution logic is flawlessly constrained to 256x256 operations and the `[0,1]` albedo spectrum. 
- The Playwright tests remained broken; hence the real-browser AI Pipeline verification remains fundamentally `UNVERIFIED`.

## VERDICT

**STATIC AI PIPELINE: PASS**
**REAL BROWSER PIPELINE: UNVERIFIED**
