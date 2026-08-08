# Stage 4.7 — Renderer Hardening Audit Report

## 1. Executive Summary
A comprehensive read-only static audit of the Virtual Makeup Rendering pipeline (introduced in Stage 4.6) was conducted to verify structural correctness, state management, and coordinate mapping. The overall architecture is very robust: the lifecycle is strictly managed via React refs, the MediaPipe to Canvas coordinate mapping correctly handles `object-cover` scaling and CSS mirroring, and the `RenderScheduler` properly encapsulates the `requestAnimationFrame` (RAF) loop. 

One MAJOR defect was identified regarding face-loss behavior (frozen frame), alongside a few MINOR memory allocation findings within the rendering loop. 

## 2. Engine Lifecycle
- **Creation**: `VirtualMakeupEngine` is instantiated exactly once via `useRef` and `useEffect` on component mount in `TryOnStudio.tsx`. It is correctly protected from React re-renders.
- **Cleanup**: **FINDING (MINOR)** - The `useEffect` cleanup function in `TryOnStudio.tsx` successfully halts the RAF loop (`stopLoop()`) and camera stream, but fails to call `engineRef.current.dispose()`. This means active renderers are not explicitly signaled to dispose of their offscreen WebGL/Canvas contexts.

## 3. CosmeticPreset Propagation
- **Flow**: `BeautyIntelligenceEngine` → `ConsultationResult` → `VirtualMakeupEngine.applyPreset()`.
- **Validation**: `applyPreset()` stores the preset and sets global intensities. 
- **Consumption**: `buildOptionsForRenderer()` successfully passes the correct `shade`, `opacity`, `finish`, and `style` to the Lip, Blush, and Eye renderers. The `foundation` property within the preset is ignored by the engine, which aligns with the architectural rule that Foundation remains a CSS fallback in React. 

## 4. Renderer Registration
- `LipRenderer`, `BlushRenderer`, and `EyeRenderer` are correctly registered strictly once during component initialization.
- The `LAYER_ORDER` (`['Foundation', 'Blush', 'Lip', 'Eye', 'Highlight', 'Contour']`) inside `VirtualMakeupEngine` correctly ensures Blush is rendered before Lip, and Lip before Eye.

## 5. MediaPipe Coordinate Mapping
- **Validation**: MediaPipe returns normalized coordinates [0, 1] mapped to the unmirrored `videoWidth`/`videoHeight` space.
- The renderers correctly scale these normalized coordinates by `canvas.width` and `canvas.height`.
- **Mirroring**: Both the `<video>` and `<canvas>` elements share the exact same CSS classes: `absolute min-w-full min-h-full object-cover transform -scale-x-100`. Therefore, the unmirrored output of the makeup canvas is perfectly flipped by CSS, matching the flipped video exactly. No coordinate drift occurs.

## 6. Canvas Resolution
- The `RenderScheduler` loop correctly updates the internal resolution of `makeupCanvasRef` to match `videoRef.current.videoWidth` and `videoHeight`. This perfectly synchronizes the rendering space with the intrinsic video dimensions.

## 7. RenderScheduler Audit
- **Validation**: `startLoop()` guards against duplicate loops (`if (this.animationFrameId !== null) return;`). 
- `stopLoop()` correctly fires `cancelAnimationFrame`.
- The RAF loop correctly defers to `engine.render()`.

## 8. RAF Loop Safety
- **Validation**: No React state is updated within the RAF loop (e.g., `setSliderPosition` only triggers from user DOM events).
- **FINDING (MINOR)**: `buildOptionsForRenderer` allocates a tiny options object every frame for every active renderer. While V8 handles this easily, it introduces minor garbage collection overhead.
- **FINDING (MINOR)**: `getCtx()` repeatedly calls `canvas.getContext('2d')` inside the loop. This is fast but ideally should be cached.

