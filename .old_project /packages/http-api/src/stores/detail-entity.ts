import { defineStore } from 'pinia';

interface State {
  changedFields: Array<{ columnPath: string; value: string }>;
}

export const useDetailEntityStore = defineStore({
  id: 'detail-entity',
  state: (): State => ({
    changedFields: [],
  }),
  actions: {
    addEditableItem(val) {
      if (this.changedFields.indexOf(val) === -1) {
        this.changedFields.push(val);
      }
    },
    clearAddEditableItem() {
      this.changedFields = [];
    },
  },
});
