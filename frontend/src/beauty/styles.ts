import type { LipstickFinish } from '../makeup/shades';
import type { BlushStyle } from '../makeup/BlushMask';
import type { EyeStyle } from '../makeup/EyeMask';

export interface BeautyStyleDefinition {
  id: string;
  name: string;
  lipFinish: LipstickFinish;
  blushStyle: BlushStyle;
  eyeStyle: EyeStyle;
  baseIntensity: number;
}

export const BEAUTY_STYLES: BeautyStyleDefinition[] = [
  { id: 'everyday-fresh', name: 'Everyday Fresh', lipFinish: 'Dewy', blushStyle: 'Natural', eyeStyle: 'Natural', baseIntensity: 0.5 },
  { id: 'office-professional', name: 'Office Professional', lipFinish: 'Matte', blushStyle: 'Lifted', eyeStyle: 'Soft Glam', baseIntensity: 0.6 },
  { id: 'evening-glam', name: 'Evening Glam', lipFinish: 'Gloss', blushStyle: 'Sculpt', eyeStyle: 'Smokey', baseIntensity: 1.0 },
  { id: 'wedding-radiance', name: 'Wedding Radiance', lipFinish: 'Satin', blushStyle: 'Circular', eyeStyle: 'Halo', baseIntensity: 0.8 },
  { id: 'festival-look', name: 'Festival Look', lipFinish: 'Glow', blushStyle: 'Draped', eyeStyle: 'Winged', baseIntensity: 1.0 },
  { id: 'soft-romantic', name: 'Soft Romantic', lipFinish: 'Dewy', blushStyle: 'Circular', eyeStyle: 'Natural', baseIntensity: 0.6 },
  { id: 'minimal-elegance', name: 'Minimal Elegance', lipFinish: 'Satin', blushStyle: 'Lifted', eyeStyle: 'Natural', baseIntensity: 0.4 },
  { id: 'natural-glow', name: 'Natural Glow', lipFinish: 'Glow', blushStyle: 'Draped', eyeStyle: 'Soft Glam', baseIntensity: 0.7 }
];

export const getBeautyStyle = (id: string): BeautyStyleDefinition | undefined => {
  return BEAUTY_STYLES.find(s => s.id === id);
};
