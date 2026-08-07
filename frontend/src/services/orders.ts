import { fetchApi } from './api';
import type { CartItem, OrderRecord } from '../store/useStore';

export interface OrderCreatePayload {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shipping_address: string;
  email: string;
  name: string;
}

export const OrderService = {
  createOrder: async (orderPayload: OrderCreatePayload): Promise<OrderRecord> => {
    const response = await fetchApi<OrderRecord>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
    return response.data;
  },

  getOrder: async (orderId: string): Promise<OrderRecord> => {
    const response = await fetchApi<OrderRecord>(`/orders/${orderId}`);
    return response.data;
  },

  getUserOrders: async (email: string): Promise<OrderRecord[]> => {
    const response = await fetchApi<OrderRecord[]>(`/orders/user/${email}`);
    return response.data;
  }
};
