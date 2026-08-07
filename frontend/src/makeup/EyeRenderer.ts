import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { RendererBase } from './core/RendererBase';
import { EyeMaskGenerator } from './EyeMask';
import type { EyeStyle } from './EyeMask';
import { BlendEngine } from './BlendEngine';
import type { RenderOptions } from './BlendEngine';
import type { EyeShape } from './eyeShape';
import { GeometryCache } from './core/GeometryCache';

export interface EyeRenderOptions extends RenderOptions {
  style?: EyeStyle;
  faceShapeResult?: { shape: EyeShape, confidence: number };
}

export class EyeRenderer extends RendererBase {
  private maskGenerator: EyeMaskGenerator;
  private blendEngine: BlendEngine;
  private geometryCache: GeometryCache;

  constructor(width: number, height: number) {
    super(width, height);
    this.maskGenerator = new EyeMaskGenerator();
    this.blendEngine = new BlendEngine();
    this.geometryCache = new GeometryCache();
  }

  public render(
    targetCtx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    options: EyeRenderOptions
  ) {
    if (!this.offscreenCtx) return;
    
    const width = this.offscreenCanvas.width;
    const height = this.offscreenCanvas.height;

    // We can use a shared GeometryCache but here we'll just parse it if not passed
    const faceGeo = this.geometryCache.getGeometry(landmarks, width, height);

    // 1. Blink Detection using EAR (Eye Aspect Ratio)
    // Typical threshold for closed eye is around 0.15 - 0.2
    const BLINK_THRESHOLD = 0.18;
    const isLeftEyeOpen = faceGeo.leftEye.ear > BLINK_THRESHOLD;
    const isRightEyeOpen = faceGeo.rightEye.ear > BLINK_THRESHOLD;

    // Clear offscreen canvas
    this.clearOffscreenCanvas();

    const shape = options.faceShapeResult?.confidence && options.faceShapeResult.confidence > 50 
      ? options.faceShapeResult.shape 
      : 'Almond';
    
    const style = options.style || 'Natural';
    const baseColor = options.shade.hex;

    // 2. Compute and Draw Masks for open eyes
    if (isLeftEyeOpen) {
      const leftParams = this.maskGenerator.computeParams(faceGeo, width, height, true, shape, style);
      this.maskGenerator.drawMaskLayers(this.offscreenCtx, leftParams, baseColor);
    }
    
    if (isRightEyeOpen) {
      const rightParams = this.maskGenerator.computeParams(faceGeo, width, height, false, shape, style);
      this.maskGenerator.drawMaskLayers(this.offscreenCtx, rightParams, baseColor);
    }

    // Edge feathering using standard blur before compositing
    if (typeof this.offscreenCtx.filter !== 'undefined') {
      targetCtx.filter = 'blur(2px)';
    }

    // 3. Apply Alpha Blending & Finish Simulation
    this.blendEngine.applyFinish(this.offscreenCtx, width, height, options);

    // 4. Composite back to target canvas based on Finish
    const finish = options.shade.finish;
    if (finish === 'Matte') {
      targetCtx.globalCompositeOperation = 'multiply';
    } else if (finish === 'Satin') {
      targetCtx.globalCompositeOperation = 'soft-light';
    } else if (finish === 'Dewy') {
      targetCtx.globalCompositeOperation = 'overlay';
    } else if (finish === 'Glow') {
      targetCtx.globalCompositeOperation = 'screen';
    } else if (finish === 'Shimmer') {
      targetCtx.globalCompositeOperation = 'screen';
    } else if (finish === 'Metallic') {
      targetCtx.globalCompositeOperation = 'color-dodge'; // Note: BlendEngine handles the complex stack, this is final comp
    } else {
      targetCtx.globalCompositeOperation = 'source-over'; 
    }

    const originalAlpha = targetCtx.globalAlpha;
    targetCtx.drawImage(this.offscreenCanvas, 0, 0);

    // Reset target context
    targetCtx.globalAlpha = originalAlpha;
    targetCtx.globalCompositeOperation = 'source-over';
    targetCtx.filter = 'none';
  }

  public reset() {
    this.geometryCache.reset();
  }
}
