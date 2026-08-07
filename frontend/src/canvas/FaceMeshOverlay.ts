import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { 
  getFaceOval, 
  getLipLandmarks, 
  getLeftEye, 
  getRightEye, 
  getLeftCheek, 
  getRightCheek 
} from '../ai/mediapipe/regions';

export const drawFaceMeshRegions = (
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
) => {
  ctx.clearRect(0, 0, width, height);
  
  const drawRegion = (
    regionLandmarks: NormalizedLandmark[], 
    fillStyle: string, 
    strokeStyle: string | null = null
  ) => {
    if (!regionLandmarks.length) return;
    
    ctx.beginPath();
    regionLandmarks.forEach((landmark, index) => {
      const x = landmark.x * width;
      const y = landmark.y * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    
    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    
    if (strokeStyle) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }
  };

  // Draw key regions for Sprint 8.1.1 (Soft translucent fills)
  
  // Face Oval (Outline only)
  drawRegion(getFaceOval(landmarks), 'transparent', 'rgba(255, 255, 255, 0.4)');
  
  // Lips (Translucent fill)
  drawRegion(getLipLandmarks(landmarks), 'rgba(244, 63, 94, 0.3)', 'rgba(244, 63, 94, 0.6)');
  
  // Eyes (Translucent fill)
  drawRegion(getLeftEye(landmarks), 'rgba(56, 189, 248, 0.2)', 'rgba(56, 189, 248, 0.5)');
  drawRegion(getRightEye(landmarks), 'rgba(56, 189, 248, 0.2)', 'rgba(56, 189, 248, 0.5)');
  
  // Cheeks (Translucent polygon)
  drawRegion(getLeftCheek(landmarks), 'rgba(251, 146, 60, 0.2)', null);
  drawRegion(getRightCheek(landmarks), 'rgba(251, 146, 60, 0.2)', null);
};
