/**
 * Grafana Store
 * Migrated from @cyoda/processing-manager/src/stores/grafana.ts (Pinia → Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GrafanaState, GrafanaChart } from '../types';

interface GrafanaStore extends GrafanaState {
  setCharts: (charts: GrafanaChart[]) => void;
  addChart: (chart: GrafanaChart) => void;
  removeChart: (chartId: string) => void;
  setSelectedChart: (chart: GrafanaChart | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: GrafanaState = {
  charts: [],
  selectedChart: null,
  loading: false,
  error: null,
};

export const useGrafanaStore = create<GrafanaStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCharts: (charts) => set({ charts }),
      
      addChart: (chart) => 
        set((state) => ({ 
          charts: [...state.charts, chart] 
        })),
      
      removeChart: (chartId) => 
        set((state) => ({ 
          charts: state.charts.filter(c => c.id !== chartId) 
        })),
      
      setSelectedChart: (chart) => set({ selectedChart: chart }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'processing-manager-grafana-storage',
      partialize: (state) => ({
        charts: state.charts,
      }),
    }
  )
);

