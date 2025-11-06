/**
 * Chaining Configuration Store
 * 
 * State management for data chaining configurations using Zustand.
 * Manages current chaining config state and UI state.
 * State is persisted to localStorage.
 * 
 * Migrated from: .old_project/packages/cobi/src/stores/chaining-config.ts (Pinia → Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChainingConfigDto } from '../types';

interface ChainingConfigState {
  // Current chaining config being edited
  currentConfig: ChainingConfigDto | null;
  setCurrentConfig: (config: ChainingConfigDto | null) => void;

  // Available data sources (cached)
  availableDataSources: any[];
  setAvailableDataSources: (sources: any[]) => void;

  // Available operations (cached)
  availableOperations: any[];
  setAvailableOperations: (operations: any[]) => void;

  // Current step in wizard
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Auto-save state
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;

  lastSavedAt: number | null;
  setLastSavedAt: (timestamp: number | null) => void;

  // Dirty state (unsaved changes)
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;

  // Filter text for list view
  filterText: string;
  setFilterText: (text: string) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  currentConfig: null,
  availableDataSources: [],
  availableOperations: [],
  currentStep: 0,
  autoSaveEnabled: true,
  lastSavedAt: null,
  isDirty: false,
  filterText: '',
};

/**
 * Chaining Configuration Store Hook
 * 
 * Zustand store for chaining configuration state with localStorage persistence.
 * 
 * @example
 * ```typescript
 * import { useChainingConfigStore } from './stores/chainingConfigStore';
 * 
 * function ChainingConfigComponent() {
 *   const currentConfig = useChainingConfigStore((state) => state.currentConfig);
 *   const setCurrentConfig = useChainingConfigStore((state) => state.setCurrentConfig);
 *   const isDirty = useChainingConfigStore((state) => state.isDirty);
 *   
 *   return (
 *     <div>
 *       {isDirty && <span>Unsaved changes</span>}
 *       <h1>{currentConfig?.name}</h1>
 *     </div>
 *   );
 * }
 * ```
 */
export const useChainingConfigStore = create<ChainingConfigState>()(
  persist(
    (set) => ({
      ...initialState,

      // Current config
      setCurrentConfig: (config) => set({ currentConfig: config }),

      // Cached lists
      setAvailableDataSources: (sources) => set({ availableDataSources: sources }),
      setAvailableOperations: (operations) => set({ availableOperations: operations }),

      // Wizard state
      setCurrentStep: (step) => set({ currentStep: step }),

      // Auto-save
      setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),
      setLastSavedAt: (timestamp) => set({ lastSavedAt: timestamp }),

      // Dirty state
      setIsDirty: (dirty) => set({ isDirty: dirty }),

      // Filter
      setFilterText: (text) => set({ filterText: text }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'cobi-chaining-config-storage',
      partialize: (state) => ({
        autoSaveEnabled: state.autoSaveEnabled,
        currentConfig: state.currentConfig,
        currentStep: state.currentStep,
        filterText: state.filterText,
      }),
    }
  )
);

