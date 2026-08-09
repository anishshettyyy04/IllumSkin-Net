# STAGE 5.3 — BASELINE FREEZE

This document records the exact state of the algorithm prior to quantitative real-Chrome validation. No visual improvements or algorithmic changes will be made while the validation in Stage 5.3 is underway.

## Configuration & Environment

| Parameter | Value |
| :--- | :--- |
| **ONNX Model Version** | `illumination_estimator.onnx` (Current working model, architecture unchanged from Stage 4) |
| **Frontend Commit** | `7c7e17afc43b76ad0380fa1a30b0d06129c1ba7c` (Stage 5.2 Completion) |
| **Backend Commit** | `7c7e17afc43b76ad0380fa1a30b0d06129c1ba7c` |
| **Selected Foundation** | `[PENDING USER SELECTION]` (e.g. "Fenty Pro Filt'r 290") |
| **Product HEX** | `[PENDING USER SELECTION]` |
| **Browser Version** | `[PENDING USER MEASUREMENT]` (e.g. Google Chrome v116+) |
| **Camera Resolution** | `1280x720` (Requested via `getUserMedia`) |
| **devicePixelRatio** | `[PENDING USER MEASUREMENT]` |

## Algorithmic Pipeline (Frozen)
- **Skin Sampling:** 15% Trimmed Mean across 200+ MediaPipe cheek landmarks.
- **Temporal Stability:** Exponential Moving Average ($\alpha = 0.2$) with Euclidean distance reset trigger ($>0.15$).
- **Colorimetry:** Linear RGB processing space, CIE Standard Illuminant D65, Sharma-compliant CIEDE2000 $\Delta E_{00}$.
- **Masking:** MediaPipe face oval with exact internal exclusion holes for eyes, lips, and eyebrows (using `evenodd` winding rule). Masks $>85\%$ or $<1\%$ area rejected.
- **Compositing:** Default `multiply` operation on HTML5 Canvas.

*Validation will now proceed according to Stage 5.3 Real-Chrome quantitative methodology.*
