import { defineStore } from 'pinia';
import axios from '@cyoda/ui-lib/src/plugins/axios';

export const useWolterskluwerStore = defineStore({
  id: 'wolterskluwer',
  state: () => ({}),
  actions: {
    async postTestConnection(params) {
      const { data } = await axios.post('/wk/jdbc-source-config/test-connection', params);
      return data;
    },
    async getMappersList() {
      const { data } = await axios.get('/wk/jdbc-source-config/mappers-list');
      return data;
    },
    async getListConfigs() {
      const { data } = await axios.get('/wk/jdbc-source-config/list-configs');
      return data;
    },
    async postSave(params) {
      const { data } = await axios.post('/wk/jdbc-source-config/save', params);
      return data;
    },
    async getRun(cfgId) {
      const { data } = await axios.get(`/wk/jdbc-source-operations/run/${cfgId}`);
      return data;
    },
  },
});
