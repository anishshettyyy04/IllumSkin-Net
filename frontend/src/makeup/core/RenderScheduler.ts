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
    getCanvas: () => HTMLCanvasElement | null | undefined,
    onBeforeRender?: (ctx: CanvasRenderingContext2D, width: number, height: number, landmarks: NormalizedLandmark[]) => boolean
  ) {
    if (this.animationFrameId !== null) return; // already running

    let cachedCanvas: HTMLCanvasElement | null = null;
    let cachedCtx: CanvasRenderingContext2D | null = null;
    let lastLogTime = 0;

    const loop = () => {
      const landmarks = getLandmarks();
      const canvas = getCanvas();
      
      const now = Date.now();
      if (landmarks && now - lastLogTime > 1000) {
        lastLogTime = now;
        console.log('[TRYON:LANDMARK_FRAME]', {
          facesCount: landmarks ? 1 : 0, // Since landmarks passed here are for the first face (if present), or we can just log what we have
          landmarkCount: landmarks ? landmarks.length : 0,
          timestamp: now,
          upperLipPoint: landmarks ? landmarks[13] : null,
          lowerLipPoint: landmarks ? landmarks[14] : null,
          leftMouthCorner: landmarks ? landmarks[61] : null,
          rightMouthCorner: landmarks ? landmarks[291] : null
        });
      }
      
      if (canvas) {
        if (canvas !== cachedCanvas) {
          cachedCanvas = canvas;
          cachedCtx = canvas.getContext('2d');
        }
        
        if (cachedCtx) {
          cachedCtx.clearRect(0, 0, cachedCtx.canvas.width, cachedCtx.canvas.height);
          if (landmarks) {
            let shouldRender = true;
            if (onBeforeRender) {
              shouldRender = onBeforeRender(cachedCtx, cachedCtx.canvas.width, cachedCtx.canvas.height, landmarks);
            }
            if (shouldRender) {
              this.renderAll(cachedCtx, landmarks);
            }
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
