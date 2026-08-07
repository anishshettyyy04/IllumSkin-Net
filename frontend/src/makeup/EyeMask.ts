import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { EyeShape } from './eyeShape';
import type { FaceGeometry } from './core/GeometryCache';

export type EyeStyle = 'Natural' | 'Soft Glam' | 'Smokey' | 'Halo' | 'Winged';

interface Point {
  x: number;
  y: number;
}

export interface EyeMaskParams {
  upperLid: Point[];
  crease: Point[];
  innerCorner: Point;
  outerCorner: Point;
  wingExtension: Point;
  style: EyeStyle;
  shape: EyeShape;
}

export class EyeMaskGenerator {
  
  public computeParams(
    faceGeo: FaceGeometry,
    width: number,
    height: number,
    isLeft: boolean,
    shape: EyeShape,
    style: EyeStyle
  ): EyeMaskParams {
    const eyeGeo = isLeft ? faceGeo.leftEye : faceGeo.rightEye;

    const toPoint = (lm: NormalizedLandmark) => ({ x: lm.x * width, y: lm.y * height });

    const upperLid = eyeGeo.upperLidCurve.map(toPoint);
    const brow = eyeGeo.browCurve.map(toPoint);
    const innerCorner = toPoint(eyeGeo.innerCorner);
    const outerCorner = toPoint(eyeGeo.outerCorner);

    // Compute Crease: upperLid + 0.35 * (eyebrow - upperLid)
    const crease: Point[] = upperLid.map((ul, i) => {
      const br = brow[i] || brow[brow.length - 1]; // Fallback if lengths mismatch
      return {
        x: ul.x + 0.35 * (br.x - ul.x),
        y: ul.y + 0.35 * (br.y - ul.y)
      };
    });

    // EyeShape Adjustments
    if (shape === 'Hooded' || shape === 'Monolid') {
      // Push crease slightly higher so shadow is visible when eyes are open
      crease.forEach((c, i) => {
        const br = brow[i] || brow[brow.length - 1];
        c.y = c.y + 0.15 * (br.y - c.y); // move 15% closer to brow
      });
    }

    // Style Adjustments (Wing / Extension)
    let wingExtension = { x: outerCorner.x, y: outerCorner.y };
    
    // Direction outward: left eye goes negative X, right eye goes positive X
    const dirX = isLeft ? -1 : 1;
    
    if (style === 'Winged') {
      wingExtension.x += dirX * faceGeo.avgEyeWidth * 0.4;
      wingExtension.y -= faceGeo.avgEyeHeight * 0.3; // wing goes up
    } else if (style === 'Smokey' || style === 'Soft Glam') {
      wingExtension.x += dirX * faceGeo.avgEyeWidth * 0.2;
      wingExtension.y -= faceGeo.avgEyeHeight * 0.1;
    }

    return {
      upperLid,
      crease,
      innerCorner,
      outerCorner,
      wingExtension,
      style,
      shape
    };
  }

  public drawMaskLayers(
    ctx: CanvasRenderingContext2D,
    params: EyeMaskParams,
    baseColor: string
  ) {
    const { upperLid, crease, innerCorner, outerCorner, wingExtension, style } = params;

    // Helper to draw the core path
    const drawEyePolygon = (context: CanvasRenderingContext2D) => {
      context.beginPath();
      context.moveTo(innerCorner.x, innerCorner.y);
      
      // Curve along upper lid
      for (const p of upperLid) {
        context.lineTo(p.x, p.y);
      }
      
      context.lineTo(outerCorner.x, outerCorner.y);
      
      // If there's an extension (Wing/Smokey)
      if (wingExtension.x !== outerCorner.x || wingExtension.y !== outerCorner.y) {
        context.lineTo(wingExtension.x, wingExtension.y);
      }

      // Return via crease (in reverse)
      for (let i = crease.length - 1; i >= 0; i--) {
        context.lineTo(crease[i].x, crease[i].y);
      }
      
      context.closePath();
    };

    // LAYER 1: Base Color
    ctx.save();
    drawEyePolygon(ctx);
    ctx.fillStyle = baseColor;
    ctx.globalAlpha = 0.5; // Base opacity
    ctx.fill();
    ctx.restore();

    // Specific Style Layering
    if (style === 'Smokey' || style === 'Soft Glam' || style === 'Winged') {
      // LAYER 2: Outer Dark Gradient
      ctx.save();
      drawEyePolygon(ctx);
      
      // Gradient from outer corner inward
      const grad = ctx.createLinearGradient(
        wingExtension.x, wingExtension.y,
        upperLid[2].x, upperLid[2].y // center of lid
      );
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.4)'); // Darker outer
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = grad;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fill();
      ctx.restore();
    }

    if (style === 'Halo') {
      // LAYER 3: Outer & Inner Dark, Center Highlight
      ctx.save();
      drawEyePolygon(ctx);
      
      // Center highlight
      const cx = upperLid[2].x;
      const cy = (upperLid[2].y + crease[2].y) / 2;
      const r = Math.abs(outerCorner.x - innerCorner.x) / 3;
      
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = grad;
      ctx.globalCompositeOperation = 'screen';
      ctx.fill();
      
      // Darken edges (Halo effect)
      const edgeGrad = ctx.createLinearGradient(innerCorner.x, innerCorner.y, outerCorner.x, outerCorner.y);
      edgeGrad.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
      edgeGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0)');
      edgeGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
      edgeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      
      ctx.fillStyle = edgeGrad;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fill();
      ctx.restore();
    }

    // We can handle feathering by blurring the canvas before compositing to the final target
  }
}
