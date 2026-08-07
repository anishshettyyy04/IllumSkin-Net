import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

// Standard MediaPipe Face Mesh Indices

export const REGION_INDICES = {
  FACE_OVAL: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
    400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
    54, 103, 67, 109
  ],
  LIPS: [
    // Outer lip
    61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40,
    // Inner lip
    78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80
  ],
  LEFT_EYE: [
    33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246
  ],
  RIGHT_EYE: [
    362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398
  ],
  LEFT_CHEEK: [
    205, 50, 118, 119, 100, 120, 121, 128, 214
  ],
  RIGHT_CHEEK: [
    425, 280, 347, 348, 329, 349, 350, 357, 434
  ]
};

export const getFaceOval = (landmarks: NormalizedLandmark[]) => {
  return REGION_INDICES.FACE_OVAL.map(index => landmarks[index]);
};

export const getLipLandmarks = (landmarks: NormalizedLandmark[]) => {
  return REGION_INDICES.LIPS.map(index => landmarks[index]);
};

export const getLeftEye = (landmarks: NormalizedLandmark[]) => {
  return REGION_INDICES.LEFT_EYE.map(index => landmarks[index]);
};

export const getRightEye = (landmarks: NormalizedLandmark[]) => {
  return REGION_INDICES.RIGHT_EYE.map(index => landmarks[index]);
};

export const getLeftCheek = (landmarks: NormalizedLandmark[]) => {
  return REGION_INDICES.LEFT_CHEEK.map(index => landmarks[index]);
};

export const getRightCheek = (landmarks: NormalizedLandmark[]) => {
  return REGION_INDICES.RIGHT_CHEEK.map(index => landmarks[index]);
};
