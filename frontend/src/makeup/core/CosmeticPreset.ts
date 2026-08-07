import type { CosmeticProduct, LipstickFinish } from '../shades';
import type { BlushStyle } from '../BlushMask';
import type { EyeStyle } from '../EyeMask';

export interface BaseCosmeticConfig {
  shade: CosmeticProduct;
  opacity: number;
  finish?: LipstickFinish;
}

export interface BlushConfig extends BaseCosmeticConfig {
  style: BlushStyle;
}

export interface EyeShadowConfig extends BaseCosmeticConfig {
  style: EyeStyle;
}

export interface FoundationConfig {
  shade: string;
  undertone: string;
  renderer: null; // Placeholder for Sprint 8.7+
}

export interface CosmeticPreset {
  version: 1;
  id: string;
  name: string;
  foundation?: FoundationConfig;
  lipstick?: BaseCosmeticConfig;
  blush?: BlushConfig;
  eyeShadow?: EyeShadowConfig;
  opacity: number;     // Global opacity
  intensity: number;   // Global intensity multiplier
}
