export abstract class RendererBase {
  public offscreenCanvas: HTMLCanvasElement;
  public offscreenCtx: CanvasRenderingContext2D | null;
  public isEnabled: boolean = true;

  constructor(width: number, height: number) {
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
  }

  // --- Lifecycle Hooks ---
  public onRegister(): void {}
  public onEnable(): void { this.isEnabled = true; }
  public onDisable(): void { this.isEnabled = false; }
  public onPresetChanged(_preset: any): void {}
  public onDispose(): void {
    this.offscreenCanvas.width = 0;
    this.offscreenCanvas.height = 0;
  }

  public updateSize(width: number, height: number) {
    if (this.offscreenCanvas.width !== width || this.offscreenCanvas.height !== height) {
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }
  }

  public clearOffscreenCanvas() {
    if (this.offscreenCtx) {
      this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    }
  }

  /**
   * Abstract method that must be implemented by subclasses to perform the actual rendering.
   */
  public abstract render(
    targetCtx: CanvasRenderingContext2D,
    ...args: any[]
  ): void;

  public abstract reset(): void;
}
