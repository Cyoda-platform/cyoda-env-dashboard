/**
 * Data Source Configuration Store
 * 
 * State management for data source configurations using Zustand.
 * Manages current data source config state and UI state.
 * State is persisted to localStorage.
 * 
 * Migrated from: .old_project/packages/cobi/src/stores/data-source-config.ts (Pinia → Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DataSourceConfigDto } from '../types';

interface DataSourceConfigState {
  // Current data source config being edited
  currentConfig: DataSourceConfigDto | null;
  setCurrentConfig: (config: DataSourceConfigDto | null) => void;

  // Available auth types (cached)
  availableAuthTypes: string[];
  setAvailableAuthTypes: (types: string[]) => void;

  // Auth service configs (cached)
  authServiceConfigs: any[];
  setAuthServiceConfigs: (configs: any[]) => void;

  // Auth response parser configs (cached)
  authRespParserConfigs: any[];
  setAuthRespParserConfigs: (configs: any[]) => void;

  // Plugins setup (cached)
  pluginsSetup: any;
  setPluginsSetup: (setup: any) => void;

  // Current step in wizard
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Sample content for preview
  sampleContent: string;
  setSampleContent: (content: string) => void;

  // Connection test results
  connectionTestResult: any;
  setConnectionTestResult: (result: any) => void;

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
  availableAuthTypes: [],
  authServiceConfigs: [],
  authRespParserConfigs: [],
  pluginsSetup: null,
  currentStep: 0,
  sampleContent: '',
  connectionTestResult: null,
  autoSaveEnabled: true,
  lastSavedAt: null,
  isDirty: false,
  filterText: '',
};

/**
 * Data Source Configuration Store Hook
 * 
 * Zustand store for data source configuration state with localStorage persistence.
 * 
 * @example
 * ```typescript
 * import { useDataSourceConfigStore } from './stores/dataSourceConfigStore';
 * 
 * function DataSourceConfigComponent() {
 *   const currentConfig = useDataSourceConfigStore((state) => state.currentConfig);
 *   const setCurrentConfig = useDataSourceConfigStore((state) => state.setCurrentConfig);
 *   const isDirty = useDataSourceConfigStore((state) => state.isDirty);
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
export const useDataSourceConfigStore = create<DataSourceConfigState>()(
  persist(
    (set) => ({
      ...initialState,

      // Current config
      setCurrentConfig: (config) => set({ currentConfig: config }),

      // Cached lists
      setAvailableAuthTypes: (types) => set({ availableAuthTypes: types }),
      setAuthServiceConfigs: (configs) => set({ authServiceConfigs: configs }),
      setAuthRespParserConfigs: (configs) => set({ authRespParserConfigs: configs }),
      setPluginsSetup: (setup) => set({ pluginsSetup: setup }),

      // Wizard state
      setCurrentStep: (step) => set({ currentStep: step }),
      setSampleContent: (content) => set({ sampleContent: content }),
      setConnectionTestResult: (result) => set({ connectionTestResult: result }),

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
      name: 'cobi-data-source-config-storage',
      partialize: (state) => ({
        autoSaveEnabled: state.autoSaveEnabled,
        currentConfig: state.currentConfig,
        currentStep: state.currentStep,
        filterText: state.filterText,
      }),
    }
  )
);

