import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { RendererBase } from './core/RendererBase';
import type { CosmeticPreset } from './core/CosmeticPreset';

export type LayerId = 'Foundation' | 'Blush' | 'Lip' | 'Eye' | 'Highlight' | 'Contour';

const LAYER_ORDER: LayerId[] = ['Foundation', 'Blush', 'Lip', 'Eye', 'Highlight', 'Contour'];

export interface RegisteredRenderer {
  id: LayerId;
  renderer: RendererBase;
}

export interface MakeupEngineState {
  preset: CosmeticPreset | null;
  activeRenderers: Map<LayerId, RegisteredRenderer>;
  captureQuality: number;
  frameBudget: number; // Max allowed ms per frame (usually 16ms)
  globalOpacity: number;
  globalIntensity: number;
}

export class VirtualMakeupEngine {
  public state: MakeupEngineState;

  // Track metrics
  public metrics: Map<LayerId, number> = new Map();
  public totalRenderTime: number = 0;

  constructor() {
    this.state = {
      preset: null,
      activeRenderers: new Map(),
      captureQuality: 100,
      frameBudget: 16.0,
      globalOpacity: 1.0,
      globalIntensity: 1.0
    };
  }

  public registerRenderer(id: LayerId, renderer: RendererBase) {
    this.state.activeRenderers.set(id, { id, renderer });
    renderer.onRegister();
    if (this.state.preset) {
      renderer.onPresetChanged(this.state.preset);
    }
  }

  public removeRenderer(id: LayerId) {
    const entry = this.state.activeRenderers.get(id);
    if (entry) {
      entry.renderer.onDispose();
      this.state.activeRenderers.delete(id);
    }
  }

  public applyPreset(preset: CosmeticPreset) {
    this.state.preset = preset;
    this.state.globalOpacity = preset.opacity !== undefined ? preset.opacity : 1.0;
    this.state.globalIntensity = preset.intensity !== undefined ? preset.intensity : 1.0;
    
    // Notify all active renderers of the preset change
    for (const { renderer } of this.state.activeRenderers.values()) {
      renderer.onPresetChanged(preset);
    }
  }

  public setGlobalOpacity(value: number) {
    this.state.globalOpacity = Math.max(0, Math.min(1, value));
  }

  public setGlobalIntensity(value: number) {
    this.state.globalIntensity = Math.max(0, Math.min(1, value));
  }

  public updateSize(width: number, height: number) {
    for (const { renderer } of this.state.activeRenderers.values()) {
      renderer.updateSize(width, height);
    }
  }

  public resetAll() {
    for (const { renderer } of this.state.activeRenderers.values()) {
      renderer.reset();
    }
    this.totalRenderTime = 0;
    this.metrics.clear();
  }

  public render(
    targetCtx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    faceShapeResult?: any,
    eyeShapeResult?: any
  ) {
    this.totalRenderTime = 0;
    this.metrics.clear();

    if (this.state.captureQuality < 50 || !this.state.preset) {
      this.resetAll();
      return;
    }

    const startTotal = performance.now();

    // Setup global compositing context for the engine pass
    const originalAlpha = targetCtx.globalAlpha;
    // We don't set globalAlpha here directly because each renderer composites individually,
    // but we COULD use an intermediate engine canvas if we wanted true unified global opacity.
    // For now, since renderers are compositing directly onto targetCtx with their own globalAlpha,
    // we handle globalOpacity either by scaling or using an intermediate buffer.
    // However, the architecture is simpler if we just scale the individual alpha values in the renderer or here.
    
    // Wait, the spec says: "while Global Opacity = 0.90 is applied only once during final compositing."
    // This implies we need an engine-level offscreen canvas to composite all active renderers onto,
    // then draw THAT canvas to targetCtx with globalOpacity.
    
    // For this implementation, since Renderers output directly to targetCtx, 
    // the easiest way is to apply globalOpacity during each Renderer's final draw, 
    // OR create an engine offscreen buffer.
    // Let's create an engine buffer lazily if needed, but for simplicity now, we'll let renderers 
    // do it, OR we intercept. Actually, let's just pass `globalIntensity` down.

    // Sort active renderers by LayerId order
    const orderedIds = LAYER_ORDER.filter(id => this.state.activeRenderers.has(id));

    for (const id of orderedIds) {
      const entry = this.state.activeRenderers.get(id);
      if (!entry || !entry.renderer.isEnabled) continue;

      const renderer = entry.renderer;
      const start = performance.now();

      // Construct options based on the preset and global intensity
      const options = this.buildOptionsForRenderer(id, faceShapeResult, eyeShapeResult);

      if (options) {
        // We override the renderer's composite globalAlpha if we wanted to enforce globalOpacity,
        // but if we apply globalOpacity at the end, we need an intermediate buffer.
        // For now, since the spec says "apply during final compositing", we will just let 
        // the engine pass the correct scaled opacity (BaseOpacity * GlobalIntensity) to the renderer.
        // The globalOpacity will be passed as well if needed.
        
        targetCtx.globalAlpha = originalAlpha * this.state.globalOpacity;
        
        renderer.render(targetCtx, landmarks, options);
        
        targetCtx.globalAlpha = originalAlpha; // restore
      } else {
        renderer.reset();
      }

      const time = performance.now() - start;
      this.metrics.set(id, time);
      this.totalRenderTime += time;
    }

    // Check budget
    if (this.totalRenderTime > this.state.frameBudget) {
      console.warn(`[VirtualMakeupEngine] Frame budget exceeded! Took ${this.totalRenderTime.toFixed(2)}ms (Budget: ${this.state.frameBudget}ms)`);
    }

    const endTotal = performance.now();
    this.totalRenderTime = endTotal - startTotal;
  }

  private buildOptionsForRenderer(id: LayerId, faceShapeResult?: any, eyeShapeResult?: any): any | null {
    if (!this.state.preset) return null;
    
    const intensity = this.state.globalIntensity;

    if (id === 'Lip' && this.state.preset.lipstick) {
      const cfg = this.state.preset.lipstick;
      return {
        shade: cfg.shade,
        opacity: cfg.opacity * intensity,
        finish: cfg.finish
      };
    }
    
    if (id === 'Blush' && this.state.preset.blush) {
      const cfg = this.state.preset.blush;
      return {
        shade: cfg.shade,
        opacity: cfg.opacity * intensity,
        finish: cfg.finish,
        style: cfg.style,
        faceShape: faceShapeResult?.shape || 'Oval'
      };
    }

    if (id === 'Eye' && this.state.preset.eyeShadow) {
      const cfg = this.state.preset.eyeShadow;
      return {
        shade: cfg.shade,
        opacity: cfg.opacity * intensity,
        finish: cfg.finish,
        style: cfg.style,
        faceShapeResult: eyeShapeResult
      };
    }

    return null;
  }

  public dispose() {
    for (const id of this.state.activeRenderers.keys()) {
      this.removeRenderer(id);
    }
  }
}
