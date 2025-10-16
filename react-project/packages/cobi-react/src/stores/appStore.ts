/**
 * App Store
 * 
 * Global application state management for COBI using Zustand.
 * Manages application-wide settings and UI state.
 * State is persisted to localStorage for session continuity.
 * 
 * Migrated from: .old_project/packages/cobi/src/stores/* (Pinia → Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // API Configuration
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;

  // UI State
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Current editing context
  currentMappingId: string | null;
  setCurrentMappingId: (id: string | null) => void;

  currentDataSourceId: string | null;
  setCurrentDataSourceId: (id: string | null) => void;

  currentChainingId: string | null;
  setCurrentChainingId: (id: string | null) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  apiBaseUrl: '/api',
  sidebarCollapsed: false,
  currentMappingId: null,
  currentDataSourceId: null,
  currentChainingId: null,
};

/**
 * App Store Hook
 * 
 * Zustand store for global application state with localStorage persistence.
 * 
 * @example
 * ```typescript
 * import { useAppStore } from './stores/appStore';
 * 
 * function MyComponent() {
 *   const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
 *   const toggleSidebar = useAppStore((state) => state.toggleSidebar);
 *   
 *   return (
 *     <button onClick={toggleSidebar}>
 *       {sidebarCollapsed ? 'Expand' : 'Collapse'}
 *     </button>
 *   );
 * }
 * ```
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      // API Configuration
      setApiBaseUrl: (url) => set({ apiBaseUrl: url }),

      // UI State
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Current editing context
      setCurrentMappingId: (id) => set({ currentMappingId: id }),
      setCurrentDataSourceId: (id) => set({ currentDataSourceId: id }),
      setCurrentChainingId: (id) => set({ currentChainingId: id }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'cobi-app-storage',
      partialize: (state) => ({
        apiBaseUrl: state.apiBaseUrl,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

