import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export const FOUNDATION_MASK_CONFIG = {
  featherRadius: 6, // configurable feather radius in pixels
};

// Standard MediaPipe FaceMesh Face Oval (Outer Boundary)
const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
];

// Left Eye
const LEFT_EYE_INDICES = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246
];

// Right Eye
const RIGHT_EYE_INDICES = [
  362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398
];

// Outer Lips
const LIPS_INDICES = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95
];

// Left Eyebrow (Lower and Upper)
const LEFT_EYEBROW_INDICES = [
  46, 53, 52, 65, 55, 70, 63, 105, 66, 107
];

// Right Eyebrow (Lower and Upper)
const RIGHT_EYEBROW_INDICES = [
  276, 283, 282, 295, 285, 300, 293, 334, 296, 336
];

/**
 * Draws a polygon onto the provided context based on landmark indices.
 */
function drawPolygon(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  indices: number[],
  width: number,
  height: number
) {
  if (indices.length === 0) return;
  
  ctx.moveTo(landmarks[indices[0]].x * width, landmarks[indices[0]].y * height);
  for (let i = 1; i < indices.length; i++) {
    const pt = landmarks[indices[i]];
    ctx.lineTo(pt.x * width, pt.y * height);
  }
  ctx.closePath();
}

/**
 * Calculates the area of a polygon defined by normalized landmarks using the Shoelace formula.
 * Returns the area as a ratio of the total image area (i.e. from 0.0 to 1.0).
 */
function getPolygonAreaRatio(
  landmarks: NormalizedLandmark[],
  indices: number[]
): number {
  if (indices.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < indices.length; i++) {
    const j = (i + 1) % indices.length;
    const pt1 = landmarks[indices[i]];
    const pt2 = landmarks[indices[j]];
    area += pt1.x * pt2.y - pt2.x * pt1.y;
  }
  return Math.abs(area) / 2.0;
}

/**
 * Builds the complete facial skin mask (using `evenodd` fill rule)
 * which encompasses the face oval but punches out holes for the eyes, lips, and eyebrows.
 */
export function buildFoundationMaskPath(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
): boolean {
  // Calculate Areas
  const faceAreaRatio = getPolygonAreaRatio(landmarks, FACE_OVAL_INDICES);
  const excludedEyeArea = getPolygonAreaRatio(landmarks, LEFT_EYE_INDICES) + getPolygonAreaRatio(landmarks, RIGHT_EYE_INDICES);
  const excludedLipArea = getPolygonAreaRatio(landmarks, LIPS_INDICES);
  const excludedBrowArea = getPolygonAreaRatio(landmarks, LEFT_EYEBROW_INDICES) + getPolygonAreaRatio(landmarks, RIGHT_EYEBROW_INDICES);
  
  const maskAreaRatio = faceAreaRatio - (excludedEyeArea + excludedLipArea + excludedBrowArea);
  const maskToFaceRatio = faceAreaRatio > 0 ? maskAreaRatio / faceAreaRatio : 0;
  
  console.log("[TRYON:FOUNDATION:MASK_AUDIT]", {
    faceAreaRatio,
    maskAreaRatio,
    maskToFaceRatio,
    excludedEyeArea,
    excludedLipArea,
    excludedBrowArea,
    featherRadius: FOUNDATION_MASK_CONFIG.featherRadius
  });
  
  console.log("[TRYON:FOUNDATION:OCCLUSION]", {
    glassesDetected: "UNAVAILABLE",
    confidence: 0,
    glassesAreaRatio: 0,
    excludedAreaRatio: excludedEyeArea + excludedLipArea + excludedBrowArea
  });
  
  // Reject obviously invalid masks
  // A normal face takes up a reasonable portion of the screen but not >90% normally, 
  // and the mask itself shouldn't be negative or too large.
  if (faceAreaRatio > 0.85 || faceAreaRatio < 0.01) {
    console.warn("FoundationMask rejected: faceAreaRatio out of bounds", faceAreaRatio);
    return false;
  }
  
  if (maskToFaceRatio < 0.5) {
    console.warn("FoundationMask rejected: maskToFaceRatio too low", maskToFaceRatio);
    return false;
  }

  ctx.beginPath();
  
  // 1. Draw the outer face boundary
  drawPolygon(ctx, landmarks, FACE_OVAL_INDICES, width, height);
  
  // 2. Draw exclusion boundaries (these act as 'holes' due to evenodd fill rule)
  drawPolygon(ctx, landmarks, LEFT_EYE_INDICES, width, height);
  drawPolygon(ctx, landmarks, RIGHT_EYE_INDICES, width, height);
  drawPolygon(ctx, landmarks, LIPS_INDICES, width, height);
  drawPolygon(ctx, landmarks, LEFT_EYEBROW_INDICES, width, height);
  drawPolygon(ctx, landmarks, RIGHT_EYEBROW_INDICES, width, height);
  
  
  return true;
}

export function drawDebugFoundationMask(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
) {
  // Face Oval
  ctx.beginPath();
  drawPolygon(ctx, landmarks, FACE_OVAL_INDICES, width, height);
  ctx.fillStyle = 'rgba(255, 255, 0, 0.3)'; // Yellow for skin
  ctx.fill();

  // Eyes
  ctx.beginPath();
  drawPolygon(ctx, landmarks, LEFT_EYE_INDICES, width, height);
  drawPolygon(ctx, landmarks, RIGHT_EYE_INDICES, width, height);
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Red for eyes
  ctx.fill();

  // Lips
  ctx.beginPath();
  drawPolygon(ctx, landmarks, LIPS_INDICES, width, height);
  ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'; // Blue for lips
  ctx.fill();

  // Eyebrows
  ctx.beginPath();
  drawPolygon(ctx, landmarks, LEFT_EYEBROW_INDICES, width, height);
  drawPolygon(ctx, landmarks, RIGHT_EYEBROW_INDICES, width, height);
  ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // Green for eyebrows
  ctx.fill();
}
