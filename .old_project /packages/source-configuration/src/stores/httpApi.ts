import {defineStore} from 'pinia';
import axios from '@cyoda/ui-lib/src/plugins/axios';
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags";

// Define the store
export const useHttpApiStore = defineStore({
  id: 'httpApi',
  state: () => ({}),
  actions: {
    async getReportingFetchTypes(onlyDynamic = false) {
      if (HelperFeatureFlags.isUseModelsInfo()) {
        const {data} = await axios.get<string[]>(`/platform-api/entity-info/fetch/models-info?onlyDynamic=${onlyDynamic}`);
        return data;
      }
      const {data} = await axios.get(`/platform-api/entity-info/fetch/types?onlyDynamic=${onlyDynamic}`);
      return data;
    },
  },
});
