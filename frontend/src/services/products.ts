import { fetchApi } from './api';

export interface ProductBase {
  id: number;
  brand: string;
  name: string;
  price: number;
  hex: string;
  shade: string;
  category: string;
  rating: number;
  reviews: number;
  isAiCompatible: boolean;
  discount?: number;
}

export interface ProductDetail extends ProductBase {
  description: string;
  highlights: string[];
  ingredients: string;
  usage: string;
  shades: Array<{ id: string; name: string; hex: string }>;
  reviewsList: Array<{ id: number; user: string; rating: number; date: string; comment: string }>;
  images: string[];
}

export const ProductService = {
  getProducts: async (category?: string) => {
    const url = category ? `/products?category=${encodeURIComponent(category)}` : '/products';
    return fetchApi<ProductBase[]>(url);
  },
  
  getProductById: async (id: number) => {
    return fetchApi<ProductDetail>(`/products/${id}`);
  }
};
