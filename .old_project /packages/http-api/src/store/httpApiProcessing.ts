import { Module } from "vuex";
import axios from "@cyoda/ui-lib/src/plugins/axios";

const defaultState = {
  nodes: [],
};

const processingModule: Module<any, any> = {
  namespaced: true,
  state: defaultState,
  actions: {
    transactionsViewEntityChanges(context: any, params) {
      return axios.get(
        `/platform-processing/transactions/view/entity-changes`,
        { params }
      );
    },
  },
};

export default processingModule;
