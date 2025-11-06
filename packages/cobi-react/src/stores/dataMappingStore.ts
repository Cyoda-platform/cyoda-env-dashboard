/**
 * Data Mapping Store
 * 
 * State management for data mapping configurations using Zustand.
 * Manages current mapping state, transformers, and UI state.
 * State is persisted to localStorage.
 * 
 * Migrated from: .old_project/packages/cobi/src/stores/platform-mapping.ts (Pinia → Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MappingConfigDto } from '../types';

interface DataMappingState {
  // Current mapping being edited
  currentMapping: MappingConfigDto | null;
  setCurrentMapping: (mapping: MappingConfigDto | null) => void;

  // Transformers list (cached)
  transformers: any[];
  setTransformers: (transformers: any[]) => void;

  // Dictionaries list (cached)
  dictionaries: any[];
  setDictionaries: (dictionaries: any[]) => void;

  // Functions list (cached)
  functions: any[];
  setFunctions: (functions: any[]) => void;

  // Active relation for mapping
  activeRelation: any;
  setActiveRelation: (relation: any) => void;

  // Reassign relation
  reassignRelation: any;
  setReassignRelation: (relation: any) => void;

  // Hovered relations
  hoveredRelations: any[];
  setHoveredRelations: (relations: any[]) => void;

  // Full path relation
  fullPathRelation: string;
  setFullPathRelation: (path: string) => void;

  // Type content
  typeContent: string;
  setTypeContent: (content: string) => void;

  // Source data computed
  sourceDataComputed: any;
  setSourceDataComputed: (data: any) => void;

  // Data type
  dataType: string;
  setDataType: (type: string) => void;

  // Current step in wizard
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Sample content
  sampleContent: string;
  setSampleContent: (content: string) => void;

  // Selected entity class
  selectedEntityClass: string | null;
  setSelectedEntityClass: (entityClass: string | null) => void;

  // Auto-save state
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;

  lastSavedAt: number | null;
  setLastSavedAt: (timestamp: number | null) => void;

  // Dirty state (unsaved changes)
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  currentMapping: null,
  transformers: [],
  dictionaries: [],
  functions: [],
  activeRelation: {},
  reassignRelation: null,
  hoveredRelations: [],
  fullPathRelation: '',
  typeContent: '',
  sourceDataComputed: null,
  dataType: '',
  currentStep: 0,
  sampleContent: '',
  selectedEntityClass: null,
  autoSaveEnabled: true,
  lastSavedAt: null,
  isDirty: false,
};

/**
 * Data Mapping Store Hook
 * 
 * Zustand store for data mapping state with localStorage persistence.
 * 
 * @example
 * ```typescript
 * import { useDataMappingStore } from './stores/dataMappingStore';
 * 
 * function DataMapperComponent() {
 *   const currentMapping = useDataMappingStore((state) => state.currentMapping);
 *   const setCurrentMapping = useDataMappingStore((state) => state.setCurrentMapping);
 *   const isDirty = useDataMappingStore((state) => state.isDirty);
 *   
 *   return (
 *     <div>
 *       {isDirty && <span>Unsaved changes</span>}
 *       <h1>{currentMapping?.name}</h1>
 *     </div>
 *   );
 * }
 * ```
 */
export const useDataMappingStore = create<DataMappingState>()(
  persist(
    (set) => ({
      ...initialState,

      // Current mapping
      setCurrentMapping: (mapping) => set({ currentMapping: mapping }),

      // Cached lists
      setTransformers: (transformers) => set({ transformers }),
      setDictionaries: (dictionaries) => set({ dictionaries }),
      setFunctions: (functions) => set({ functions }),

      // Relations
      setActiveRelation: (relation) => set({ activeRelation: relation }),
      setReassignRelation: (relation) => set({ reassignRelation: relation }),
      setHoveredRelations: (relations) => set({ hoveredRelations: relations }),
      setFullPathRelation: (path) => set({ fullPathRelation: path }),

      // Content
      setTypeContent: (content) => set({ typeContent: content }),
      setSourceDataComputed: (data) => set({ sourceDataComputed: data }),
      setDataType: (type) => set({ dataType: type }),

      // Wizard state
      setCurrentStep: (step) => set({ currentStep: step }),
      setSampleContent: (content) => set({ sampleContent: content }),
      setSelectedEntityClass: (entityClass) => set({ selectedEntityClass: entityClass }),

      // Auto-save
      setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),
      setLastSavedAt: (timestamp) => set({ lastSavedAt: timestamp }),

      // Dirty state
      setIsDirty: (dirty) => set({ isDirty: dirty }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'cobi-data-mapping-storage',
      partialize: (state) => ({
        autoSaveEnabled: state.autoSaveEnabled,
        currentMapping: state.currentMapping,
        currentStep: state.currentStep,
        sampleContent: state.sampleContent,
        selectedEntityClass: state.selectedEntityClass,
      }),
    }
  )
);

