import { hexToRgbaString } from './colorUtils';
import type { CosmeticProduct } from './shades';
import { LipRendererConfig } from './config';

export interface RenderOptions {
  shade: CosmeticProduct;
  opacity?: number;
}

export class BlendEngine {
  
  /**
   * Applies the cosmetic color with specific blend modes and layers based on the Finish.
   * Assumes the `ctx` is an offscreen canvas containing only the Mask (white or transparent).
   */
  public applyFinish(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    options: RenderOptions
  ) {
    const shade = options.shade;
    const finalOpacity = options.opacity ?? shade.opacity ?? LipRendererConfig.defaultOpacity;
    const finish = shade.finish;

    console.log('[TRYON:RENDERER:COLOR]', {
      hex: shade.hex,
      rgba: hexToRgbaString(shade.hex, finalOpacity),
      opacity: finalOpacity,
      finish: finish,
      compositeOperation: 'source-in'
    });

    // Apply base color to the mask
    ctx.globalCompositeOperation = 'source-in';
    
    if (finish === 'Matte') {
      this.applyMatte(ctx, width, height, shade.hex, finalOpacity);
    } else if (finish === 'Satin') {
      this.applySatin(ctx, width, height, shade.hex, finalOpacity);
    } else if (finish === 'Gloss') {
      this.applyGloss(ctx, width, height, shade.hex, finalOpacity);
    } else if (finish === 'Dewy') {
      this.applyDewy(ctx, width, height, shade.hex, finalOpacity);
    } else if (finish === 'Glow') {
      this.applyGlow(ctx, width, height, shade.hex, finalOpacity);
    } else if (finish === 'Shimmer') {
      this.applyShimmer(ctx, width, height, shade.hex, finalOpacity);
    } else if (finish === 'Metallic') {
      this.applyMetallic(ctx, width, height, shade.hex, finalOpacity);
    } else {
      // Fallback
      ctx.fillStyle = hexToRgbaString(shade.hex, finalOpacity);
      ctx.fillRect(0, 0, width, height);
    }

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }

  private applyMatte(ctx: CanvasRenderingContext2D, width: number, height: number, hex: string, opacity: number) {
    ctx.fillStyle = hexToRgbaString(hex, opacity);
    ctx.fillRect(0, 0, width, height);
    
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(0, 0, 0, 0.05)`;
    ctx.fillRect(0, 0, width, height);
  }

  private applySatin(ctx: CanvasRenderingContext2D, width: number, height: number, hex: string, opacity: number) {
    ctx.fillStyle = hexToRgbaString(hex, opacity * 0.9);
    ctx.fillRect(0, 0, width, height);
    
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = hexToRgbaString(hex, 0.5);
    ctx.fillRect(0, 0, width, height);
  }

  private applyGloss(ctx: CanvasRenderingContext2D, width: number, height: number, hex: string, opacity: number) {
    ctx.fillStyle = hexToRgbaString(hex, opacity * 0.8);
    ctx.fillRect(0, 0, width, height);
    
    if (LipRendererConfig.enableSpecularHighlights) {
      ctx.globalCompositeOperation = 'color-dodge';
      const grad = ctx.createLinearGradient(0, height * 0.4, 0, height * 0.9);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  private applyDewy(ctx: CanvasRenderingContext2D, width: number, height: number, hex: string, opacity: number) {
    ctx.fillStyle = hexToRgbaString(hex, opacity * 0.8);
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, 0, width, height);
  }

  private applyGlow(ctx: CanvasRenderingContext2D, width: number, height: number, hex: string, opacity: number) {
    ctx.fillStyle = hexToRgbaString(hex, opacity * 0.75);
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'screen';
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) / 2;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.05)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  private applyShimmer(ctx: CanvasRenderingContext2D, width: number, height: number, hex: string, opacity: number) {
    ctx.fillStyle = hexToRgbaString(hex, opacity * 0.8);
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'screen';
    // Procedural sparkle gradient aligned with the eyelid (simulated by a linear gradient across)
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)'); // Shimmer peaks
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  private applyMetallic(ctx: CanvasRenderingContext2D, width: number, height: number, hex: string, opacity: number) {
    // Multiply base for deep metallic color
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = hexToRgbaString(hex, opacity);
    ctx.fillRect(0, 0, width, height);

    // Color-dodge highlight for sharp metallic reflection
    ctx.globalCompositeOperation = 'color-dodge';
    const grad = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.7);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)'); // Sharp directional highlight
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
}

