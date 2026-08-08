import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { VirtualMakeupEngine } from '../VirtualMakeupEngine';

export class RenderScheduler {
  private engine: VirtualMakeupEngine | null = null;
  private animationFrameId: number | null = null;

  public attachEngine(engine: VirtualMakeupEngine) {
    this.engine = engine;
  }

  public detachEngine() {
    this.engine = null;
  }

  public startLoop(
    getLandmarks: () => NormalizedLandmark[] | null | undefined,
    getCanvas: () => HTMLCanvasElement | null | undefined
  ) {
    if (this.animationFrameId !== null) return; // already running

    let cachedCanvas: HTMLCanvasElement | null = null;
    let cachedCtx: CanvasRenderingContext2D | null = null;

    const loop = () => {
      const landmarks = getLandmarks();
      const canvas = getCanvas();
      
      if (canvas) {
        if (canvas !== cachedCanvas) {
          cachedCanvas = canvas;
          cachedCtx = canvas.getContext('2d');
        }
        
        if (cachedCtx) {
          cachedCtx.clearRect(0, 0, cachedCtx.canvas.width, cachedCtx.canvas.height);
          if (landmarks) {
            this.renderAll(cachedCtx, landmarks);
          }
        }
      }
      
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Execute the engine in a single loop.
   */
  public renderAll(
    targetCtx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    faceShapeResult?: any,
    eyeShapeResult?: any
  ): void {
    if (this.engine) {
      this.engine.render(targetCtx, landmarks, faceShapeResult, eyeShapeResult);
    }
  }

  /**
   * Update the canvas size.
   */
  public updateSize(width: number, height: number) {
    if (this.engine) {
      this.engine.updateSize(width, height);
    }
  }

  /**
   * Reset engine state.
   */
  public resetAll() {
    if (this.engine) {
      this.engine.resetAll();
    }
  }
}
