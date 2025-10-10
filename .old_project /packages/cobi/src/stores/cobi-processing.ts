import axios from "@cyoda/ui-lib/src/plugins/axios";
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";
import { defineStore } from "pinia";

const helperStorage = new HelperStorage();

interface State {
  transactionsList: any[];
}

// defineStore is a function that create stores
export const useCobiProcessingStore = defineStore({
  // unique id of the store across your application
  id: "cobiProcessing",
  state: (): State => ({
    transactionsList: helperStorage.get("cobiProcessing", []),
  }),
  actions: {
    addTransactionsToList(params: any) {
      this.transactionsList.push(params);
      helperStorage.set("cobiProcessing", this.transactionsList);
    },
    deleteTransactionsFromList(id: string) {
      this.transactionsList = this.transactionsList.filter((el) => el.id !== id);
      helperStorage.set("cobiProcessing", this.transactionsList);
    },
    async getStatusOfTransactions(transactionId: string) {
      return await axios.get(`/platform-processing/transactions/view?transactionId=${transactionId}`);
    },
  },
});
