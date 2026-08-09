import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { HeadPose } from './types';

export const calculateHeadPose = (landmarks: NormalizedLandmark[]): HeadPose => {
  // Use key stable landmarks
  const noseTip = landmarks[1];
  const leftEar = landmarks[234];
  const rightEar = landmarks[454];
  const leftEye = landmarks[33]; // Outer corner
  const rightEye = landmarks[263]; // Outer corner
  const chin = landmarks[152];

  // 1. Calculate Yaw
  // Compare horizontal distance from nose tip to ears
  const leftDist = noseTip.x - leftEar.x;
  const rightDist = rightEar.x - noseTip.x;
  // If leftDist is much smaller than rightDist, face is turned left.
  // Normalize between -1 and 1
  let yaw = 0;
  if (leftDist + rightDist > 0) {
    yaw = (rightDist - leftDist) / (leftDist + rightDist);
  }

  // 2. Calculate Pitch
  // Compare vertical ratio of eye-to-nose vs nose-to-chin
  const eyeCenterY = (leftEye.y + rightEye.y) / 2;
  const upperFaceHeight = noseTip.y - eyeCenterY;
  const lowerFaceHeight = chin.y - noseTip.y;
  
  let pitch = 0;
  if (lowerFaceHeight > 0) {
    const ratio = upperFaceHeight / lowerFaceHeight;
    // Base ratio is approx 0.8 to 1.0 when facing forward
    // Normalize roughly to -1 (looking up) to 1 (looking down)
    pitch = (ratio - 0.9) * 2; 
  }

  // 3. Calculate Roll
  // Angle of the line connecting eyes
  const dx = rightEye.x - leftEye.x;
  const dy = rightEye.y - leftEye.y;
  // Normally dy should be 0. We map it to degrees or radians. Let's use radians.
  const roll = Math.atan2(dy, dx);

  // Check if facing forward (tolerance thresholds)
  // Yaw between -0.3 and 0.3, Pitch between -0.5 and 0.5, Roll between -0.2 and 0.2 rads
  const facingForward = 
    Math.abs(yaw) < 0.4 && 
    Math.abs(pitch) < 0.6 && 
    Math.abs(roll) < 0.3;

  return {
    yaw,
    pitch,
    roll,
    facingForward
  };
};

export const getOrientationScore = (pose: HeadPose): number => {
  if (!pose) return 0;
  // Calculate penalty based on deviations
  const yawPenalty = Math.min(1, Math.abs(pose.yaw) / 0.8);
  const pitchPenalty = Math.min(1, Math.abs(pose.pitch) / 1.0);
  const rollPenalty = Math.min(1, Math.abs(pose.roll) / 0.5);
  
  // 100 means perfectly facing forward
  const score = 100 * (1 - (yawPenalty * 0.5 + pitchPenalty * 0.3 + rollPenalty * 0.2));
  return Math.max(0, Math.min(100, score));
};
