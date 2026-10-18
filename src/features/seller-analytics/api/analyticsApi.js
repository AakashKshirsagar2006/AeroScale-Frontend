import { http } from '@/shared/http/client';
import { toAnalytics } from './analyticsMapper';

export const analyticsApi = {
  /** days: 7 | 30 | 90. One request feeds every chart on the page. Assumed endpoint (BACKEND_SELLER.md #6). */
  get: async (days = 30) => toAnalytics((await http.get('/api/v1/seller/analytics', { params: { days } })).data, days),
};
