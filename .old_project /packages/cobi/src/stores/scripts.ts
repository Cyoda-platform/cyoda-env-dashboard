import { defineStore } from 'pinia';
import axios from '@cyoda/ui-lib/src/plugins/axios';
import type { ReusableScriptContentDto } from '../components/DataMapper/ReusableScriptContentDto';

export const useScriptsStore = defineStore({
  id: 'scripts',
  state: () => ({
    defaultState: {},
  }),
  actions: {
    async getScript(scriptName: string) {
      return await axios.get(`/scripts/${encodeURIComponent(scriptName)}`);
    },
    async getListAll(params: any) {
      return await axios.get(`/scripts/list-all`, { params });
    },
    async getVersion(versionID: string) {
      // @ts-ignore
      return await axios.get(`/scripts/versions/${versionID}`, { muteErrors: true });
    },
    async putVersion(data: ReusableScriptContentDto) {
      return await axios.put(`/scripts/versions`, data);
    },
    async putImport(data: ReusableScriptContentDto) {
      return await axios.put(`/scripts/import`, data);
    },
    async deleteVersion(versionID: string) {
      return await axios.delete(`/scripts/versions/${versionID}`);
    },
    async setDefaultScript(versionID: string) {
      return await axios.post(`/scripts/versions/${versionID}/default`);
    },
    async setActiveForAll(versionID: string) {
      return await axios.post(`/scripts/versions/${versionID}/active`);
    },
    async refresh() {
      return await axios.post(`/scripts/refresh`);
    },
    async renameScript({ oldName, newName }: { oldName: string; newName: string }) {
      return await axios.post(`/scripts/${encodeURIComponent(oldName)}`, { scriptName: newName });
    },
    async deleteScript(oldName: string) {
      return await axios.delete(`/scripts/${encodeURIComponent(oldName)}`);
    },
    async renameVersion(data: { id: string }) {
      return await axios.post(`/scripts/versions/${data.id}`, data);
    },
  },
});
