import {defineStore} from 'pinia';
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";

const helperStorage = new HelperStorage();
const defaultState = {
  sideBarIsShow: true,
  sideBarIsMinimize: false,
  node: null,
  baseUrl: null,
};

export const useAppStore = defineStore({
  id: 'app',
  state: () => helperStorage.get("app-processing", {...defaultState}),
  actions: {
    sideBarToggle() {
      this.sideBarIsShow = !this.sideBarIsShow;
      helperStorage.set("app", this.$state);
    },
    sideBarMinimizeToggle() {
      this.sideBarIsMinimize = !this.sideBarIsMinimize;
      helperStorage.set("app", this.$state);
    },
    setNode(value) {
      this.node = value;
    },
    setBaseUrl(value) {
      this.baseUrl = value;
    }
  },
});
