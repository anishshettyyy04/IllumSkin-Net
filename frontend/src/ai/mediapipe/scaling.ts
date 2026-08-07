import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { FaceScaling } from './types';

export const calculateFaceScaling = (landmarks: NormalizedLandmark[]): FaceScaling => {
  // Utility for Euclidean distance between two normalized points
  const dist = (p1: NormalizedLandmark, p2: NormalizedLandmark) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 1. Face Width (Left ear edge 234 to Right ear edge 454)
  const faceWidth = dist(landmarks[234], landmarks[454]);

  // 2. Face Height (Top of forehead 10 to chin 152)
  const faceHeight = dist(landmarks[10], landmarks[152]);

  // 3. Lip Width (Left corner 61 to Right corner 291)
  const lipWidth = dist(landmarks[61], landmarks[291]);

  // 4. Lip Height (Top lip center 0 to Bottom lip center 17)
  const lipHeight = dist(landmarks[0], landmarks[17]);

  // 5. Eye Distance (Center of left eye to center of right eye)
  // Left eye center approx 159 & 145 average, Right eye center approx 386 & 374
  const leftEyeCenterX = (landmarks[159].x + landmarks[145].x) / 2;
  const leftEyeCenterY = (landmarks[159].y + landmarks[145].y) / 2;
  const rightEyeCenterX = (landmarks[386].x + landmarks[374].x) / 2;
  const rightEyeCenterY = (landmarks[386].y + landmarks[374].y) / 2;
  
  const dx = leftEyeCenterX - rightEyeCenterX;
  const dy = leftEyeCenterY - rightEyeCenterY;
  const eyeDistance = Math.sqrt(dx * dx + dy * dy);

  return {
    faceWidth,
    faceHeight,
    lipWidth,
    lipHeight,
    eyeDistance
  };
};
