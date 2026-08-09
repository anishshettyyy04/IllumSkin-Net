import type { FaceGeometry } from './core/GeometryCache';

export type EyeShape = 'Almond' | 'Round' | 'Hooded' | 'Monolid' | 'Deep Set';

export interface EyeShapeResult {
  shape: EyeShape;
  confidence: number;
}

export function estimateEyeShape(faceGeometry: FaceGeometry): EyeShapeResult {
  // Use averaged metrics for robust shape detection
  const eyeWidth = faceGeometry.avgEyeWidth;
  const eyeHeight = faceGeometry.avgEyeHeight;

  // We can analyze the left eye specifically for detailed curve features,
  // assuming left and right are generally similar in structure.
  const leftEye = faceGeometry.leftEye;
  
  if (eyeWidth === 0) return { shape: 'Almond', confidence: 0 };

  const heightToWidthRatio = eyeHeight / eyeWidth;
  
  // Calculate eyelid visibility (distance between upper lid and eyebrow)
  // We use the center points for simplicity
  const upperLidY = leftEye.upperLidCurve[2].y;
  const browY = leftEye.browCurve[2].y;
  // This distance is in normalized coordinates. Multiply by faceHeight for a relative scale.
  const lidToBrowDist = (upperLidY - browY) * faceGeometry.faceHeight;
  
  // Compare lid-to-brow distance relative to eye height
  const lidToBrowRatio = lidToBrowDist / eyeHeight;

  let shape: EyeShape = 'Almond';
  let confidence = 0;

  if (heightToWidthRatio > 0.45) {
    shape = 'Round';
    confidence = Math.min(100, (heightToWidthRatio - 0.45) * 100 * 5);
  } else if (lidToBrowRatio < 0.8) {
    // If the eyebrow is extremely close to the upper lid, it's Hooded or Deep Set.
    // Differentiating Monolid vs Hooded: Monolid often has a flatter arc.
    // Arc height of upper lid:
    const innerY = leftEye.innerCorner.y;
    const outerY = leftEye.outerCorner.y;
    const baselineY = (innerY + outerY) / 2;
    const arcHeight = (baselineY - upperLidY) * faceGeometry.faceHeight;
    
    if (arcHeight < eyeHeight * 0.15) {
      shape = 'Monolid';
      confidence = 85;
    } else {
      shape = 'Hooded';
      confidence = Math.min(100, (0.8 - lidToBrowRatio) * 100 * 3);
    }
  } else if (lidToBrowRatio > 2.0) {
    // Very large gap might indicate Deep Set if accompanied by strong brow protrusion
    // We approximate Deep Set based on a large ratio here for simplicity
    shape = 'Deep Set';
    confidence = 80;
  } else {
    shape = 'Almond';
    // Default ideal shape
    confidence = Math.min(100, 100 - Math.abs(heightToWidthRatio - 0.35) * 100 * 4);
  }

  confidence = Math.round(Math.max(0, Math.min(100, confidence)));

  return { shape, confidence };
}
