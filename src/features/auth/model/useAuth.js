import { useSyncExternalStore } from 'react';
import { authStore } from './authStore';
import { dismissWelcome, login, logout, register } from './authService';

/** The one hook other features need: who is signed in, plus the actions. */
export function useAuth() {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getState);
  return { ...state, isAuthenticated: state.status === 'authenticated', login, register, logout, dismissWelcome };
}
