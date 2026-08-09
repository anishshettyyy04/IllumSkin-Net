import { FilesetResolver } from '@mediapipe/tasks-vision';
import type { FaceLandmarkerOptions } from '@mediapipe/tasks-vision';

export const MEDIAPIPE_CONFIG = {
  // Use local model
  MODEL_PATH: '/models/face_landmarker.task',
  // Options
  OPTIONS: {
    numFaces: 1, // Track up to 1 face for optimal performance
    runningMode: 'VIDEO',
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  } as Partial<FaceLandmarkerOptions>
};

export const createFilesetResolver = async () => {
  // Since we are loading from local or standard tasks-vision CDN for WASM
  return await FilesetResolver.forVisionTasks(
    "/wasm/mediapipe"
  );
};
