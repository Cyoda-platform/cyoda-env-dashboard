import { defineStore } from "pinia";
import HelperStorage from "../helpers/HelperStorage";

const helperStorage = new HelperStorage();
const defaultState: any = {
  entityType: "BUSINESS",
};

export const useGlobalUiSettingsStore = defineStore("globalUiSettings", {
  state: () => helperStorage.get("globalUiSettings", { ...defaultState }),
  actions: {
    setEntityType(type) {
      this.entityType = type;
      helperStorage.set("globalUiSettings", this.$state);
    },
  },
});
