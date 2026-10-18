import { http } from '@/shared/http/client';
import { toCartItem, toUpdateBody } from './cartMapper';

const BASE = '/api/cart';

export const cartApi = {
  list: async () => (await http.get(`${BASE}/getCart`)).data.map(toCartItem),
  /** NOTE: the backend SETS the quantity to `count`, it does not add to it. */
  add: async ({ productId, count }) => { await http.post(`${BASE}/addToCart`, { productId, count }); },
  updateItem: async (args) => { await http.put(`${BASE}/updateCart`, toUpdateBody(args)); },
  remove: async (cartId) => { await http.delete(`${BASE}/deleteFromCart/${cartId}`); },
  clear: async () => { await http.delete(`${BASE}/clearCart`); },
};
