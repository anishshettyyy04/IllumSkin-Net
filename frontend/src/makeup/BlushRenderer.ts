import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { RendererBase } from './core/RendererBase';
import { BlushMaskGenerator } from './BlushMask';
import type { BlushStyle } from './BlushMask';
import { BlendEngine } from './BlendEngine';
import type { RenderOptions } from './BlendEngine';
import type { FaceShape } from './faceShape';

export interface BlushRenderOptions extends RenderOptions {
  style?: BlushStyle;
  faceShape?: FaceShape;
}

export class BlushRenderer extends RendererBase {
  private maskGenerator: BlushMaskGenerator;
  private blendEngine: BlendEngine;

  constructor(width: number, height: number) {
    super(width, height);
    this.maskGenerator = new BlushMaskGenerator();
    this.blendEngine = new BlendEngine();
  }

  public render(
    targetCtx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    options: BlushRenderOptions
  ) {
    if (!this.offscreenCtx) return;
    
    const width = this.offscreenCanvas.width;
    const height = this.offscreenCanvas.height;

    // Clear offscreen canvas
    this.clearOffscreenCanvas();

    // 1. Compute Mask Parameters
    const params = this.maskGenerator.computeParams(
      landmarks,
      width,
      height,
      options.faceShape || 'Oval',
      options.style || 'Natural'
    );

    // 2. Draw Blush Mask
    this.maskGenerator.drawMask(this.offscreenCtx, params);

    // 3. Apply Alpha Blending & Finish Simulation
    this.blendEngine.applyFinish(this.offscreenCtx, width, height, options);

    // 4. Composite back to target canvas
    if (options.shade.finish === 'Matte') {
      targetCtx.globalCompositeOperation = 'multiply';
    } else if (options.shade.finish === 'Satin') {
      targetCtx.globalCompositeOperation = 'soft-light';
    } else if (options.shade.finish === 'Dewy') {
      targetCtx.globalCompositeOperation = 'overlay';
    } else if (options.shade.finish === 'Glow') {
      targetCtx.globalCompositeOperation = 'screen'; // Use screen for glow as per instruction
    } else {
      targetCtx.globalCompositeOperation = 'source-over'; 
    }

    // A subtle global alpha is useful for blush since it shouldn't be as opaque as lipstick
    const originalAlpha = targetCtx.globalAlpha;
    // We already handled opacity in the mask gradient and applyFinish, but we can tone down overall here if needed
    // However, keeping it at 1.0 ensures we respect the shader's opacity
    targetCtx.drawImage(this.offscreenCanvas, 0, 0);

    // Reset target context
    targetCtx.globalAlpha = originalAlpha;
    targetCtx.globalCompositeOperation = 'source-over';
  }

  public reset() {
    this.maskGenerator.reset();
  }
}
