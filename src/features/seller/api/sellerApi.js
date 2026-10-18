import { http } from '@/shared/http/client';
import { toProfileBody, toSellerProfile } from './sellerMapper';

const BASE = '/api/seller';

export const sellerApi = {
  /** Assumed endpoint (see BACKEND_SELLER.md #1). Also feeds the dashboard numbers. */
  getProfile: async () => toSellerProfile((await http.get(`${BASE}/profile`)).data),
  updateProfile: async (form) => { await http.put(`${BASE}/updateProfile`, toProfileBody(form)); },
};
