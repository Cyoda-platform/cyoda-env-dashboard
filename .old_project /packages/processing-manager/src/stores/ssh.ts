import { defineStore } from 'pinia';
import HelperStorage from '@cyoda/ui-lib/src/helpers/HelperStorage';

const helperStorage = new HelperStorage();

const defaultState = {
  settings: [],
};

export const useSshStore = defineStore('ssh', {
  state: () => helperStorage.get('ssh', { ...defaultState }),

  actions: {
    setSettings(settings) {
      this.settings.push(settings);
      helperStorage.set('ssh', {settings: this.settings});
    },
  },
});
