import { http } from '@/shared/http/client';
import { toLoginBody, toRegisterBody, toSession } from './authMapper';

const BASE = '/api/auth';
// Public endpoints must not carry a (possibly expired) Bearer token, or the backend's JWT filter rejects them.
const PUBLIC = { skipAuth: true };

export const authApi = {
  login: async (credentials) => toSession((await http.post(`${BASE}/login`, toLoginBody(credentials), PUBLIC)).data),
  register: async (form) => toSession((await http.post(`${BASE}/register`, toRegisterBody(form), PUBLIC)).data),
  refresh: async (refreshToken) => toSession((await http.post(`${BASE}/refreshToken`, { token: refreshToken }, PUBLIC)).data),
  logout: async (refreshToken, options) => { await http.post(`${BASE}/logout`, { token: refreshToken }, options); },
};
