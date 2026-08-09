import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface EyeGeometry {
  upperLidCurve: NormalizedLandmark[];
  lowerLidCurve: NormalizedLandmark[];
  browCurve: NormalizedLandmark[];
  outerCorner: NormalizedLandmark;
  innerCorner: NormalizedLandmark;
  width: number;
  height: number;
  angle: number;
  ear: number; // Eye Aspect Ratio
}

export interface FaceGeometry {
  faceWidth: number;
  faceHeight: number;
  lipWidth: number;
  eyeDistance: number;
  leftCheekCenter: { x: number, y: number, z: number };
  rightCheekCenter: { x: number, y: number, z: number };
  leftEye: EyeGeometry;
  rightEye: EyeGeometry;
  avgEyeWidth: number;
  avgEyeHeight: number;
  avgEyeAngle: number;
}

export class GeometryCache {
  private lastUpdate: number = 0;
  private cachedGeometry: FaceGeometry | null = null;
  private UPDATE_THRESHOLD_MS = 200; // Update cache every 200ms or based on significant movement

  public getGeometry(landmarks: NormalizedLandmark[], width: number, height: number, forceUpdate = false): FaceGeometry {
    const now = performance.now();
    if (!this.cachedGeometry || forceUpdate || (now - this.lastUpdate > this.UPDATE_THRESHOLD_MS)) {
      this.cachedGeometry = this.computeGeometry(landmarks, width, height);
      this.lastUpdate = now;
    }
    return this.cachedGeometry;
  }

  private computeEyeGeometry(
    landmarks: NormalizedLandmark[], 
    width: number, 
    height: number, 
    isLeft: boolean
  ): EyeGeometry {
    // Left eye (user's right) / Right eye (user's left) standard indices
    const upperLidIndices = isLeft ? [157, 158, 159, 160, 161] : [384, 385, 386, 387, 388];
    const lowerLidIndices = isLeft ? [154, 153, 145, 144, 163] : [381, 380, 374, 373, 390];
    const browIndices = isLeft ? [46, 52, 65, 55, 107] : [276, 282, 295, 285, 336];
    
    // Corners
    const innerCornerIdx = isLeft ? 133 : 362;
    const outerCornerIdx = isLeft ? 33 : 263;

    const innerCorner = landmarks[innerCornerIdx];
    const outerCorner = landmarks[outerCornerIdx];

    const dx = (outerCorner.x - innerCorner.x) * width;
    const dy = (outerCorner.y - innerCorner.y) * height;
    const eyeWidth = Math.sqrt(dx * dx + dy * dy);
    
    // Angle of the eye line
    const angle = Math.atan2(dy, dx);

    // Vertical landmarks for height/EAR
    const p2Idx = upperLidIndices[1];
    const p3Idx = upperLidIndices[3];
    const p6Idx = lowerLidIndices[3];
    const p5Idx = lowerLidIndices[1];

    const p1 = innerCorner;
    const p4 = outerCorner;
    const p2 = landmarks[p2Idx];
    const p3 = landmarks[p3Idx];
    const p5 = landmarks[p5Idx];
    const p6 = landmarks[p6Idx];

    const dist = (a: NormalizedLandmark, b: NormalizedLandmark) => {
      const x = (a.x - b.x) * width;
      const y = (a.y - b.y) * height;
      return Math.sqrt(x * x + y * y);
    };

    const h1 = dist(p2, p6);
    const h2 = dist(p3, p5);
    const w = dist(p1, p4);

    const ear = (h1 + h2) / (2.0 * w);
    const eyeHeight = (h1 + h2) / 2.0;

    return {
      upperLidCurve: upperLidIndices.map(i => landmarks[i]),
      lowerLidCurve: lowerLidIndices.map(i => landmarks[i]),
      browCurve: browIndices.map(i => landmarks[i]),
      innerCorner,
      outerCorner,
      width: eyeWidth,
      height: eyeHeight,
      angle,
      ear
    };
  }

  private computeGeometry(landmarks: NormalizedLandmark[], width: number, height: number): FaceGeometry {
    // MediaPipe Landmark Indices
    const leftCheekIdx = 234;  // rough left cheek boundary
    const rightCheekIdx = 454; // rough right cheek boundary
    const topIdx = 10;         // top of face
    const bottomIdx = 152;       // chin

    const leftLip = 61;
    const rightLip = 291;
    
    // Centers of eyes for eyeDistance
    const leftEyeIdx = 159;
    const rightEyeIdx = 386;

    const leftCheekCenterIdx = 116; 
    const rightCheekCenterIdx = 345;

    const dxFace = (landmarks[rightCheekIdx].x - landmarks[leftCheekIdx].x) * width;
    const dyFace = (landmarks[rightCheekIdx].y - landmarks[leftCheekIdx].y) * height;
    const faceWidth = Math.sqrt(dxFace * dxFace + dyFace * dyFace);

    const dxHeight = (landmarks[bottomIdx].x - landmarks[topIdx].x) * width;
    const dyHeight = (landmarks[bottomIdx].y - landmarks[topIdx].y) * height;
    const faceHeight = Math.sqrt(dxHeight * dxHeight + dyHeight * dyHeight);

    const dxLip = (landmarks[rightLip].x - landmarks[leftLip].x) * width;
    const dyLip = (landmarks[rightLip].y - landmarks[leftLip].y) * height;
    const lipWidth = Math.sqrt(dxLip * dxLip + dyLip * dyLip);

    const dxEye = (landmarks[rightEyeIdx].x - landmarks[leftEyeIdx].x) * width;
    const dyEye = (landmarks[rightEyeIdx].y - landmarks[leftEyeIdx].y) * height;
    const eyeDistance = Math.sqrt(dxEye * dxEye + dyEye * dyEye);

    const leftEye = this.computeEyeGeometry(landmarks, width, height, true);
    const rightEye = this.computeEyeGeometry(landmarks, width, height, false);

    // Averages for symmetry normalization
    const avgEyeWidth = (leftEye.width + rightEye.width) / 2;
    const avgEyeHeight = (leftEye.height + rightEye.height) / 2;
    
    // For angle, we average the absolute angles or just keep them symmetric
    // Usually right eye angle is negated (mirrored) relative to left eye.
    // Right eye angle might be roughly PI - leftEyeAngle, or similar.
    // To normalize, we can just use the left eye's angle magnitude.
    const avgEyeAngle = (Math.abs(leftEye.angle) + Math.abs(Math.PI - Math.abs(rightEye.angle))) / 2;

    return {
      faceWidth,
      faceHeight,
      lipWidth,
      eyeDistance,
      leftCheekCenter: landmarks[leftCheekCenterIdx],
      rightCheekCenter: landmarks[rightCheekCenterIdx],
      leftEye,
      rightEye,
      avgEyeWidth,
      avgEyeHeight,
      avgEyeAngle
    };
  }

  public reset() {
    this.cachedGeometry = null;
    this.lastUpdate = 0;
  }
}
