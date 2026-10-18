/**
 * Tiny external store (no React, no Redux). React reads it through useAuth();
 * non-React code (the HTTP client's handlers) can read and write it directly.
 *
 * status:      'loading' (checking for a saved session) | 'authenticated' | 'unauthenticated'
 * endedReason: why the last session ended: 'expired' | 'logout' | null
 * welcome:     true right after sign-up, so the first screen can greet the new user once
 */
let state = { status: 'loading', user: null, endedReason: null, welcome: false };
const listeners = new Set();

export const authStore = {
  getState: () => state,
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  set(patch) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
};
