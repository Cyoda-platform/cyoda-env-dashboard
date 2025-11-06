/**
 * Entity Viewer Store
 * Zustand store for managing entity viewer state
 * 
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/stores/entity-viewer.ts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EntityViewerEntity } from '../types';

interface EntityViewerState {
  entitys: EntityViewerEntity[];
  onlyDynamic: boolean;
  
  // Actions
  addEntity: (entity: EntityViewerEntity) => void;
  removeEntity: (entity: EntityViewerEntity) => void;
  clearEntities: () => void;
  setOnlyDynamic: (value: boolean) => void;
}

export const useEntityViewerStore = create<EntityViewerState>()(
  persist(
    (set, get) => ({
      // Initial state
      entitys: [],
      onlyDynamic: true,

      // Actions
      addEntity: (entity: EntityViewerEntity) => {
        const { entitys } = get();
        // Only add if not already present
        if (!entitys.find((el) => el.to === entity.to)) {
          set({ entitys: [...entitys, entity] });
        }
      },

      removeEntity: (entity: EntityViewerEntity) => {
        const { entitys } = get();
        set({ entitys: entitys.filter((el) => el.to !== entity.to) });
      },

      clearEntities: () => {
        set({ entitys: [] });
      },

      setOnlyDynamic: (value: boolean) => {
        set({ onlyDynamic: value });
      },
    }),
    {
      name: 'cyoda_entity_viewer',
      partialize: (state) => ({
        onlyDynamic: state.onlyDynamic,
      }),
    }
  )
);

