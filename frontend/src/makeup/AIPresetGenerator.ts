import type { CosmeticPreset } from './core/CosmeticPreset';
import { getShadeById } from './shades';

export class AIPresetGenerator {
  public generateFromUndertone(undertone: string, foundationShadeId: string): CosmeticPreset {
    
    const preset: CosmeticPreset = {
      version: 1,
      id: `ai-${Date.now()}`,
      name: `AI ${undertone} Harmony`,
      opacity: 1.0,
      intensity: 0.85,
      foundation: {
        shade: foundationShadeId,
        undertone: undertone,
        renderer: null
      }
    };

    if (undertone === 'Warm') {
      preset.lipstick = { shade: getShadeById('warm-brown')!, opacity: 0.8, finish: 'Matte' };
      preset.blush = { shade: getShadeById('warm-coral')!, opacity: 0.7, finish: 'Satin', style: 'Draped' };
      preset.eyeShadow = { shade: getShadeById('copper')!, opacity: 0.7, finish: 'Metallic', style: 'Soft Glam' };
    } else if (undertone === 'Cool') {
      preset.lipstick = { shade: getShadeById('berry-plum')!, opacity: 0.85, finish: 'Satin' };
      preset.blush = { shade: getShadeById('berry-bloom')!, opacity: 0.75, finish: 'Matte', style: 'Sculpt' };
      preset.eyeShadow = { shade: getShadeById('plum')!, opacity: 0.7, finish: 'Satin', style: 'Smokey' };
    } else {
      // Neutral
      preset.name = 'AI Neutral Harmony';
      preset.lipstick = { shade: getShadeById('rose-nude')!, opacity: 0.8, finish: 'Dewy' };
      preset.blush = { shade: getShadeById('soft-rose')!, opacity: 0.6, finish: 'Dewy', style: 'Natural' };
      preset.eyeShadow = { shade: getShadeById('rose-gold')!, opacity: 0.65, finish: 'Shimmer', style: 'Halo' };
    }

    return preset;
  }
}
