import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

import { LipRendererConfig } from './config';

export class LandmarkSmoother {
  private previousLandmarks: NormalizedLandmark[] | null = null;

  public smooth(currentLandmarks: NormalizedLandmark[]): NormalizedLandmark[] {
    const alpha = LipRendererConfig.smoothingAlpha;
    
    if (!this.previousLandmarks || this.previousLandmarks.length !== currentLandmarks.length) {
      this.previousLandmarks = [...currentLandmarks];
      return currentLandmarks;
    }

    const smoothed = currentLandmarks.map((current, i) => {
      const prev = this.previousLandmarks![i];
      return {
        x: alpha * current.x + (1 - alpha) * prev.x,
        y: alpha * current.y + (1 - alpha) * prev.y,
        z: current.z ? alpha * current.z + (1 - alpha) * (prev.z || 0) : 0,
        visibility: current.visibility
      };
    });

    this.previousLandmarks = smoothed;
    return smoothed;
  }

  public reset() {
    this.previousLandmarks = null;
  }
}

/**
 * Builds the Lip Mask Path using the evenodd rule to avoid painting teeth.
 */
export const buildLipMaskPath = (
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
) => {
  // Extract Outer and Inner Lip Landmarks using predefined indices
  const outerIndices = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40];
  const innerIndices = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80];

  const outerPoints = outerIndices.map(idx => landmarks[idx]);
  const innerPoints = innerIndices.map(idx => landmarks[idx]);

  ctx.beginPath();

  // Draw Outer Lip (Clockwise/Standard Winding)
  outerPoints.forEach((pt, i) => {
    const x = pt.x * width;
    const y = pt.y * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();

  // Draw Inner Lip (Reverse Winding to create hole)
  const innerReversed = [...innerPoints].reverse();
  innerReversed.forEach((pt, i) => {
    const x = pt.x * width;
    const y = pt.y * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
};
