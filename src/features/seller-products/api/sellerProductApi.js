import { http } from '@/shared/http/client';
import { toPage } from '@/shared/http/page';
import { toProductFormData, toSellerProduct } from './productMapper';

const BASE = '/api/v1/seller/products';
const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }; // photos are slower than JSON
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '' && v !== null));

export const sellerProductApi = {
  /** status: DRAFT | ACTIVE | ARCHIVED (omit = all). `status` and `q` are new optional params (BACKEND_SELLER.md #3). */
  list: async ({ page = 0, size = 12, status, q, sort = 'createdAt,desc' } = {}) =>
    toPage((await http.get(BASE, { params: clean({ page, size, status, q, sort }) })).data, toSellerProduct),
  get: async (id) => toSellerProduct((await http.get(`${BASE}/${id}`)).data),
  create: async (form, image) => toSellerProduct((await http.post(BASE, toProductFormData(form, image), MULTIPART)).data),
  update: async (id, form, image) => toSellerProduct((await http.put(`${BASE}/${id}`, toProductFormData(form, image), MULTIPART)).data),
  /** Adds units to the warehouse total. */
  restock: async (id, quantity) => { await http.patch(`${BASE}/${id}/stock`, { quantity }); },
  /** Soft delete: the backend sets status ARCHIVED. */
  archive: async (id) => { await http.delete(`${BASE}/${id}`); },
};
