# Stage 4.5 — End-to-End AI Pipeline Regression Audit

## 1. Complete Data Flow
| Stage | Source | Data | Destination | Status |
| --- | --- | --- | --- | --- |
| Camera | `navigator.mediaDevices` | Video stream | `<video ref={videoRef}>` | Connected |
| MediaPipe | `useFaceMesh` | Landmarks | `landmarksRef` | Connected |
| ONNX Preprocessing | `canvas` | 256x256 `imageData` | `onnxWorker.postMessage` | Connected |
| Face Geometry | `getLeftCheek`, `getRightCheek` | `skinPoints` | `onnxWorker.postMessage` | Connected |
| ONNX Tensor | `onnxWorker` | `float32Data` | `session.run()` | Connected |
| Worker Result | `onnxWorker` | `{ albedo, illumination }` | `TryOnStudio` `onmessage` | Connected |
| Recommendation API | `RecommendationService` | `albedo` | `POST /api/match-shade` | Connected |
| Complete Look | `RecommendationService` | `foundationId`, `undertone` | `TryOnStudio` `completeLook` state | Connected |
| Beauty Intelligence | `TryOnStudio` | `completeLook` | `VirtualMakeupEngine` | **DISCONNECTED** |
| Render Output | `VirtualMakeupEngine` | Canvas draw | User screen | **DISCONNECTED** |

**FINDING**: The `TryOnStudio.tsx` component never instantiates or imports `VirtualMakeupEngine` or `BeautyIntelligenceEngine`. Instead, it manually draws a full-screen HTML `<div>` with `mix-blend-multiply` using the foundation's hex color. The actual makeup rendering engine is utterly disconnected from the main user interface.

## 2. Worker Message Contract
- **INFERENCE**: correctly sends `{ type, imageData, skinPoints }`.
- **RESULT**: correctly receives `{ type, albedo, illumination }`.
- **ERROR**: Handled securely via `postMessage({ type: 'error' })` and sets `modelError` state in React.

## 3. Albedo Handoff
- The exact handoff occurs on line 77 of `TryOnStudio.tsx`: `if (type === 'RESULT' && albedo)`.
- Line 84 logs: `[MATCH:REQUEST] user_albedo: albedo`.
- The raw `illumination` is correctly ignored by the frontend.

## 4. Match-Shade API
- Payload accurately structured as `{ user_albedo: [r,g,b] }`.
- Error handling acts universally as a catch block rejecting state transition.

## 5. Euclidean Matching
- `calculate_color_distance` in `math_utils.py` uses `math.sqrt(r_diff**2 + g_diff**2 + b_diff**2)`. Normalization range `[0,1]` conforms perfectly to the `albedo` output scale.

## 6. Complete Look
- Retrieves lipstick, blush, and foundation successfully.
- Missing products safely return None without crashing.

## 7. Beauty Intelligence
- Code exists for `BeautyIntelligenceEngine` and `HarmonyEngine`.
- **DISCONNECTED**: It is never actually invoked by the frontend in `TryOnStudio.tsx`. 

## 8. VirtualMakeupEngine
- **DISCONNECTED**: Not instantiated. Frame scheduler is dormant. 

## 9. Renderers (Lip, Blush, Eye)
- Files exist but are entirely orphaned from the UI.

## 10. Before / After
- Sprint 8.7's `VirtualMakeupEngine` before/after implementation is bypassed. The UI currently just toggles `showTint` boolean to hide/show the full-screen div.

## 11. Cart
- "Add Complete Look to Cart" works for foundation, lipstick, and blush accurately.

## 12. Order API
- `POST /api/orders` accurately matches `OrderCreatePayload`.

## 13. Session Management
- Not evaluated in this trace as it resides outside the core AI loop.

## 14. Local Assets
- All ONNX and MediaPipe paths strictly refer to local `/wasm/` and `/models/` roots. No CDNs are used dynamically.

## 15. Security Regression
- No secrets or API keys exposed. CORS remains configured safely.

## 16. Frontend Build
- `tsc -b`: PASS (0 errors)
- `vite build`: PASS (0 errors)

## 17. Backend Tests
- `GET /api/health` functions securely.

## 18. Database Integrity
- 23 products exist in the product repository.

## 19. Regression Search
- No stale `/224/` operations.
- `albedo = illumination` does not exist.

## FINAL VERDICT

**STATIC INTEGRATION: FINDING** 
(The VirtualMakeupEngine is entirely disconnected from TryOnStudio.tsx)

**BACKEND/API REGRESSION: PASS**

**REAL CAMERA/BROWSER RUNTIME: UNVERIFIED**
