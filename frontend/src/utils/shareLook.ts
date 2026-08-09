import type { CosmeticPreset } from '../makeup/core/CosmeticPreset';

export interface SavedLookSnapshot {
  code: string;
  name: string;
  occasion: string;
  timestamp: string;
  harmonyScore: number;
  beautyScore: number;
  preset: CosmeticPreset;
  previewDataUrl?: string; // PNG base64
}

/**
 * Generates a versioned look code containing the preset signature and checksum.
 * Format: ISN-{version}-{hash}-{checksum}
 * Example: ISN-1-W8F3-A91
 */
export function generateLookCode(preset: CosmeticPreset): string {
  const version = '1';
  
  // Create a simplified hash of the active shades
  const hashString = `${preset.foundation?.shade || 'X'}-${preset.lipstick?.shade.id || 'X'}-${preset.blush?.shade.id || 'X'}-${preset.eyeShadow?.shade.id || 'X'}-${preset.intensity.toFixed(1)}`;
  
  // Basic hash function
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    hash = ((hash << 5) - hash) + hashString.charCodeAt(i);
    hash |= 0; 
  }
  
  const shortHash = Math.abs(hash).toString(36).substring(0, 4).toUpperCase().padStart(4, '0');
  
  // Calculate checksum
  const checksum = (Math.abs(hash) % 997).toString(16).toUpperCase().padStart(3, '0');
  
  return `ISN-${version}-${shortHash}-${checksum}`;
}

/**
 * Exports a given canvas element as a Base64 PNG.
 */
export function exportCanvasAsPNG(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}
