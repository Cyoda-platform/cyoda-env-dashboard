import {defineStore} from 'pinia';
import axios from '@cyoda/ui-lib/src/plugins/axios';
import _ from 'lodash';

const defaultState = {
  nodes: [],
};

export const useHttpApiProcessingStore = defineStore({
  id: 'processing',
  state: () => ({
    ...defaultState,
  }),
  actions: {
    transactionsViewEntityChanges(params) {
      const url =
        import.meta.env.VITE_APP_API_BASE_PROCESSING ||
        _.trimEnd(axios.defaults.baseURL, '/').replace('/api', '/processing');
      return axios.get(
        `${url}/platform-processing/transactions/view/entity-changes`,
        {params}
      );
    },
  },
});

