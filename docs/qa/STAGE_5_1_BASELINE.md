# STAGE 5.1 BASELINE-V1 RECORD

## 1. Current Mathematical Pipeline

### 1.1 Skin Albedo Sampling (Current)
The current algorithm in `frontend/src/workers/onnxWorker.ts` samples skin using a naive arithmetic mean in linear RGB space.

```javascript
// From onnxWorker.ts
let skinR = 0, skinG = 0, skinB = 0;
let validSamples = 0;

for (const pt of skinPoints) {
  const idx = (pt.y * 256 + pt.x) * 4;
  skinR += Math.pow(data[idx] / 255.0, 2.2);
  skinG += Math.pow(data[idx + 1] / 255.0, 2.2);
  skinB += Math.pow(data[idx + 2] / 255.0, 2.2);
  validSamples++;
}

skinR /= validSamples;
skinG /= validSamples;
skinB /= validSamples;
```

**Output Format:** Linear RGB `[R, G, B]`, which is then Von Kries adapted, gamma corrected, and sent to the server.

### 1.2 Shade Matching Algorithm (Current)
The current matching algorithm in `backend/server.py` uses Euclidean distance in sRGB space.

```python
# From server.py
def color_distance(c1, c2):
    """Euclidean distance in RGB space"""
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

# Match Score Calculation
match_score = max(0.0, min(100.0, 100.0 - (dist / 150.0) * 100.0))
```

**Output Format:** JSON response with `matches` array containing `distance` and `matchPercentage`.

### 1.3 Shade Ranking (Current)
- Products are ranked purely by `color_distance(user_rgb, product["rgb"])` ascending.
- Undertone matching is completely separate (it filters or relies on the top match's undertone, but does not weight the ranking score).

## 2. Weaknesses of Baseline-V1
1. **Sampling:** The arithmetic mean is heavily distorted by specular highlights (e.g., ring light reflections on the cheek) and shadows (e.g., hair occlusion).
2. **Matching:** RGB Euclidean distance fails to account for human visual perception. A small Euclidean distance in dark shades is highly noticeable, while the same distance in light shades is imperceptible.
3. **Color Space:** The product catalog's RGB values are assumed to be sRGB. Comparing a gamma-corrected sRGB camera albedo directly to product sRGB hex codes via Euclidean distance breaks linearity and uniformity.
