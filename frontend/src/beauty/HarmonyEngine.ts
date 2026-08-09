import type { CosmeticPreset } from '../makeup/core/CosmeticPreset';
import type { OccasionType } from './OccasionStyler';

export interface HarmonyEvaluation {
  score: number;
  warnings: string[];
  suggestions: string[];
}

export class HarmonyEngine {
  /**
   * Evaluates the cosmetic harmony of a preset.
   * Weighting:
   * 35% Undertone Compatibility
   * 25% Foundation Match
   * 20% Color Balance (Lip vs Blush vs Eye)
   * 10% Finish Consistency
   * 10% Occasion Suitability
   */
  public evaluate(preset: CosmeticPreset, undertone: string, foundationId: string, occasion: OccasionType): HarmonyEvaluation {
    let undertoneScore = 35;
    let foundationScore = 25;
    let colorScore = 20;
    let finishScore = 10;
    let occasionScore = 10;
    
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const isHarmonious = (shadeName: string, skinUndertone: string): boolean => {
      const name = shadeName.toLowerCase();
      if (skinUndertone === 'Warm') return !name.includes('berry') && !name.includes('plum') && !name.includes('cool');
      if (skinUndertone === 'Cool') return !name.includes('warm') && !name.includes('coral') && !name.includes('copper') && !name.includes('peach') && !name.includes('bronze');
      return true;
    };

    // 1. Undertone Compatibility (35 points)
    let checks = 0;
    let passes = 0;
    if (preset.lipstick) { checks++; if (isHarmonious(preset.lipstick.shade.name, undertone)) passes++; else warnings.push(`Lip shade (${preset.lipstick.shade.name}) clashes with ${undertone} undertone.`); }
    if (preset.blush) { checks++; if (isHarmonious(preset.blush.shade.name, undertone)) passes++; else warnings.push(`Blush shade (${preset.blush.shade.name}) clashes with ${undertone} undertone.`); }
    if (preset.eyeShadow) { checks++; if (isHarmonious(preset.eyeShadow.shade.name, undertone)) passes++; else warnings.push(`Eye shade (${preset.eyeShadow.shade.name}) clashes with ${undertone} undertone.`); }
    
    if (checks > 0) {
      undertoneScore = Math.round((passes / checks) * 35);
      if (passes < checks) suggestions.push(`Opt for ${undertone.toLowerCase()} palettes to maintain natural harmony.`);
    }

    // 2. Foundation Match (25 points)
    // For AI generated looks, foundation match is presumed perfect (25/25).
    // If the preset has no foundation, we penalize slightly.
    if (!preset.foundation) {
      foundationScore = 15;
      suggestions.push("Apply a foundation match to establish a flawless base.");
    } else if (preset.foundation.shade !== foundationId) {
      foundationScore = 10;
      warnings.push("Foundation shade does not match the AI recommended base.");
    }

    // 3. Color Balance (20 points)
    // Check if the look is too monochromatic or too chaotic.
    // We'll give 20 points assuming AI look generator is balanced, but penalize if intensity is too high.
    if (preset.intensity > 0.9 && occasion !== 'Party' && occasion !== 'Evening' && occasion !== 'Festival') {
      colorScore = 10;
      warnings.push("High intensity colors may overpower facial features.");
      suggestions.push("Reduce global intensity for a more balanced daytime look.");
    }

    // 4. Finish Consistency (10 points)
    // Check if finishes clash (e.g. Matte lip with Dewy blush).
    if (preset.lipstick && preset.blush) {
      if ((preset.lipstick.finish === 'Matte' && preset.blush.finish === 'Dewy') ||
          (preset.lipstick.finish === 'Dewy' && preset.blush.finish === 'Matte')) {
        finishScore = 5;
        suggestions.push("Aligning lip and blush finishes (e.g. both Matte or both Dewy) creates a cohesive texture.");
      }
    }

    // 5. Occasion Suitability (10 points)
    if (occasion === 'Office' && preset.lipstick?.finish === 'Gloss') {
      occasionScore = 5;
      warnings.push("Gloss finishes can be distracting in professional settings.");
    }
    if (occasion === 'Wedding' && preset.eyeShadow?.finish === 'Metallic') {
      occasionScore = 5;
      suggestions.push("Avoid heavy metallic finishes for weddings as they can cause glare in flash photography.");
    }

    const totalScore = undertoneScore + foundationScore + colorScore + finishScore + occasionScore;

    return {
      score: totalScore,
      warnings,
      suggestions
    };
  }
}
