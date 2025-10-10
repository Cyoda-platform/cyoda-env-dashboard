import {defineStore} from "pinia";
import type {Transition} from "@cyoda/statemachine/src/app/stores/types";

export const useGraphicalStatemachineStore = defineStore('graphical-statemachine', {
  state: () => ({
    positionsMap: null,
    transitionsShowHideList: [],
  }),
  actions: {
    setPositionsMap(positionsMap = null) {
      this.positionsMap = positionsMap;
    },
    async getPositionsMap({workflowId}) {
      let positionsMap = null;
      if (localStorage.positionsMaps) {
        const maps = JSON.parse(localStorage.positionsMaps);
        if (maps) {
          positionsMap = maps[workflowId] || null;
        }
      }
      this.setPositionsMap(positionsMap);
      return positionsMap;
    },

    async updatePositionsMap({positionsMap, workflowId}) {
      let data = {
        [workflowId]: positionsMap,
      };

      if (localStorage.positionsMaps) {
        data = {
          ...JSON.parse(localStorage.positionsMaps),
          ...data,
        };
      }
      localStorage.positionsMaps = JSON.stringify(data);
      this.setPositionsMap(positionsMap);
      return positionsMap;
    },
    addTransitionsShowHideList(id) {
      this.transitionsShowHideList.push(id);
    },

    removeTransitionsShowHideList(id) {
      this.transitionsShowHideList = this.transitionsShowHideList.filter(
        (el: any) => el !== id
      );
    },

    clearTransitionsShowHideList() {
      this.transitionsShowHideList = [];
    },
  },
  getters: {
    // transitionsListFilteredByShowHide(state): Transition[] {
    //   let transitionsList: any[] = [];
    //   transitionsList = state.transitionsList.filter(
    //     (el) => !state.transitionsShowHideList.includes(el.id)
    //   );
    //   return transitionsList;
    // },
  }
})
