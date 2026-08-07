import type { CosmeticPreset } from '../makeup/core/CosmeticPreset';
import type { OccasionType } from './OccasionStyler';

export interface ExplanationSet {
  quick: string;
  standard: string;
  technical: string;
}

export class ExplanationEngine {
  /**
   * Generates natural language explanations for the recommended look.
   */
  public generateExplanations(
    preset: CosmeticPreset,
    undertone: string,
    occasion: OccasionType,
    styleName: string,
    harmonyScore: number
  ): ExplanationSet {
    
    // Fallback names if missing
    const blushName = preset.blush?.shade.name || 'natural';
    const eyeName = preset.eyeShadow?.shade.name || 'soft';
    const lipName = preset.lipstick?.shade.name || 'classic';

    // 1. Quick
    const quick = `This ${styleName} look complements your ${undertone.toLowerCase()} undertone perfectly.`;

    // 2. Standard
    const standardParts = [];
    if (preset.blush) {
      standardParts.push(`We selected ${blushName} blush because it complements your ${undertone.toLowerCase()} undertone and enhances the warmth introduced by your foundation.`);
    }
    if (preset.eyeShadow) {
      standardParts.push(`${eyeName} eyeshadow creates balanced contrast while preserving a natural appearance for ${occasion.toLowerCase()} settings.`);
    }
    if (preset.lipstick) {
      standardParts.push(`The ${lipName} lip ties the look together with a cohesive finish.`);
    }
    const standard = standardParts.join(' ');

    // 3. Technical
    const technical = `Preset [${preset.id}] synthesized via BeautyIntelligenceEngine. Base style: '${styleName}'. Occasion Styler: '${occasion}'. Undertone Classifier: '${undertone}'. Resulting Multi-factor Harmony Score: ${harmonyScore}%. Global Intensity: ${preset.intensity.toFixed(2)}.`;

    return {
      quick,
      standard,
      technical
    };
  }
}
