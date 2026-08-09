import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type FaceQualityState = 
  | 'NO_FACE'
  | 'TOO_FAR'
  | 'TOO_CLOSE'
  | 'OFF_CENTER'
  | 'FACE_TILTED'
  | 'MULTIPLE_FACES'
  | 'READY';

export interface FaceQualityConfig {
  minFaceWidth: number;
  maxFaceWidth: number;
  minFaceHeight: number;
  maxFaceHeight: number;
  centerToleranceX: number;
  centerToleranceY: number;
  maxYaw: number;
  maxPitch: number;
  maxRoll: number;
}

const DEFAULT_CONFIG: FaceQualityConfig = {
  minFaceWidth: 0.15,
  maxFaceWidth: 0.85,
  minFaceHeight: 0.20,
  maxFaceHeight: 0.85,
  centerToleranceX: 0.35,
  centerToleranceY: 0.35,
  maxYaw: 20,
  maxPitch: 20,
  maxRoll: 15
};

export function assessFaceQuality(
  landmarks: NormalizedLandmark[] | null,
  facesCount: number,
  headPose: { pitch: number; yaw: number; roll: number } | null,
  config: Partial<FaceQualityConfig> = {}
): FaceQualityState {
  
  if (facesCount === 0 || !landmarks) {
    return 'NO_FACE';
  }

  if (facesCount > 1) {
    return 'MULTIPLE_FACES';
  }

  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Calculate Bounding Box
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const lm of landmarks) {
    if (lm.x < minX) minX = lm.x;
    if (lm.x > maxX) maxX = lm.x;
    if (lm.y < minY) minY = lm.y;
    if (lm.y > maxY) maxY = lm.y;
  }

  const faceWidth = maxX - minX;
  const faceHeight = maxY - minY;
  const faceCenterX = minX + faceWidth / 2;
  const faceCenterY = minY + faceHeight / 2;

  // 1. Check Distance
  if (faceWidth < cfg.minFaceWidth || faceHeight < cfg.minFaceHeight) {
    return 'TOO_FAR';
  }
  if (faceWidth > cfg.maxFaceWidth || faceHeight > cfg.maxFaceHeight) {
    return 'TOO_CLOSE';
  }

  // 2. Check Centering
  const dx = Math.abs(faceCenterX - 0.5);
  const dy = Math.abs(faceCenterY - 0.5);
  if (dx > cfg.centerToleranceX || dy > cfg.centerToleranceY) {
    return 'OFF_CENTER';
  }

  // 3. Check Head Pose
  if (headPose) {
    if (
      Math.abs(headPose.yaw) > cfg.maxYaw || 
      Math.abs(headPose.pitch) > cfg.maxPitch || 
      Math.abs(headPose.roll) > cfg.maxRoll
    ) {
      return 'FACE_TILTED';
    }
  }

  return 'READY';
}
