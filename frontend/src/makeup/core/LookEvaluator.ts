import type { CosmeticPreset } from './CosmeticPreset';

export interface LookEvaluationResult {
  harmonyScore: number;
  undertone: string;
  evaluations: {
    category: string;
    productName: string | null;
    isHarmonious: boolean;
    suggestion?: string;
  }[];
  globalSuggestion?: string;
}

export class LookEvaluator {
  /**
   * Evaluates how well a cosmetic preset harmonizes with the user's skin undertone.
   * 
   * @param undertone The IllumSkin-Net determined undertone ('Warm', 'Cool', 'Neutral')
   * @param preset The current CosmeticPreset applied
   * @returns A LookEvaluationResult detailing the harmony score and suggestions
   */
  public evaluateHarmony(undertone: string, preset: CosmeticPreset): LookEvaluationResult {
    const result: LookEvaluationResult = {
      harmonyScore: 100,
      undertone,
      evaluations: []
    };

    let penalty = 0;

    // Helper to check if a shade name implies a conflicting undertone.
    // In a real system, shades would have an explicit `undertone` property on their model.
    const isHarmonious = (shadeName: string, skinUndertone: string): boolean => {
      const name = shadeName.toLowerCase();
      if (skinUndertone === 'Warm') {
        return !name.includes('berry') && !name.includes('plum') && !name.includes('cool');
      }
      if (skinUndertone === 'Cool') {
        return !name.includes('warm') && !name.includes('coral') && !name.includes('copper') && !name.includes('peach') && !name.includes('bronze');
      }
      return true; // Neutral handles most things reasonably well, or we assume neutral matches all.
    };

    // Evaluate Lipstick
    if (preset.lipstick) {
      const match = isHarmonious(preset.lipstick.shade.name, undertone);
      result.evaluations.push({
        category: 'Lip',
        productName: preset.lipstick.shade.name,
        isHarmonious: match,
        suggestion: match ? undefined : `Consider a ${undertone.toLowerCase()}-toned shade.`
      });
      if (!match) penalty += 15;
    }

    // Evaluate Blush
    if (preset.blush) {
      const match = isHarmonious(preset.blush.shade.name, undertone);
      result.evaluations.push({
        category: 'Blush',
        productName: preset.blush.shade.name,
        isHarmonious: match,
        suggestion: match ? undefined : `A ${undertone.toLowerCase()} flush would look more natural.`
      });
      if (!match) penalty += 15;
    }

    // Evaluate Eye Shadow
    if (preset.eyeShadow) {
      const match = isHarmonious(preset.eyeShadow.shade.name, undertone);
      result.evaluations.push({
        category: 'Eyes',
        productName: preset.eyeShadow.shade.name,
        isHarmonious: match,
        suggestion: match ? undefined : `Try a ${undertone.toLowerCase()} palette for better synergy.`
      });
      if (!match) penalty += 15;
    }
    
    // Evaluate Global Intensity
    if (preset.intensity > 0.9 && preset.opacity > 0.9) {
      result.globalSuggestion = "High intensity look detected. Ensure this is desired for daytime wear.";
      penalty += 5; // Slight penalty just for the sake of the evaluation demonstration.
    }

    result.harmonyScore = Math.max(0, 100 - penalty);
    return result;
  }
}
