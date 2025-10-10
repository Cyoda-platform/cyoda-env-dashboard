import { defineStore } from 'pinia';
import axios from '@cyoda/ui-lib/src/plugins/axios';
import HelperStorage from '@cyoda/ui-lib/src/helpers/HelperStorage';

const helperStorage = new HelperStorage();

const defaultState: any = {
  uploadConfigSampleUploadUrl: "encompass/upload-config/sample-upload",
  uploadFileUploadUrl: "encompass/upload-file/upload",
};

// Define the store
export const useFileUploadApiStore = defineStore({
  id: 'encompass',
  state: () => ({
    ...helperStorage.get("encompass", { ...defaultState }),
  }),
  actions: {
    async postSave(params) {
      const { data } = await axios.post('/encompass/upload-config/save', params);
      return data;
    },
    async getAliases() {
      const { data } = await axios.get('/platform-api/catalog/item/all');
      return data;
    },
    async getMappersList() {
      const { data } = await axios.get('/encompass/upload-config/mappers-list');
      return data;
    },
    async getListNames() {
      const { data } = await axios.get('/encompass/upload-config/list-names');
      return data;
    },
    async getListConfigs() {
      const { data } = await axios.get('/encompass/upload-config/list-configs');
      return data;
    },
  },
});
