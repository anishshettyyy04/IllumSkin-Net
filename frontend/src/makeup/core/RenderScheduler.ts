import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { VirtualMakeupEngine } from '../VirtualMakeupEngine';

export class RenderScheduler {
  private engine: VirtualMakeupEngine | null = null;

  public attachEngine(engine: VirtualMakeupEngine) {
    this.engine = engine;
  }

  public detachEngine() {
    this.engine = null;
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
