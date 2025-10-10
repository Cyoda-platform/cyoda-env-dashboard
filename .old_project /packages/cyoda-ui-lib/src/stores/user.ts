import { defineStore } from "pinia";
import axios from "../plugins/axios";
import HelperStorage from "../helpers/HelperStorage";

const baseUrl = import.meta.env.VITE_APP_API_BASE || "";
const ENABLE_TECH_VIEW_FF = "feature.enable-tech-view";

interface Role {
  "id": string;
  "desc": string;
}


interface State {
  userAccountInfo: {
    userId: string;
    userName: string;
    legalEntity: {
      id: string;
      name: string;
    };
    roles: Role[];
    currentSubscription: {
      id: string;
      legalEntityId: string;
      status: string;
      tierName: string;
      periodFrom: string;
      limits: any[];
    };
  };
  featureToggles: {
    [key: string]: boolean;
  };
}

const helperStorage = new HelperStorage();
const defaultState = {
  userAccountInfo: {
    userId: "",
    userName: "",
    legalEntity: {
      id: "",
      name: ""
    },
    roles: [],
    currentSubscription: {
      id: "",
      legalEntityId: "",
      status: "",
      tierName: "",
      periodFrom: "",
      limits: []
    }
  },
  featureToggles: {}
};

export const useUserStore = defineStore("user", {
  state: (): State => ({
    ...helperStorage.get("user", {...defaultState})
  }),
  actions: {
    accountInfo() {
      return axios.get(`${baseUrl}/account`);
    },
    saveData(data: State) {
      this.$patch(data);
      helperStorage.set("user", this.$state);
    },
  },
  getters: {
    isEnabledTechView() {
      return !!this.featureToggles[ENABLE_TECH_VIEW_FF];
    }
  }
});

