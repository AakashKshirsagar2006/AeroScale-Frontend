import axios from 'axios';
import { env } from '../config/env';
import { tokenStorage } from '../storage/tokenStorage';
import { isSessionRejected, isTokenExpired } from './errors';
import { syncServerClock } from './serverClock';

/**
 * The one HTTP client every feature uses. It knows nothing about the auth feature:
 * the auth feature plugs in `refresh` and `onSessionExpired` through configureHttp().
 *
 *  - Attaches "Authorization: Bearer <access>" to every request (opt out with { skipAuth: true }).
 *  - On 401 + TOKEN_EXPIRED it refreshes ONCE (single-flight) and replays the request.
 *    Opt out per request with { skipRefresh: true } when the caller wants to handle it itself.
 */
let handlers = { refresh: null, onSessionExpired: null };
export const configureHttp = (next) => { handlers = { ...handlers, ...next }; };

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Backend refresh tokens rotate: a second refresh with the old token logs the user out.
// So every caller (interceptor, app start, logout) shares ONE in-flight refresh.
let inflight = null;
export function refreshSession() {
  if (!handlers.refresh) return Promise.reject(new Error('http: refresh handler is not configured'));
  inflight ??= handlers.refresh().finally(() => { inflight = null; });
  return inflight;
}

http.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  // An expired token on a public endpoint (login, refresh...) would be rejected by the JWT filter, so skip it there.
  if (token && !config.skipAuth) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => {
    const date = response.headers?.date ?? response.headers?.get?.('date');
    if (date) syncServerClock(date);
    return response;
  },
  async (error) => {
    const { config } = error;
    if (!isTokenExpired(error) || !config || config.skipAuth || config.skipRefresh || config._retried || !handlers.refresh) {
      throw error;
    }

    config._retried = true;
    try {
      await refreshSession();
    } catch (refreshError) {
      if (isSessionRejected(refreshError)) handlers.onSessionExpired?.();
      throw error;
    }
    return http(config); // request interceptor re-attaches the fresh access token
  },
);
