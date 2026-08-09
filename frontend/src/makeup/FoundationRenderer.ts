import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { buildFoundationMaskPath, FOUNDATION_MASK_CONFIG, drawDebugFoundationMask } from './FoundationMask';
import { RendererBase } from './core/RendererBase';
import { hexToRgb } from './colorUtils';

export interface FoundationRenderOptions {
  hex: string;
  opacity?: number;
  compositeMode?: GlobalCompositeOperation;
}

export class FoundationRenderer extends RendererBase {
  constructor(width: number, height: number) {
    super(width, height);
  }

  public render(
    targetCtx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    options: FoundationRenderOptions
  ) {
    if (!this.offscreenCtx) return;
    
    const width = this.offscreenCanvas.width;
    const height = this.offscreenCanvas.height;
    
    // 1. Validate Color
    const rgb = hexToRgb(options.hex);
    if (!rgb) {
      console.error(`[TRYON:COLOR:ERROR] Invalid Foundation HEX: "${options.hex}"`);
      return;
    }

    // 2. Clear offscreen canvas
    this.clearOffscreenCanvas();

    // 3. Build Foundation Skin Mask
    this.offscreenCtx.fillStyle = '#FFFFFF';
    const isValidMask = buildFoundationMaskPath(this.offscreenCtx, landmarks, width, height);
    if (!isValidMask) {
      return; // Abort rendering if mask is completely invalid
    }
    this.offscreenCtx.fill('evenodd');

    // 4. Transform toward target foundation color (Luminance preserving via composite)
    const strength = options.opacity ?? 0.35;
    
    console.log('[TRYON:FOUNDATION:COLOR]', {
      sourceHex: options.hex,
      targetRgb: rgb,
      strength
    });

    console.log('[TRYON:FOUNDATION:COLOR_TRACE]', {
      sourceHex: options.hex,
      sourceSRGB: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      sourceLinearRGB: 'Calculated in backend / Not used in Canvas natively',
      targetAlbedoLinearRGB: 'Calculated in ONNX / Backend',
      targetAlbedoSRGB: 'Provided by Camera feed natively',
      compositeOperation: options.compositeMode || 'multiply',
      rendererStrength: strength,
      finalRGBA: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${strength})`
    });

    console.log('[TRYON:FOUNDATION:MASK]', {
      maskWidth: width,
      maskHeight: height,
      featherRadius: FOUNDATION_MASK_CONFIG.featherRadius
    });

    // Apply color onto the mask
    this.offscreenCtx.globalCompositeOperation = 'source-in';
    this.offscreenCtx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${strength})`;
    this.offscreenCtx.fillRect(0, 0, width, height);
    this.offscreenCtx.globalCompositeOperation = 'source-over'; // Reset

    // Feature 4: Debug Foundation Mask
    if ((window as any).DEBUG_FOUNDATION_MASK) {
      drawDebugFoundationMask(targetCtx, landmarks, width, height);
      return; // Skip normal compositing if debugging mask
    }

    // 6. Feather Mask and Composite to Output
    const featherRadius = FOUNDATION_MASK_CONFIG.featherRadius;
    if (featherRadius > 0 && typeof this.offscreenCtx.filter !== 'undefined') {
      targetCtx.filter = `blur(${featherRadius}px)`;
    }

    // Use requested composite operation (default to multiply)
    targetCtx.globalCompositeOperation = options.compositeMode || 'multiply';
    targetCtx.drawImage(this.offscreenCanvas, 0, 0);

    // 7. Cleanup target context state
    targetCtx.filter = 'none';
    targetCtx.globalCompositeOperation = 'source-over';
  }

  public reset(): void {
    this.clearOffscreenCanvas();
  }
}
