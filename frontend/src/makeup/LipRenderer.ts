import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { LandmarkSmoother, buildLipMaskPath } from './LipMask';
import { BlendEngine } from './BlendEngine';
import type { RenderOptions } from './BlendEngine';
import { LipRendererConfig } from './config';
import { RendererBase } from './core/RendererBase';

export class LipRenderer extends RendererBase {
  private smoother: LandmarkSmoother;
  private blendEngine: BlendEngine;

  constructor(width: number, height: number) {
    super(width, height);
    this.smoother = new LandmarkSmoother();
    this.blendEngine = new BlendEngine();
  }

  public render(
    targetCtx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    options: RenderOptions
  ) {
    if (!this.offscreenCtx) return;
    
    const width = this.offscreenCanvas.width;
    const height = this.offscreenCanvas.height;

    // Clear offscreen canvas
    this.clearOffscreenCanvas();

    // 1. Smooth Landmarks
    const smoothedLandmarks = this.smoother.smooth(landmarks);

    // 2. Build Lip Mask
    // We fill with solid white to create the base mask
    this.offscreenCtx.fillStyle = '#FFFFFF';
    buildLipMaskPath(this.offscreenCtx, smoothedLandmarks, width, height);
    this.offscreenCtx.fill('evenodd');

    // 3. Apply Alpha Blending & Finish Simulation
    this.blendEngine.applyFinish(this.offscreenCtx, width, height, options);

    // 4. Subtle Feathering via Off-screen Compositing
    const featherRadius = LipRendererConfig.featherRadius;
    if (featherRadius > 0 && typeof this.offscreenCtx.filter !== 'undefined') {
      targetCtx.filter = `blur(${featherRadius}px)`;
    }

    // 5. Composite back to target canvas
    if (options.shade.finish === 'Matte') {
      targetCtx.globalCompositeOperation = 'multiply';
    } else {
      targetCtx.globalCompositeOperation = 'source-over'; 
    }

    targetCtx.drawImage(this.offscreenCanvas, 0, 0);

    // Reset target context
    targetCtx.filter = 'none';
    targetCtx.globalCompositeOperation = 'source-over';
  }

  // Backwards compatibility for TryOnStudio
  public renderLipstick(targetCtx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], options: RenderOptions) {
    this.render(targetCtx, landmarks, options);
  }

  public reset() {
    this.smoother.reset();
  }
}