## 9. Before/After Audit
- **Validation**: The slider uses a standard `<input type="range">`. 
- Dragging it updates `sliderPosition` which maps to a CSS `clip-path` polygon.
- **Safety**: Dragging the slider does NOT re-trigger ONNX inference (the ONNX interval loop is actively cleared upon entering the `RESULTS` state), nor does it reconstruct the engine. 

## 10. Foundation Fallback Audit
- **Validation**: The Foundation fallback remains a `<div className="mix-blend-multiply" />` applying a subtle color tint. It is safely wrapped inside the `clipPath` container alongside the makeup canvas, guaranteeing the slider works synchronously across both cosmetic layers. No `FoundationRenderer` was hallucinated.

## 11. Face-Loss Handling
- **FINDING (MAJOR)**: In `RenderScheduler.ts`, the frame loop logic reads:
  ```typescript
  if (ctx && landmarks) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.renderAll(ctx, landmarks);
  }
  ```
  If `landmarks` becomes null (i.e., the user's face leaves the camera frame), the `clearRect` call is skipped. This causes the last painted frame of makeup (e.g., floating lips/blush) to permanently freeze on the screen until the face returns. 

## 12. Error Handling
- Exceptions inside the RAF loop will terminate the `requestAnimationFrame` chain, freezing the rendering pipeline but preventing cascading React crashes. 
- API failures from `/api/match-shade` are safely caught, surfacing a user-friendly Error UI overlay.

## 13. Performance Audit
- **CRITICAL**: None.
- **MAJOR**: Face-loss frozen frame artifact.
- **MINOR**: Missing `engine.dispose()` on unmount.
- **MINOR**: Per-frame object allocation in `buildOptionsForRenderer`.
- **MINOR**: Repeated `getContext('2d')` inside `RenderScheduler`.

## 14. Regression Audit
- The `addToCart` logic was verified to map `completeLook` properly. No backend/API configurations or AI Math logic were altered. 

## 15. Build Results
- `tsc -b`: PASS (0 errors)
- `vite build`: PASS (0 errors)

## 16. Git Status
- Clean working directory (excluding untracked audit `.md` / `.py` scratch files).

## 17. Recommended Fixes
1. **Fix Face-Loss Artifact**: Move `ctx.clearRect()` outside the `if (landmarks)` guard in `RenderScheduler.ts` so the canvas clears even when no face is present.
2. **Add Cleanup**: Invoke `engineRef.current?.dispose()` inside the `TryOnStudio` cleanup block.

## 18. Final Verdict

STATIC RENDERING: FINDING
BUILD: PASS
BACKEND REGRESSION: PASS
REAL CAMERA/BROWSER: UNVERIFIED
GIT STATUS: CLEAN

## Stage 4.8 Fix Verification

- **Face-loss clearing fix:** FIXED. The `RenderScheduler.ts` loop was successfully refactored to clear the canvas first before evaluating whether `landmarks` are present.
- **Engine disposal fix:** FIXED. Added `engineRef.current?.dispose()` to the `TryOnStudio` unmount cleanup sequence, avoiding leaking active renderers.
- **Canvas context caching:** FIXED. Changed `getCtx()` function callback to `getCanvas()`, and implemented a small context cache inside `RenderScheduler` that updates only if the canvas element changes, avoiding repeated `getContext('2d')` lookups.
- **Options allocation decision:** UNCHANGED. `VirtualMakeupEngine.buildOptionsForRenderer()` was left intentionally unchanged. The allocations are microscopic short-lived objects. Caching them would introduce complex cache invalidation logic across `globalIntensity` and `preset` updates, which is an unnecessary correctness risk relative to the negligible (V8 zero-overhead) performance gains.
- **Build results:** `tsc -b` PASS, `vite build` PASS.
- **Regression results:** PASS.

STATIC RENDERING: PASS
BUILD: PASS
BACKEND REGRESSION: PASS
REAL CAMERA/BROWSER: UNVERIFIED
