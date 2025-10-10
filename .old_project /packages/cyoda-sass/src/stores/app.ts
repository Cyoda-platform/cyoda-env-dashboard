import { defineStore } from 'pinia';
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";

const helperStorage = new HelperStorage();

interface State {
  activeMenuLink: string | undefined;
  isToggledMenu: boolean;
}

export const useAppStore = defineStore({
  id: 'app-cobi',
  state: (): State => ({
    activeMenuLink: undefined,
    isToggledMenu: helperStorage.get("isToggledMenu", false),
  }),
  getters: {
    getActiveMenuLink(state): string | undefined {
      return state.activeMenuLink;
    },
  },
  actions: {
    setActiveMenuLink(link: string) {
      this.activeMenuLink = link;
    },
    toggleMenu() {
      this.isToggledMenu = !this.isToggledMenu;
      helperStorage.set("isToggledMenu", this.isToggledMenu);
    },
  },
});
