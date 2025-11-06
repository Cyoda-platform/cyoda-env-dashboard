/**
 * Global UI Settings Store
 * Zustand store for global UI settings like entity type toggle
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/stores/globalUiSettings.ts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EntityType = 'BUSINESS' | 'PERSISTENCE';

interface GlobalUiSettingsState {
  entityType: EntityType;
  isEnabledTechView: boolean;
  
  setEntityType: (type: EntityType) => void;
  setIsEnabledTechView: (enabled: boolean) => void;
}

export const useGlobalUiSettingsStore = create<GlobalUiSettingsState>()(
  persist(
    (set) => ({
      // Initial State
      entityType: 'BUSINESS',
      isEnabledTechView: true, // Enable tech view by default for development
      
      // Actions
      setEntityType: (type) => set({ entityType: type }),
      setIsEnabledTechView: (enabled) => set({ isEnabledTechView: enabled }),
    }),
    {
      name: 'global-ui-settings',
      partialize: (state) => ({
        entityType: state.entityType,
        isEnabledTechView: state.isEnabledTechView,
      }),
    }
  )
);

