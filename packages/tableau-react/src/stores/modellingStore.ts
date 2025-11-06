/**
 * Modelling Store
 * Zustand store for CyodaModelling state management
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/stores/modelling.ts
 */

import { create } from 'zustand';

interface ModellingState {
  searchResult: string[];
  addSearchPath: (path: string) => void;
  removeSearchPath: (path: string) => void;
  clearSearch: () => void;
}

export const useModellingStore = create<ModellingState>((set) => ({
  searchResult: [],
  
  addSearchPath: (path: string) =>
    set((state) => ({
      searchResult: state.searchResult.includes(path)
        ? state.searchResult
        : [...state.searchResult, path],
    })),
  
  removeSearchPath: (path: string) =>
    set((state) => ({
      searchResult: state.searchResult.filter((el) => el !== path),
    })),
  
  clearSearch: () =>
    set(() => ({
      searchResult: [],
    })),
}));

