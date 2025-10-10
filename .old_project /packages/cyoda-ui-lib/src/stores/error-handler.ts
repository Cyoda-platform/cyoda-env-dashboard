import { defineStore } from 'pinia';
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";

const helperStorage = new HelperStorage();

const defaultState: any = {
  errors: [],
};

const useErrorHandlerStore = defineStore({
  id: 'errorHandler',
  state: () => helperStorage.get('error-handler', { ...defaultState }),
  actions: {
    addError(data: any) {
      this.errors.push(data);
      helperStorage.set('error-handler', this.$state);
    },
    clearErrors() {
      this.errors = [];
      helperStorage.set('error-handler', this.$state);
    },
  },
});

export default useErrorHandlerStore;
