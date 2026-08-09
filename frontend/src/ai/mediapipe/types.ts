import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type QualityLevel = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Lost';

export interface HeadPose {
  yaw: number;
  pitch: number;
  roll: number;
  facingForward: boolean; // Computed flag for customer mode warning
}

export interface FaceScaling {
  faceWidth: number;
  faceHeight: number;
  lipWidth: number;
  lipHeight: number;
  eyeDistance: number;
}

export interface CaptureMetrics {
  lightingScore: number;
  orientationScore: number;
  stabilityScore: number;
  visibilityScore: number;
}

export interface FaceTrackingState {
  landmarks: NormalizedLandmark[] | null;
  isTracking: boolean;
  faceDetected: boolean;
  loading: boolean;
  error: string | null;
  fps: number;
  processingTime: number; // in ms
  lightingQuality: QualityLevel;
  captureQuality: QualityLevel;
  captureScore: number; // 0-100
  captureReady: boolean;
  facesCount: number;
  
  headPose: HeadPose | null;
  faceScaling: FaceScaling | null;
  metrics: CaptureMetrics | null;
  stabilityScore: number;
}
