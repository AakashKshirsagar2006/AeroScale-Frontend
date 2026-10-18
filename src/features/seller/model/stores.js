import { createStore, useStore } from '@/shared/lib/createStore';
import { sellerApi } from '../api/sellerApi';

const store = createStore({ status: 'idle', profile: null });

export const sellerProfileActions = {
  async load() {
    if (!store.get().profile) store.set({ status: 'loading' });
    try { store.set({ profile: await sellerApi.getProfile(), status: 'ready' }); }
    catch { store.set({ status: 'error' }); } // pages show their own error; never block the shell
  },
  async save(form) {
    await sellerApi.updateProfile(form);
    await sellerProfileActions.load();
  },
  reset: () => store.set({ status: 'idle', profile: null }),
};

export const useSellerProfile = () => ({ ...useStore(store), ...sellerProfileActions });
