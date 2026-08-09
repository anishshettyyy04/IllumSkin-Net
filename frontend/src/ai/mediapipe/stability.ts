import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

interface Point2D {
  x: number;
  y: number;
}

export class StabilityTracker {
  private history: Point2D[][] = [];
  private readonly historySize = 5;

  // We track Nose(1), Left Eye(33), Right Eye(263), Mouth Center(13)
  private readonly trackIndices = [1, 33, 263, 13];

  public update(landmarks: NormalizedLandmark[]): number {
    const currentPoints = this.trackIndices.map(index => ({
      x: landmarks[index].x,
      y: landmarks[index].y
    }));

    this.history.push(currentPoints);
    if (this.history.length > this.historySize) {
      this.history.shift();
    }

    if (this.history.length < 2) {
      return 100; // Perfect stability if no history
    }

    let totalDrift = 0;
    
    // Calculate average drift between consecutive frames in history
    for (let i = 1; i < this.history.length; i++) {
      const prev = this.history[i - 1];
      const curr = this.history[i];
      
      let frameDrift = 0;
      for (let j = 0; j < curr.length; j++) {
        const dx = curr[j].x - prev[j].x;
        const dy = curr[j].y - prev[j].y;
        frameDrift += Math.sqrt(dx * dx + dy * dy);
      }
      totalDrift += frameDrift / curr.length;
    }

    const avgDrift = totalDrift / (this.history.length - 1);

    // Map drift to 0-100 score
    // Typical drift for a stable face is < 0.005 in normalized coordinates
    // A drift of 0.02 is quite shaky.
    const maxExpectedDrift = 0.03;
    const score = 100 * (1 - Math.min(1, avgDrift / maxExpectedDrift));
    
    return Math.max(0, Math.min(100, score));
  }

  public reset() {
    this.history = [];
  }
}
