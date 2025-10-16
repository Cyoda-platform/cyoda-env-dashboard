/**
 * Charts Data Store
 * Zustand store for managing chart data rows
 * Migrated from: .old_project/packages/http-api/src/stores/charts-data.ts
 */

import { create } from 'zustand';

interface ChartRow {
  id: string;
  [key: string]: any;
}

interface ChartsDataState {
  rowsMap: Map<string, ChartRow>;
  rowsArr: ChartRow[];
  
  // Actions
  addChartRows: (rows: ChartRow[]) => void;
  clearChartRows: () => void;
  
  // Getters
  getChartRows: () => ChartRow[];
}

export const useChartsDataStore = create<ChartsDataState>((set, get) => ({
  rowsMap: new Map(),
  rowsArr: [],
  
  addChartRows: (rows) => {
    set((state) => {
      const newRowsMap = new Map(state.rowsMap);
      
      for (const row of rows) {
        newRowsMap.set(row.id, row);
      }
      
      const newRowsArr = Array.from(newRowsMap.values());
      
      return {
        rowsMap: newRowsMap,
        rowsArr: newRowsArr,
      };
    });
  },
  
  clearChartRows: () => {
    set({
      rowsMap: new Map(),
      rowsArr: [],
    });
  },
  
  getChartRows: () => get().rowsArr,
}));

