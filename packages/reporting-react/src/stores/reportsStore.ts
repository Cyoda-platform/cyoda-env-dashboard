/**
 * Reports Store
 * Zustand store for managing report settings (ID field customization, etc.)
 * Migrated from: .old_project/packages/http-api/src/stores/reports.ts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ReportSettings {
  id: string;
  settings: {
    idField?: string;
  };
}

interface ReportsState {
  reportsSettings: ReportSettings[];
  
  // Actions
  setReportsSettings: (setting: ReportSettings) => void;
  getStoredSettings: (reportId: string) => ReportSettings | undefined;
  clearReportsSettings: () => void;
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      // Initial State
      reportsSettings: [],
      
      // Actions
      setReportsSettings: (setting: ReportSettings) => {
        set((state) => {
          const existingIndex = state.reportsSettings.findIndex(
            (s) => s.id === setting.id
          );
          
          if (existingIndex >= 0) {
            // Update existing setting
            const newSettings = [...state.reportsSettings];
            newSettings[existingIndex] = setting;
            return { reportsSettings: newSettings };
          } else {
            // Add new setting
            return {
              reportsSettings: [...state.reportsSettings, setting],
            };
          }
        });
      },
      
      getStoredSettings: (reportId: string) => {
        const state = get();
        return state.reportsSettings.find((s) => s.id === reportId);
      },
      
      clearReportsSettings: () => {
        set({ reportsSettings: [] });
      },
    }),
    {
      name: 'cyoda_reports_settings',
    }
  )
);

