import { http } from '@/shared/http/client';
import { toPage } from '@/shared/http/page';
import { toCatalogItem } from './catalogMapper';

const BASE = '/api/v1/catalog';
const clean = (params) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null));

export const catalogApi = {
  /** type: 'REGULAR' = products with no flash sale, 'ALL' = everything. */
  listProducts: async ({ page = 0, size = 12, sort = 'createdAt,desc', q, minPrice, maxPrice, inStock, type = 'ALL' } = {}) =>
    toPage((await http.get(`${BASE}/products`, { params: clean({ page, size, sort, q, minPrice, maxPrice, inStock: inStock || undefined, type }) })).data, toCatalogItem),

  /** state: 'LIVE' (ending soonest first) or 'UPCOMING' (starting soonest first). */
  listFlashSales: async ({ page = 0, size = 8, state = 'LIVE' } = {}) =>
    toPage((await http.get(`${BASE}/flash-sales`, { params: { page, size, state } })).data, toCatalogItem),

  getProduct: async (id) => toCatalogItem((await http.get(`${BASE}/products/${id}`)).data),
};
