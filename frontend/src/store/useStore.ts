import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string | number;
  product_id: number;
  name: string;
  brand: string;
  price: number;
  shade?: string;
  hex?: string;
  quantity: number;
  image?: string;
}

interface StoreState {
  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  
  // AI Recommendation
  latestAnalysis: any | null;
  setLatestAnalysis: (analysis: any) => void;
  clearAnalysis: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Cart Initial State
      cart: [],
      
      addToCart: (item) => set((state) => {
        const existingIndex = state.cart.findIndex(i => i.product_id === item.product_id && i.shade === item.shade);
        if (existingIndex >= 0) {
          const newCart = [...state.cart];
          newCart[existingIndex].quantity += item.quantity;
          return { cart: newCart };
        }
        return { cart: [...state.cart, { ...item, id: `${item.product_id}-${item.shade || 'default'}-${Date.now()}` }] };
      }),
      
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter(item => item.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => ({
        cart: state.cart.map(item => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)
      })),
      
      clearCart: () => set({ cart: [] }),

      // Analysis State
      latestAnalysis: null,
      setLatestAnalysis: (analysis) => set({ latestAnalysis: analysis }),
      clearAnalysis: () => set({ latestAnalysis: null }),
    }),
    {
      name: 'illumskin-storage',
    }
  )
);
