/**
 * The ONLY file that knows where tokens live.
 *  - access token: memory only (gone on reload, stolen scripts can't read a storage key)
 *  - refresh token: localStorage so a reload keeps the user signed in
 * To move the refresh token (sessionStorage, cookie, ...) change this file and nothing else.
 */
const REFRESH_KEY = 'aeroscale.refreshToken';

let accessToken = null;

const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
  remove: (k) => { try { localStorage.removeItem(k); } catch { /* storage blocked */ } },
};

export const tokenStorage = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => store.get(REFRESH_KEY),
  setTokens({ accessToken: access, refreshToken }) {
    accessToken = access;
    if (refreshToken) store.set(REFRESH_KEY, refreshToken);
  },
  clear() {
    accessToken = null;
    store.remove(REFRESH_KEY);
  },
};
