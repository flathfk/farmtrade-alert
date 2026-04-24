
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      username: null,
      unreadCount: 0,

      login: (token, username) => set({ token, username }),
      logout: () => set({ token: null, username: null, unreadCount: 0 }),
      setUnreadCount: (count) => set({ unreadCount: count }),
    }),
    { name: 'auth-storage' }
  )
);

export default useAuthStore;
