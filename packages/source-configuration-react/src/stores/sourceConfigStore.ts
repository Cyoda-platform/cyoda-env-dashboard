/**
 * Zustand store for Source Configuration state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SourceConfigState, UploadConfig, FileUploadProgress } from '../types';

interface SourceConfigStore extends SourceConfigState {
  // Upload URLs
  uploadConfigSampleUploadUrl: string;
  uploadFileUploadUrl: string;

  // Current editing config
  editingConfig: UploadConfig | null;
  setEditingConfig: (config: UploadConfig | null) => void;

  // File upload progress tracking
  uploadProgress: Record<string, FileUploadProgress>;
  setUploadProgress: (configId: string, progress: FileUploadProgress) => void;
  clearUploadProgress: (configId: string) => void;

  // UI state
  isCreateDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  
  isUploadDialogOpen: boolean;
  setUploadDialogOpen: (open: boolean) => void;

  // Filter state
  filterText: string;
  setFilterText: (text: string) => void;

  // Reset store
  reset: () => void;
}

const defaultState: SourceConfigState = {
  uploadConfigSampleUploadUrl: 'encompass/upload-config/sample-upload',
  uploadFileUploadUrl: 'encompass/upload-file/upload',
};

export const useSourceConfigStore = create<SourceConfigStore>()(
  persist(
    (set) => ({
      // Default state
      ...defaultState,

      // Editing config
      editingConfig: null,
      setEditingConfig: (config) => set({ editingConfig: config }),

      // Upload progress
      uploadProgress: {},
      setUploadProgress: (configId, progress) =>
        set((state) => ({
          uploadProgress: {
            ...state.uploadProgress,
            [configId]: progress,
          },
        })),
      clearUploadProgress: (configId) =>
        set((state) => {
          const { [configId]: _, ...rest } = state.uploadProgress;
          return { uploadProgress: rest };
        }),

      // UI state
      isCreateDialogOpen: false,
      setCreateDialogOpen: (open) => set({ isCreateDialogOpen: open }),

      isUploadDialogOpen: false,
      setUploadDialogOpen: (open) => set({ isUploadDialogOpen: open }),

      // Filter
      filterText: '',
      setFilterText: (text) => set({ filterText: text }),

      // Reset
      reset: () =>
        set({
          ...defaultState,
          editingConfig: null,
          uploadProgress: {},
          isCreateDialogOpen: false,
          isUploadDialogOpen: false,
          filterText: '',
        }),
    }),
    {
      name: 'source-config-storage',
      partialize: (state) => ({
        uploadConfigSampleUploadUrl: state.uploadConfigSampleUploadUrl,
        uploadFileUploadUrl: state.uploadFileUploadUrl,
        filterText: state.filterText,
      }),
    }
  )
);

