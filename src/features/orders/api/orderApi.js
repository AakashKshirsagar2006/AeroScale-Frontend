import { http } from '@/shared/http/client';
import { toPage } from '@/shared/http/page';
import { toOrder } from './orderMapper';

const BASE = '/api/v1/orders';

export const orderApi = {
  /** idempotencyKey: reuse the SAME key when retrying, so a double click can never create two orders. */
  checkout: async ({ shippingAddressId, idempotencyKey }) =>
    toOrder((await http.post(`${BASE}/checkout`, { shippingAddressId, idempotencyKey })).data),
  list: async ({ page = 0, size = 8 } = {}) => toPage((await http.get(BASE, { params: { page, size } })).data, toOrder), // assumed endpoint
  cancel: async (orderId) => { await http.delete(`${BASE}/${orderId}/cancel`); },
};
