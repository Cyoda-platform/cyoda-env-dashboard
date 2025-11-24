/**
 * Grafana Store
 * Migrated from @cyoda/processing-manager/src/stores/grafana.ts (Pinia → Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import type { GrafanaState, GrafanaChart } from '../types';

interface GrafanaNode {
  instance: string;
  job: string;
}

interface GrafanaStore extends GrafanaState {
  setCharts: (charts: GrafanaChart[]) => void;
  addChart: (chart: GrafanaChart) => void;
  removeChart: (chartId: string) => void;
  setSelectedChart: (chart: GrafanaChart | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadUp: (node: GrafanaNode) => Promise<boolean>;
  reset: () => void;
}

const initialState: GrafanaState = {
  charts: [],
  selectedChart: null,
  loading: false,
  error: null,
};

// Grafana API configuration
const GRAFANA_BASE_URL = import.meta.env.VITE_APP_GRAFANA_URL || '';
const GRAFANA_SOURCE_ID = import.meta.env.VITE_APP_GRAFANA_SERVER_SOURCE_ID || '1';
const GRAFANA_SOURCE_URL = `${GRAFANA_BASE_URL}/datasources/proxy/${GRAFANA_SOURCE_ID}`;

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

      /**
       * Load server status from Grafana
       * Migrated from: .old_project/packages/processing-manager/src/stores/grafana.ts:loadUp
       */
      loadUp: async (node: GrafanaNode): Promise<boolean> => {
        try {
          const query = encodeURIComponent(`up{instance=~"${node.instance}",job=~"${node.job}"}`);
          const { data } = await axios.get(`${GRAFANA_SOURCE_URL}/api/v1/query?query=${query}`);

          if (data.data?.result?.length > 0 && data.data.result[0].value?.length > 0) {
            return !!parseInt(data.data.result[0].value[1]);
          }
          return false;
        } catch (error) {
          console.error('Failed to load server status from Grafana:', error);
          return false;
        }
      },

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

