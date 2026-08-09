import { fetchApi } from './api';
import type { ProductDetail } from './products';

export interface CompleteLook {
  foundation: ProductDetail;
  lipstick?: ProductDetail;
  blush?: ProductDetail;
  explanation: string;
  confidence: number;
  undertone: string;
}

export const RecommendationService = {
  matchShade: async (albedo: number[]) => {
    return fetchApi<any>('/match-shade', {
      method: 'POST',
      body: JSON.stringify({ user_albedo: albedo })
    });
  },
  
  getCompleteLook: async (foundationId: number, undertone: string, confidence: number = 95.0) => {
    return fetchApi<CompleteLook>(`/matching/look?foundation_id=${foundationId}&undertone=${encodeURIComponent(undertone)}&confidence=${confidence}`);
  }
};
