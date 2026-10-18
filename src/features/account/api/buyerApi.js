import { http } from '@/shared/http/client';
import { toAddress, toAddressBody, toProfile, toProfileBody } from './buyerMapper';

const BASE = '/api/buyer';

export const buyerApi = {
  getProfile: async () => toProfile((await http.get(`${BASE}/profile`)).data), // assumed endpoint, see BACKEND_REQUIRED.md
  updateProfile: async (form) => { await http.post(`${BASE}/updateProfile`, toProfileBody(form)); },
  listAddresses: async () => (await http.get(`${BASE}/getAllAddress`)).data.map(toAddress),
  addAddress: async (form) => { await http.post(`${BASE}/addAddress`, toAddressBody(form)); },
  updateAddress: async (id, form) => { await http.put(`${BASE}/updateAddress/${id}`, toAddressBody(form)); },
  deleteAddress: async (id) => { await http.delete(`${BASE}/deleteAddress/${id}`); },
};
