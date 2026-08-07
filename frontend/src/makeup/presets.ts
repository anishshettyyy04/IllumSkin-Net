import type { CosmeticPreset } from './core/CosmeticPreset';
import { getShadeById } from './shades';

export const STATIC_PRESETS: CosmeticPreset[] = [
  {
    version: 1,
    id: 'natural',
    name: 'Natural',
    opacity: 1.0,
    intensity: 0.5,
    lipstick: { shade: getShadeById('rose-nude')!, opacity: 0.6, finish: 'Satin' },
    blush: { shade: getShadeById('natural-flush')!, opacity: 0.4, finish: 'Matte', style: 'Natural' },
    eyeShadow: { shade: getShadeById('champagne')!, opacity: 0.3, finish: 'Shimmer', style: 'Natural' }
  },
  {
    version: 1,
    id: 'office',
    name: 'Office',
    opacity: 1.0,
    intensity: 0.7,
    lipstick: { shade: getShadeById('dusty-rose')!, opacity: 0.8, finish: 'Matte' },
    blush: { shade: getShadeById('dusty-pink')!, opacity: 0.5, finish: 'Matte', style: 'Lifted' },
    eyeShadow: { shade: getShadeById('soft-brown')!, opacity: 0.6, finish: 'Matte', style: 'Soft Glam' }
  },
  {
    version: 1,
    id: 'evening-glam',
    name: 'Evening Glam',
    opacity: 1.0,
    intensity: 1.0,
    lipstick: { shade: getShadeById('classic-red')!, opacity: 1.0, finish: 'Matte' },
    blush: { shade: getShadeById('berry-bloom')!, opacity: 0.7, finish: 'Satin', style: 'Sculpt' },
    eyeShadow: { shade: getShadeById('midnight-blue')!, opacity: 0.8, finish: 'Matte', style: 'Smokey' }
  },
  {
    version: 1,
    id: 'wedding',
    name: 'Wedding',
    opacity: 1.0,
    intensity: 0.8,
    lipstick: { shade: getShadeById('soft-berry')!, opacity: 0.9, finish: 'Dewy' },
    blush: { shade: getShadeById('soft-rose')!, opacity: 0.6, finish: 'Dewy', style: 'Circular' },
    eyeShadow: { shade: getShadeById('rose-gold')!, opacity: 0.7, finish: 'Metallic', style: 'Halo' }
  },
  {
    version: 1,
    id: 'party',
    name: 'Party',
    opacity: 1.0,
    intensity: 1.0,
    lipstick: { shade: getShadeById('vampy-plum')!, opacity: 0.9, finish: 'Gloss' },
    blush: { shade: getShadeById('peach-glow')!, opacity: 0.8, finish: 'Glow', style: 'Draped' },
    eyeShadow: { shade: getShadeById('emerald')!, opacity: 0.8, finish: 'Shimmer', style: 'Winged' }
  },
  {
    version: 1,
    id: 'summer-glow',
    name: 'Summer Glow',
    opacity: 1.0,
    intensity: 0.8,
    lipstick: { shade: getShadeById('warm-brown')!, opacity: 0.8, finish: 'Glow' },
    blush: { shade: getShadeById('warm-coral')!, opacity: 0.7, finish: 'Glow', style: 'Draped' },
    eyeShadow: { shade: getShadeById('bronze')!, opacity: 0.8, finish: 'Metallic', style: 'Soft Glam' }
  },
  {
    version: 1,
    id: 'minimal',
    name: 'Minimal',
    opacity: 0.8,
    intensity: 0.4,
    lipstick: { shade: getShadeById('rose-nude')!, opacity: 0.5, finish: 'Dewy' },
    // No blush or eyeshadow for minimal
  }
];

export const getPresetById = (id: string): CosmeticPreset | undefined => {
  return STATIC_PRESETS.find(p => p.id === id);
};
