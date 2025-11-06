/**
 * Global UI Settings Store
 * Zustand store for managing global UI settings
 * 
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/stores/globalUiSettings.ts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EntityType = 'BUSINESS' | 'PERSISTENCE';

interface GlobalUiSettingsState {
  entityType: EntityType;
  
  // Actions
  setEntityType: (type: EntityType) => void;
}

const defaultState = {
  entityType: 'BUSINESS' as EntityType,
};

export const useGlobalUiSettingsStore = create<GlobalUiSettingsState>()(
  persist(
    (set) => ({
      // Initial state
      ...defaultState,

      // Actions
      setEntityType: (type: EntityType) => {
        set({ entityType: type });
      },
    }),
    {
      name: 'cyoda_global_ui_settings',
    }
  )
);

