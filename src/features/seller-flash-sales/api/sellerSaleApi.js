import { http } from '@/shared/http/client';
import { toPage } from '@/shared/http/page';
import { toScheduleBody, toSellerSale } from './saleMapper';

const BASE = '/api/v1/flash-sales';

export const sellerSaleApi = {
  /** status: SCHEDULED | ACTIVE | ENDED | CANCELLED (omit = all). Assumed endpoint (BACKEND_SELLER.md #8). */
  list: async ({ page = 0, size = 8, status } = {}) =>
    toPage((await http.get(BASE, { params: { page, size, ...(status ? { status } : {}) } })).data, toSellerSale),
  /** Existing endpoint. Answers 201 with no body. */
  schedule: async (form) => { await http.post(BASE, toScheduleBody(form)); },
  /** Assumed endpoint: only a SCHEDULED sale can be cancelled. */
  cancel: async (id) => { await http.delete(`${BASE}/${id}`); },
};
