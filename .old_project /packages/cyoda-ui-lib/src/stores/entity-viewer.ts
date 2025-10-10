import { defineStore } from "pinia";
import {EntityViewerEntity} from '@cyoda/ui-lib/src/types/types';

interface State {
  entitys: EntityViewerEntity[];
  onlyDynamic: boolean;
}

export const useEntityViewerStore = defineStore({
  id: "entityViewer",
  state: (): State => ({
    entitys: [],
    onlyDynamic: true,
  }),
  getters: {},
  actions: { // equivalent of Vuex actions
    addEntity(path: EntityViewerEntity) {
      if (!this.entitys.find((el) => el.to === path.to)) {
        this.entitys.push(path);
      }
    },

    removeEntity(path: EntityViewerEntity) {
      this.entitys = this.entitys.filter((el) => el.to !== path.to);
    },

    clearEntities() {
      this.entitys = [];
    },

    setOnlyDynamic(value: boolean) {
      this.onlyDynamic = value;
    }
  }
});
