import { configureHttp, refreshSession } from '@/shared/http/client';
import { isSessionRejected, isTokenExpired } from '@/shared/http/errors';
import { tokenStorage } from '@/shared/storage/tokenStorage';
import { authApi } from '../api/authApi';
import { authStore } from './authStore';

function applySession(session, extra = {}) {
  tokenStorage.setTokens(session);
  authStore.set({ status: 'authenticated', user: session.user, endedReason: null, ...extra });
}

function endSession(reason = null) {
  tokenStorage.clear();
  authStore.set({ status: 'unauthenticated', user: null, endedReason: reason, welcome: false });
}

/** Exchanges the saved refresh token for a fresh pair. Wired into the HTTP client as its `refresh` handler. */
async function refreshTokens() {
  const saved = tokenStorage.getRefreshToken();
  if (!saved) throw Object.assign(new Error('No refresh token'), { code: 'NO_REFRESH_TOKEN' });
  const session = await authApi.refresh(saved);
  applySession(session);
  return session;
}

/** Call once at startup, before rendering. Restores a saved session silently. */
export function initAuth() {
  configureHttp({ refresh: refreshTokens, onSessionExpired: () => endSession('expired') });

  if (!tokenStorage.getRefreshToken()) {
    authStore.set({ status: 'unauthenticated' });
    return;
  }
  refreshSession().catch((error) => {
    // Server said no: session is over. Network down: keep the saved token and let the user retry later.
    if (isSessionRejected(error)) endSession('expired');
    else authStore.set({ status: 'unauthenticated' });
  });
}

export async function login(credentials) {
  const session = await authApi.login(credentials);
  applySession(session);
  return session.user;
}

export async function register(form) {
  const session = await authApi.register(form);
  applySession(session, { welcome: true });
  return session.user;
}

export async function logout() {
  try {
    const saved = tokenStorage.getRefreshToken();
    if (saved) {
      try {
        // skipRefresh: if the access token is stale we refresh by hand below, so the request body
        // carries the NEW refresh token (refresh tokens rotate; the old one is already dead).
        await authApi.logout(saved, { skipRefresh: true });
      } catch (error) {
        if (!isTokenExpired(error)) throw error;
        await refreshSession();
        await authApi.logout(tokenStorage.getRefreshToken());
      }
    }
  } catch {
    /* best effort: we clear the local session either way */
  } finally {
    endSession('logout');
  }
}

export const dismissWelcome = () => authStore.set({ welcome: false });
