import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { FaceShape } from './faceShape';
import { GeometryCache, } from './core/GeometryCache';
import { LipRendererConfig } from './config';

export type BlushStyle = 'Natural' | 'Lifted' | 'Circular' | 'Draped' | 'Sculpt';

export interface BlushMaskParams {
  leftCenter: { x: number, y: number };
  rightCenter: { x: number, y: number };
  radiusX: number;
  radiusY: number;
  rotation: number; // in radians
  opacityMultiplier: number;
}

export class BlushSmoother {
  private previousParams: BlushMaskParams | null = null;

  public smooth(current: BlushMaskParams): BlushMaskParams {
    const alpha = LipRendererConfig.smoothingAlpha; // e.g., 0.7

    if (!this.previousParams) {
      this.previousParams = { ...current };
      return current;
    }

    const prev = this.previousParams;
    const smoothed: BlushMaskParams = {
      leftCenter: {
        x: alpha * current.leftCenter.x + (1 - alpha) * prev.leftCenter.x,
        y: alpha * current.leftCenter.y + (1 - alpha) * prev.leftCenter.y,
      },
      rightCenter: {
        x: alpha * current.rightCenter.x + (1 - alpha) * prev.rightCenter.x,
        y: alpha * current.rightCenter.y + (1 - alpha) * prev.rightCenter.y,
      },
      radiusX: alpha * current.radiusX + (1 - alpha) * prev.radiusX,
      radiusY: alpha * current.radiusY + (1 - alpha) * prev.radiusY,
      rotation: alpha * current.rotation + (1 - alpha) * prev.rotation,
      opacityMultiplier: alpha * current.opacityMultiplier + (1 - alpha) * prev.opacityMultiplier,
    };

    this.previousParams = smoothed;
    return smoothed;
  }

  public reset() {
    this.previousParams = null;
  }
}

export class BlushMaskGenerator {
  private smoother: BlushSmoother;
  private geometryCache: GeometryCache;

  constructor() {
    this.smoother = new BlushSmoother();
    this.geometryCache = new GeometryCache();
  }

  public computeParams(
    landmarks: NormalizedLandmark[],
    width: number,
    height: number,
    faceShape: FaceShape,
    style: BlushStyle
  ): BlushMaskParams {
    const geo = this.geometryCache.getGeometry(landmarks, width, height);

    // 1. Base Cheek Landmarks
    let leftX = geo.leftCheekCenter.x * width;
    let leftY = geo.leftCheekCenter.y * height;
    
    let rightX = geo.rightCheekCenter.x * width;
    let rightY = geo.rightCheekCenter.y * height;

    // Base Radius relative to face width
    let rX = geo.faceWidth * 0.2;
    let rY = geo.faceWidth * 0.15;
    let rotation = 0;
    let opacityMultiplier = 1.0;

    // 2. FaceShapeOffset
    switch (faceShape) {
      case 'Round':
        // Higher placement to elongate face
        leftY -= geo.faceHeight * 0.05;
        rightY -= geo.faceHeight * 0.05;
        break;
      case 'Long':
        // Centered and more horizontal
        rX *= 1.2;
        break;
      case 'Square':
        // Softer outer blending (push outward slightly)
        leftX -= geo.faceWidth * 0.02;
        rightX += geo.faceWidth * 0.02;
        break;
      case 'Heart':
        // Lower on the apples
        leftY += geo.faceHeight * 0.02;
        rightY += geo.faceHeight * 0.02;
        break;
      case 'Oval':
      default:
        // Default placement is ideal
        break;
    }

    // 3. StyleOffset
    switch (style) {
      case 'Lifted':
        // Pull diagonally towards temples
        leftX -= geo.faceWidth * 0.05;
        leftY -= geo.faceHeight * 0.05;
        rightX += geo.faceWidth * 0.05;
        rightY -= geo.faceHeight * 0.05;
        rotation = Math.PI / 6; // 30 degrees
        rX *= 1.1;
        break;
      case 'Circular':
        // Apples of cheeks, rounder
        leftX += geo.faceWidth * 0.03; // move inward
        rightX -= geo.faceWidth * 0.03;
        rX = geo.faceWidth * 0.15;
        rY = geo.faceWidth * 0.15;
        break;
      case 'Draped':
        // High temples to cheeks (80s style)
        leftX -= geo.faceWidth * 0.08;
        leftY -= geo.faceHeight * 0.08;
        rightX += geo.faceWidth * 0.08;
        rightY -= geo.faceHeight * 0.08;
        rX *= 1.3;
        rotation = Math.PI / 4;
        break;
      case 'Sculpt':
        // Under cheekbones
        leftY += geo.faceHeight * 0.04;
        rightY += geo.faceHeight * 0.04;
        rY *= 0.7; // thinner
        rotation = Math.PI / 8;
        break;
      case 'Natural':
      default:
        break;
    }

    // Smooth the parameters
    return this.smoother.smooth({
      leftCenter: { x: leftX, y: leftY },
      rightCenter: { x: rightX, y: rightY },
      radiusX: rX,
      radiusY: rY,
      rotation,
      opacityMultiplier
    });
  }

  public drawMask(
    ctx: CanvasRenderingContext2D,
    params: BlushMaskParams
  ) {
    ctx.fillStyle = '#FFFFFF';

    // Left Cheek
    ctx.save();
    ctx.translate(params.leftCenter.x, params.leftCenter.y);
    ctx.rotate(params.rotation); // positive rotation for left side goes outwards/upwards if lifted
    ctx.beginPath();
    ctx.ellipse(0, 0, params.radiusX, params.radiusY, 0, 0, 2 * Math.PI);
    
    // Create radial gradient for soft edges
    const gradL = ctx.createRadialGradient(0, 0, 0, 0, 0, params.radiusX);
    gradL.addColorStop(0, `rgba(255, 255, 255, ${params.opacityMultiplier})`);
    gradL.addColorStop(0.5, `rgba(255, 255, 255, ${params.opacityMultiplier * 0.8})`);
    gradL.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradL;
    ctx.fill();
    ctx.restore();

    // Right Cheek
    ctx.save();
    ctx.translate(params.rightCenter.x, params.rightCenter.y);
    ctx.rotate(-params.rotation); // mirrored rotation for right side
    ctx.beginPath();
    ctx.ellipse(0, 0, params.radiusX, params.radiusY, 0, 0, 2 * Math.PI);
    
    const gradR = ctx.createRadialGradient(0, 0, 0, 0, 0, params.radiusX);
    gradR.addColorStop(0, `rgba(255, 255, 255, ${params.opacityMultiplier})`);
    gradR.addColorStop(0.5, `rgba(255, 255, 255, ${params.opacityMultiplier * 0.8})`);
    gradR.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradR;
    ctx.fill();
    ctx.restore();
  }

  public reset() {
    this.smoother.reset();
    this.geometryCache.reset();
  }
}
