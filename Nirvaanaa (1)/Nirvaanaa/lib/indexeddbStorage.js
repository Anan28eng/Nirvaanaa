import localforage from 'localforage';
import { createJSONStorage } from 'zustand/middleware';

// Configure a dedicated store for admin data
const adminDb = localforage.createInstance({
  name: 'nirvaanaa-db',
  storeName: 'admin-store',
  description: 'IndexedDB storage for admin dashboard state',
});

export const indexedDbStorage = createJSONStorage(() => ({
  getItem: async (name) => {
    const value = await adminDb.getItem(name);
    return value || null;
  },
  setItem: async (name, value) => {
    await adminDb.setItem(name, value);
  },
  removeItem: async (name) => {
    await adminDb.removeItem(name);
  },
}));


