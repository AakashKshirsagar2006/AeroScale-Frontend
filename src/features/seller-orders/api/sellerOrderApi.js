import { http } from '@/shared/http/client';
import { toSellerOrder } from './orderMapper';

const BASE = '/api/v1/orders';

/**
 * The backend answers with a plain list (no paging). To keep the scrolling UI and the backend independent,
 * this file downloads the list once per filter and hands it out page by page.
 * If the backend later switches to a Spring Page, only this file changes.
 */
const cache = new Map(); // status filter -> mapped rows

export const sellerOrderApi = {
  /** status: CONFIRMED | SHIPPED | DELIVERED | CANCELLED, or omit for all. Page 0 always refreshes from the server. */
  list: async ({ page = 0, size = 8, status } = {}) => {
    const key = status ?? 'ALL';
    if (page === 0 || !cache.has(key)) {
      const { data } = await http.get(`${BASE}/getOrder`, { params: status ? { status } : {} });
      const rows = (Array.isArray(data) ? data : data.content ?? []).map(toSellerOrder).filter((o) => !status || o.status === status);
      cache.set(key, rows);
    }
    const rows = cache.get(key);
    const from = page * size;
    return { items: rows.slice(from, from + size), hasMore: from + size < rows.length, total: rows.length };
  },
  /** `id` = the order item's id. status: 'SHIPPED' (from CONFIRMED) or 'DELIVERED' (from SHIPPED). */
  updateStatus: async (id, status) => { await http.patch(`${BASE}/${id}/status`, { status }); },
};
