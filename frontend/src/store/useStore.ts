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
  isAiRecommended?: boolean;
  bundleId?: string;
}

export interface SavedLook {
  id: string;
  date: string;
  name?: string;
  items: Omit<CartItem, 'quantity' | 'id' | 'bundleId'>[];
}

export interface OrderRecord {
  id: string;
  status: string;
  created_at: string;
  estimated_delivery: string;
  total: number;
  items: CartItem[];
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
  
  // User Profile Data
  savedLooks: SavedLook[];
  saveLook: (look: SavedLook) => void;
  removeLook: (id: string) => void;
  
  orderHistory: OrderRecord[];
  addOrder: (order: OrderRecord) => void;
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
      
      // User Profile Data
      savedLooks: [],
      saveLook: (look) => set((state) => ({ savedLooks: [look, ...state.savedLooks] })),
      removeLook: (id) => set((state) => ({ savedLooks: state.savedLooks.filter(l => l.id !== id) })),
      
      orderHistory: [],
      addOrder: (order) => set((state) => ({ orderHistory: [order, ...state.orderHistory] })),
    }),
    {
      name: 'illumskin-storage',
    }
  )
);
