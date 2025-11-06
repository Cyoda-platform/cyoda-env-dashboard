import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppStore } from '../types';

/**
 * App store for managing application state
 * - Active menu link
 * - Menu toggle state
 * - Persisted to localStorage
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // State
      activeMenuLink: undefined,
      isToggledMenu: false,

      // Actions
      setActiveMenuLink: (link: string) => set({ activeMenuLink: link }),
      
      toggleMenu: () => set((state) => ({ isToggledMenu: !state.isToggledMenu })),
    }),
    {
      name: 'cyoda-sass-app-storage',
      partialize: (state) => ({
        isToggledMenu: state.isToggledMenu,
      }),
    }
  )
);

