import { useMemo } from 'react';
import { createStore, useStore } from '@/shared/lib/createStore';
import { buyerApi } from '../api/buyerApi';

// ---- profile ----
const profileStore = createStore({ status: 'idle', profile: null });
export const profileActions = {
  async load() {
    if (!profileStore.get().profile) profileStore.set({ status: 'loading' });
    try { profileStore.set({ profile: await buyerApi.getProfile(), status: 'ready' }); }
    catch { profileStore.set({ status: 'error' }); } // the greeting is optional, never block the app on it
  },
  async save(form) {
    await buyerApi.updateProfile(form);
    await profileActions.load();
  },
  reset: () => profileStore.set({ status: 'idle', profile: null }),
};
export const useProfile = () => ({ ...useStore(profileStore), ...profileActions });

// ---- addresses ----
const addressStore = createStore({ status: 'idle', items: [] });
async function reloadAddresses() {
  const items = await buyerApi.listAddresses();
  // default first, then newest
  addressStore.set({ items: [...items].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)), status: 'ready' });
}
export const addressActions = {
  async load() {
    addressStore.set({ status: addressStore.get().items.length ? 'ready' : 'loading' });
    try { await reloadAddresses(); } catch (error) { addressStore.set({ status: 'error' }); throw error; }
  },
  async add(form) { await buyerApi.addAddress(form); await reloadAddresses(); },
  async update(id, form) { await buyerApi.updateAddress(id, form); await reloadAddresses(); },
  async remove(id) { await buyerApi.deleteAddress(id); await reloadAddresses(); },
  reset: () => addressStore.set({ status: 'idle', items: [] }),
};
export function useAddresses() {
  const state = useStore(addressStore);
  return useMemo(() => ({ ...state, defaultAddress: state.items.find((a) => a.isDefault) ?? state.items[0] ?? null, ...addressActions }), [state]);
}
