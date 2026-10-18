import { useSyncExternalStore } from 'react';

/** A 15-line external store. Read it with useStore(), write it from anywhere (components or plain modules). */
export function createStore(initial) {
  let state = initial;
  const listeners = new Set();
  return {
    get: () => state,
    set(patch) {
      state = typeof patch === 'function' ? patch(state) : { ...state, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
export const useStore = (store) => useSyncExternalStore(store.subscribe, store.get);
