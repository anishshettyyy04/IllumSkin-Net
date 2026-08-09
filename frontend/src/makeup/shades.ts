export type LipstickFinish = 'Matte' | 'Satin' | 'Gloss' | 'Dewy' | 'Glow' | 'Shimmer' | 'Metallic';
export type CosmeticCategory = 'lipstick' | 'blush' | 'eye';

export interface CosmeticProduct {
  id: string;
  category: CosmeticCategory;
  name: string;
  hex: string;
  opacity: number;
  finish: LipstickFinish;
}

export const LIPSTICK_SHADES: CosmeticProduct[] = [
  {
    id: 'classic-red',
    category: 'lipstick',
    name: 'Classic Red',
    hex: '#D32F2F',
    opacity: 0.85,
    finish: 'Matte'
  },
  {
    id: 'berry-plum',
    category: 'lipstick',
    name: 'Berry Plum',
    hex: '#7B1FA2',
    opacity: 0.8,
    finish: 'Satin'
  },
  {
    id: 'rose-nude',
    category: 'lipstick',
    name: 'Rose Nude',
    hex: '#D49A9A',
    opacity: 0.75,
    finish: 'Satin'
  },
  {
    id: 'coral-peach',
    category: 'lipstick',
    name: 'Coral Peach',
    hex: '#FF8A65',
    opacity: 0.7,
    finish: 'Gloss'
  },
  {
    id: 'warm-brown',
    category: 'lipstick',
    name: 'Warm Brown',
    hex: '#8D6E63',
    opacity: 0.8,
    finish: 'Matte'
  },
  {
    id: 'soft-pink',
    category: 'lipstick',
    name: 'Soft Pink',
    hex: '#F48FB1',
    opacity: 0.65,
    finish: 'Gloss'
  },
  {
    id: 'deep-wine',
    category: 'lipstick',
    name: 'Deep Wine',
    hex: '#4A148C',
    opacity: 0.9,
    finish: 'Matte'
  }
];

export const BLUSH_SHADES: CosmeticProduct[] = [
  { id: 'soft-rose', category: 'blush', name: 'Soft Rose', hex: '#D87D7D', opacity: 0.6, finish: 'Matte' },
  { id: 'peach-glow', category: 'blush', name: 'Peach Glow', hex: '#F09B8B', opacity: 0.5, finish: 'Glow' },
  { id: 'berry-bloom', category: 'blush', name: 'Berry Bloom', hex: '#A34A6A', opacity: 0.6, finish: 'Satin' },
  { id: 'warm-coral', category: 'blush', name: 'Warm Coral', hex: '#E67B66', opacity: 0.55, finish: 'Dewy' },
  { id: 'dusty-pink', category: 'blush', name: 'Dusty Pink', hex: '#C28492', opacity: 0.6, finish: 'Matte' },
  { id: 'terracotta', category: 'blush', name: 'Terracotta', hex: '#B55B49', opacity: 0.65, finish: 'Matte' },
  { id: 'natural-flush', category: 'blush', name: 'Natural Flush', hex: '#E2919A', opacity: 0.5, finish: 'Satin' },
  { id: 'soft-mauve', category: 'blush', name: 'Soft Mauve', hex: '#A67482', opacity: 0.6, finish: 'Dewy' }
];

export const EYE_SHADES: CosmeticProduct[] = [
  { id: 'champagne', category: 'eye', name: 'Champagne', hex: '#F7E7CE', opacity: 0.7, finish: 'Shimmer' },
  { id: 'rose-gold', category: 'eye', name: 'Rose Gold', hex: '#B76E79', opacity: 0.8, finish: 'Metallic' },
  { id: 'soft-brown', category: 'eye', name: 'Soft Brown', hex: '#8B5A2B', opacity: 0.85, finish: 'Matte' },
  { id: 'chocolate', category: 'eye', name: 'Chocolate', hex: '#3D1C02', opacity: 0.9, finish: 'Matte' },
  { id: 'taupe', category: 'eye', name: 'Taupe', hex: '#483C32', opacity: 0.8, finish: 'Satin' },
  { id: 'copper', category: 'eye', name: 'Copper', hex: '#B87333', opacity: 0.85, finish: 'Metallic' },
  { id: 'bronze', category: 'eye', name: 'Bronze', hex: '#CD7F32', opacity: 0.85, finish: 'Shimmer' },
  { id: 'plum', category: 'eye', name: 'Plum', hex: '#8E4585', opacity: 0.8, finish: 'Satin' },
  { id: 'emerald', category: 'eye', name: 'Emerald', hex: '#50C878', opacity: 0.75, finish: 'Shimmer' },
  { id: 'midnight-blue', category: 'eye', name: 'Midnight Blue', hex: '#191970', opacity: 0.85, finish: 'Matte' }
];

export const getShadeById = (id: string, category?: CosmeticCategory): CosmeticProduct | undefined => {
  if (category === 'blush') {
    return BLUSH_SHADES.find(s => s.id === id);
  }
  if (category === 'eye') {
    return EYE_SHADES.find(s => s.id === id);
  }
  return LIPSTICK_SHADES.find(s => s.id === id) || BLUSH_SHADES.find(s => s.id === id) || EYE_SHADES.find(s => s.id === id);
};
