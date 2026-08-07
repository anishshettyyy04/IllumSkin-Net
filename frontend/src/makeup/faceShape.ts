import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type FaceShape = 'Oval' | 'Round' | 'Square' | 'Heart' | 'Long';

export interface FaceShapeResult {
  shape: FaceShape;
  confidence: number;
}

export function estimateFaceShape(
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
): FaceShapeResult {
  if (!landmarks || landmarks.length < 468) {
    return { shape: 'Oval', confidence: 0 };
  }

  // 1. Get Measurements
  // Forehead width (using temples)
  const leftTemple = landmarks[162];
  const rightTemple = landmarks[389];
  
  // Cheekbone width
  const leftCheekbone = landmarks[234];
  const rightCheekbone = landmarks[454];
  
  // Jawline width
  const leftJaw = landmarks[132];
  const rightJaw = landmarks[361];
  
  // Face Length (chin to hairline)
  const topHairline = landmarks[10];
  const chin = landmarks[152];

  // Helper to compute distance
  const dist = (p1: NormalizedLandmark, p2: NormalizedLandmark) => {
    const dx = (p2.x - p1.x) * width;
    const dy = (p2.y - p1.y) * height;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const foreheadW = dist(leftTemple, rightTemple);
  const cheekboneW = dist(leftCheekbone, rightCheekbone);
  const jawW = dist(leftJaw, rightJaw);
  const faceL = dist(topHairline, chin);

  // 2. Classify Shape based on proportions
  // Typical heuristic algorithm
  let shape: FaceShape = 'Oval';
  let confidence = 0;

  const lengthToWidthRatio = faceL / cheekboneW;
  
  if (lengthToWidthRatio > 1.45) {
    shape = 'Long';
    // Confidence based on how close to ideal "Long" ratio
    confidence = Math.min(100, Math.max(0, (lengthToWidthRatio - 1.45) * 100 * 2));
  } else if (jawW > cheekboneW * 0.9 && foreheadW > cheekboneW * 0.9) {
    shape = 'Square';
    confidence = 85; // Heuristic
  } else if (foreheadW > cheekboneW * 1.05 && jawW < cheekboneW * 0.85) {
    shape = 'Heart';
    confidence = 90; // Strong taper
  } else if (lengthToWidthRatio < 1.15) {
    shape = 'Round';
    confidence = Math.min(100, Math.max(0, (1.15 - lengthToWidthRatio) * 100 * 3));
  } else {
    shape = 'Oval';
    // Default ideal shape
    confidence = Math.min(100, Math.max(0, 100 - Math.abs(lengthToWidthRatio - 1.3) * 100 * 2));
  }

  // Normalize confidence to 0-100 range and round
  confidence = Math.round(confidence);
  if (confidence < 0) confidence = 0;
  if (confidence > 100) confidence = 100;

  return { shape, confidence };
}
