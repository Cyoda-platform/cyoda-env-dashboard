/**
 * App Store
 *
 * Global application state management using Zustand.
 * Manages application-wide settings, selected node, sidebar state, and proxy configuration.
 * State is persisted to localStorage for session continuity.
 *
 * Migrated from @cyoda/processing-manager/src/stores/app.ts (Pinia → Zustand)
 *
 * @example
 * ```typescript
 * import { useAppStore } from '@cyoda/processing-manager-react';
 *
 * function MyComponent() {
 *   const node = useAppStore((state) => state.node);
 *   const setNode = useAppStore((state) => state.setNode);
 *   const toggleSidebar = useAppStore((state) => state.sideBarToggle);
 *
 *   return (
 *     <div>
 *       <p>Current Node: {node}</p>
 *       <button onClick={() => setNode('node-01')}>Select Node</button>
 *       <button onClick={toggleSidebar}>Toggle Sidebar</button>
 *     </div>
 *   );
 * }
 * ```
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState } from '../types';

/**
 * App Store Interface
 *
 * Extends AppState with sidebar state and action methods.
 */
interface AppStore extends AppState {
  /** Whether the sidebar is visible */
  sideBarIsShow: boolean;

  /** Whether the sidebar is minimized */
  sideBarIsMinimize: boolean;

  /** Set the currently selected node */
  setNode: (node: string) => void;

  /** Set the API base URL */
  setBaseUrl: (baseUrl: string) => void;

  /** Enable/disable proxy for API requests */
  setProxyRequest: (proxyRequest: boolean) => void;

  /** Set global loading state */
  setLoading: (loading: boolean) => void;

  /** Set global error message */
  setError: (error: string | null) => void;

  /** Toggle sidebar visibility */
  sideBarToggle: () => void;

  /** Toggle sidebar minimize state */
  sideBarMinimizeToggle: () => void;

  /** Reset store to initial state */
  reset: () => void;
}

/** Initial application state */
const initialState: AppState = {
  node: '',
  baseUrl: '',
  proxyRequest: true,
  loading: false,
  error: null,
};

/** Initial sidebar state */
const initialSidebarState = {
  sideBarIsShow: true,
  sideBarIsMinimize: false,
};

/**
 * App Store Hook
 *
 * Zustand store for global application state with localStorage persistence.
 *
 * Persisted state includes:
 * - Selected node
 * - API base URL
 * - Proxy request setting
 * - Sidebar visibility and minimize state
 *
 * @returns AppStore instance
 *
 * @example
 * ```typescript
 * // Subscribe to specific state
 * const node = useAppStore((state) => state.node);
 *
 * // Access actions
 * const setNode = useAppStore((state) => state.setNode);
 *
 * // Access state without subscription (for event handlers)
 * const currentNode = useAppStore.getState().node;
 *
 * // Reset to defaults
 * useAppStore.getState().reset();
 * ```
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,
      ...initialSidebarState,

      setNode: (node) => set({ node }),

      setBaseUrl: (baseUrl) => set({ baseUrl }),

      setProxyRequest: (proxyRequest) => set({ proxyRequest }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      sideBarToggle: () => set((state) => ({ sideBarIsShow: !state.sideBarIsShow })),

      sideBarMinimizeToggle: () => set((state) => ({ sideBarIsMinimize: !state.sideBarIsMinimize })),

      reset: () => set({ ...initialState, ...initialSidebarState }),
    }),
    {
      name: 'processing-manager-app-storage',
      partialize: (state) => ({
        node: state.node,
        baseUrl: state.baseUrl,
        proxyRequest: state.proxyRequest,
        sideBarIsShow: state.sideBarIsShow,
        sideBarIsMinimize: state.sideBarIsMinimize,
      }),
    }
  )
);

