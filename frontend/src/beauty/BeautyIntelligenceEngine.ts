import { LookGenerator } from './LookGenerator';
import type { GeneratedLook } from './LookGenerator';

export interface BeautyProfile {
  undertone: string;
  contrast: string;
  finishPreference: string;
  recommendedStyle: string;
}

export interface ConsultationResult {
  profile: BeautyProfile;
  looks: GeneratedLook[];
  alternative: GeneratedLook;
  confidence: number;
}

export class BeautyIntelligenceEngine {
  private lookGenerator = new LookGenerator();

  /**
   * Main entry point to transform an AI undertone into a full Beauty Consultation.
   */
  public generateConsultation(undertone: string, foundationId: string): ConsultationResult {
    // Generate Beauty Profile
    const profile: BeautyProfile = {
      undertone: `${undertone} Undertone`,
      contrast: undertone === 'Warm' ? 'Warm Contrast' : undertone === 'Cool' ? 'High Contrast' : 'Soft Contrast',
      finishPreference: 'Natural/Dewy Finish Preference',
      recommendedStyle: 'Elegant Natural'
    };

    // Generate Primary Looks for Comparison Mode
    const looks: GeneratedLook[] = [
      this.lookGenerator.generate(undertone, foundationId, 'everyday-fresh', 'Daily Wear'),
      this.lookGenerator.generate(undertone, foundationId, 'office-professional', 'Office'),
      this.lookGenerator.generate(undertone, foundationId, 'evening-glam', 'Evening')
    ];

    // Generate an Alternative Look
    const alternative = this.lookGenerator.generate(undertone, foundationId, 'soft-romantic', 'Casual');

    // Simulate AI confidence in the skin analysis
    const confidence = 92 + Math.floor(Math.random() * 7); // 92-98%

    return {
      profile,
      looks,
      alternative,
      confidence
    };
  }
}
