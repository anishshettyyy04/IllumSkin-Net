import type { CosmeticPreset } from '../makeup/core/CosmeticPreset';

export type OccasionType = 'Office' | 'Daily Wear' | 'Casual' | 'Evening' | 'Party' | 'Wedding' | 'Festival' | 'Photoshoot';

export class OccasionStyler {
  /**
   * Adapts a base CosmeticPreset for a specific occasion.
   */
  public adaptForOccasion(preset: CosmeticPreset, occasion: OccasionType): CosmeticPreset {
    const adapted = { ...preset };

    switch (occasion) {
      case 'Office':
        // Professional, subdued
        adapted.intensity = Math.min(adapted.intensity, 0.6);
        if (adapted.lipstick) adapted.lipstick.finish = 'Matte';
        if (adapted.eyeShadow) adapted.eyeShadow.finish = 'Matte';
        if (adapted.blush) adapted.blush.opacity *= 0.8;
        break;

      case 'Daily Wear':
      case 'Casual':
        // Light, fresh
        adapted.intensity = Math.min(adapted.intensity, 0.5);
        if (adapted.lipstick) adapted.lipstick.finish = 'Dewy';
        if (adapted.eyeShadow) adapted.eyeShadow.opacity *= 0.5;
        break;

      case 'Evening':
      case 'Party':
        // Higher intensity for low light
        adapted.intensity = Math.max(adapted.intensity, 0.8);
        if (adapted.eyeShadow) adapted.eyeShadow.finish = 'Metallic';
        if (adapted.blush) adapted.blush.opacity = Math.min(adapted.blush.opacity * 1.2, 1.0);
        break;

      case 'Festival':
        // Bold, creative
        adapted.intensity = 1.0;
        if (adapted.eyeShadow) adapted.eyeShadow.finish = 'Shimmer';
        if (adapted.lipstick) adapted.lipstick.finish = 'Gloss';
        break;

      case 'Wedding':
      case 'Photoshoot':
        // Flawless, balanced for flash photography (no pure dewy, needs satin/matte to avoid glare)
        adapted.intensity = Math.max(adapted.intensity, 0.7);
        if (adapted.lipstick && adapted.lipstick.finish === 'Gloss') adapted.lipstick.finish = 'Satin';
        if (adapted.blush) adapted.blush.style = 'Sculpt';
        break;
    }

    return adapted;
  }
}
