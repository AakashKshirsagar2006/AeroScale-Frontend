import { createStore } from '../lib/createStore';

export const toastStore = createStore({ toasts: [] });
let nextId = 0;

function push(kind, message) {
  const id = ++nextId;
  toastStore.set((s) => ({ toasts: [...s.toasts, { id, kind, message }].slice(-3) }));
  setTimeout(() => toastStore.set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3800);
}

/** toast.success('Added to cart')  -  callable from anywhere, no provider needed. */
export const toast = {
  success: (message) => push('success', message),
  error: (message) => push('error', message),
  info: (message) => push('info', message),
};
