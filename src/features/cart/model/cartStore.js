import { useMemo } from 'react';
import { createStore, useStore } from '@/shared/lib/createStore';
import { cartApi } from '../api/cartApi';

const store = createStore({ status: 'idle', items: [], userId: null });

async function reload() {
  const items = await cartApi.list();
  store.set({ items, status: 'ready' });
  return items;
}

export const cartActions = {
  /** Safe to call repeatedly; switching user wipes the old user's cart from memory first. */
  async load(userId) {
    if (store.get().userId !== userId) store.set({ items: [], status: 'idle', userId });
    store.set({ status: store.get().items.length ? 'ready' : 'loading' });
    try { await reload(); } catch (error) { store.set({ status: 'error' }); throw error; }
  },
  reload,
  reset: () => store.set({ items: [], status: 'idle', userId: null }),

  /**
   * Adds `qty` on top of what is already in the cart, never beyond `limit` (stock / per-user sale cap).
   * Returns { ok, count } where ok=false means the cart was already at the limit.
   */
  async add(productId, qty = 1, limit = 99) {
    const current = store.get().items.find((i) => i.productId === productId)?.count ?? 0;
    const target = Math.min(current + qty, limit);
    if (target <= current) return { ok: false, count: current };
    await cartApi.add({ productId, count: target });
    await reload();
    return { ok: true, count: target, capped: target < current + qty };
  },

  async setQuantity(cartId, count) {
    const before = store.get().items;
    store.set({ items: before.map((i) => (i.id === cartId ? { ...i, count } : i)) });
    try { await cartApi.updateItem({ cartId, count }); } catch (error) { store.set({ items: before }); throw error; }
  },

  async remove(cartId) {
    const before = store.get().items;
    store.set({ items: before.filter((i) => i.id !== cartId) });
    try { await cartApi.remove(cartId); } catch (error) { store.set({ items: before }); throw error; }
  },

  async clear() {
    const before = store.get().items;
    store.set({ items: [] });
    try { await cartApi.clear(); } catch (error) { store.set({ items: before }); throw error; }
  },
};

export function useCart() {
  const state = useStore(store);
  return useMemo(() => ({
    ...state,
    count: state.items.reduce((n, i) => n + i.count, 0),
    subtotal: state.items.reduce((n, i) => n + i.unitPrice * i.count, 0),
    byProduct: new Map(state.items.map((i) => [i.productId, i])),
    ...cartActions,
  }), [state]);
}
