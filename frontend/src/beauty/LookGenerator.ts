import type { CosmeticPreset } from '../makeup/core/CosmeticPreset';
import { getShadeById } from '../makeup/shades';
import { getBeautyStyle } from './styles';
import { OccasionStyler } from './OccasionStyler';
import type { OccasionType } from './OccasionStyler';
import { HarmonyEngine } from './HarmonyEngine';
import type { HarmonyEvaluation } from './HarmonyEngine';
import { ExplanationEngine } from './ExplanationEngine';
import type { ExplanationSet } from './ExplanationEngine';

export interface GeneratedLook {
  id: string;
  preset: CosmeticPreset;
  styleName: string;
  occasion: OccasionType;
  harmony: HarmonyEvaluation;
  explanations: ExplanationSet;
  generationTimeMs: number;
}

export class LookGenerator {
  private occasionStyler = new OccasionStyler();
  private harmonyEngine = new HarmonyEngine();
  private explanationEngine = new ExplanationEngine();

  public generate(
    undertone: string,
    foundationId: string,
    styleId: string,
    occasion: OccasionType
  ): GeneratedLook {
    const start = performance.now();
    
    const styleDef = getBeautyStyle(styleId);
    if (!styleDef) throw new Error(`Unknown style: ${styleId}`);

    // Base shades by undertone
    const basePreset: CosmeticPreset = {
      version: 1,
      id: `ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: styleDef.name,
      opacity: 1.0,
      intensity: styleDef.baseIntensity,
      foundation: { shade: foundationId, undertone, hex: getShadeById(foundationId)?.hex || '#FFFFFF', renderer: null }
    };

    if (undertone === 'Warm') {
      basePreset.lipstick = { shade: getShadeById('warm-brown')!, opacity: 0.8, finish: styleDef.lipFinish };
      basePreset.blush = { shade: getShadeById('warm-coral')!, opacity: 0.7, finish: 'Satin', style: styleDef.blushStyle };
      basePreset.eyeShadow = { shade: getShadeById('copper')!, opacity: 0.7, finish: 'Metallic', style: styleDef.eyeStyle };
    } else if (undertone === 'Cool') {
      basePreset.lipstick = { shade: getShadeById('berry-plum')!, opacity: 0.85, finish: styleDef.lipFinish };
      basePreset.blush = { shade: getShadeById('berry-bloom')!, opacity: 0.75, finish: 'Matte', style: styleDef.blushStyle };
      basePreset.eyeShadow = { shade: getShadeById('plum')!, opacity: 0.7, finish: 'Satin', style: styleDef.eyeStyle };
    } else {
      basePreset.lipstick = { shade: getShadeById('rose-nude')!, opacity: 0.8, finish: styleDef.lipFinish };
      basePreset.blush = { shade: getShadeById('soft-rose')!, opacity: 0.6, finish: 'Dewy', style: styleDef.blushStyle };
      basePreset.eyeShadow = { shade: getShadeById('rose-gold')!, opacity: 0.65, finish: 'Shimmer', style: styleDef.eyeStyle };
    }

    // Adapt for occasion
    const adaptedPreset = this.occasionStyler.adaptForOccasion(basePreset, occasion);

    // Evaluate harmony
    const harmony = this.harmonyEngine.evaluate(adaptedPreset, undertone, foundationId, occasion);

    // Generate explanations
    const explanations = this.explanationEngine.generateExplanations(
      adaptedPreset,
      undertone,
      occasion,
      styleDef.name,
      harmony.score
    );

    const generationTimeMs = performance.now() - start;

    return {
      id: adaptedPreset.id,
      preset: adaptedPreset,
      styleName: styleDef.name,
      occasion,
      harmony,
      explanations,
      generationTimeMs
    };
  }
}
