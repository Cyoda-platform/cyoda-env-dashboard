import { defineStore } from 'pinia';

interface State {
  rowsMap: Map<string, { [key: string]: string }>;
  rowsArr: Array<{ [key: string]: string }>;
}

export const useChartsDataStore = defineStore({
  id: 'charts-data',
  state: (): State => ({
    rowsMap: new Map(),
    rowsArr: [],
  }),
  actions: {
    addChartRows(rows) {
      for (const row of rows) {
        this.rowsMap.set(row.id, row);
        this.rowsArr = Array.from(this.rowsMap).map(([, el]) => el);
      }
    },
    clearChartRows() {
      this.rowsMap.clear();
      this.rowsArr = Array.from(this.rowsMap).map(([, el]) => el);
    },
  },
  getters: {
    chartRows() {
      return this.rowsArr;
    },
  },
});
