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
  isEnabledTechView: boolean;

  // Actions
  setEntityType: (type: EntityType) => void;
  setIsEnabledTechView: (enabled: boolean) => void;
}

export const useGlobalUiSettingsStore = create<GlobalUiSettingsState>()(
  persist(
    (set) => ({
      // Initial state
      entityType: 'BUSINESS' as EntityType,
      isEnabledTechView: true,

      // Actions
      setEntityType: (type: EntityType) => {
        set({ entityType: type });
      },
      setIsEnabledTechView: (enabled: boolean) => {
        set({ isEnabledTechView: enabled });
      },
    }),
    {
      name: 'cyoda_global_ui_settings',
      partialize: (state) => ({
        entityType: state.entityType,
        isEnabledTechView: state.isEnabledTechView,
      }),
    }
  )
);

