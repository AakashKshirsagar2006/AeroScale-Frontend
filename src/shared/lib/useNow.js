import { useSyncExternalStore } from 'react';
import { serverNow } from '../http/serverClock';

// One shared 1-second ticker for every countdown on screen (a grid of 40 cards = still one timer).
let snapshot = serverNow();
let timer = null;
const listeners = new Set();

function subscribe(listener) {
  if (!listeners.size) {
    snapshot = serverNow();
    timer = setInterval(() => {
      snapshot = serverNow();
      listeners.forEach((l) => l());
    }, 1000);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) { clearInterval(timer); timer = null; }
  };
}

/** Current time in ms according to the SERVER clock, re-rendering once a second. */
export const useNow = () => useSyncExternalStore(subscribe, () => snapshot);
