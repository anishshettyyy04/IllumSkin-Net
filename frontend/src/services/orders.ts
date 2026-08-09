import { fetchApi } from './api';
import type { CartItem, OrderRecord } from '../store/useStore';

export interface OrderCreatePayload {
  items: CartItem[];
  shipping_address: string;
  name: string;
  phone: string;
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

  getUserOrders: async (): Promise<OrderRecord[]> => {
    const response = await fetchApi<OrderRecord[]>(`/orders/my`);
    return response.data;
  }
};
