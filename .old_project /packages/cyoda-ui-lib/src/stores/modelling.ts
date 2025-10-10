import { defineStore } from 'pinia';

interface State {
  searchResult: string[];
}

export const useModellingStore = defineStore({
  id: 'modelling',
  state: (): State => ({
    searchResult: [],
  }),
  actions: {
    addSearchPath(path: string) {
      if (!this.searchResult.includes(path)) {
        this.searchResult.push(path);
      }
    },
    removeSearchPath(path: string) {
      this.searchResult = this.searchResult.filter((el: string) => el !== path);
    },
    clearSearch() {
      this.searchResult = [];
    }
  }
});
