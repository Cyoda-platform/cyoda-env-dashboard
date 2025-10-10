import { defineStore } from 'pinia';
import axios from "@cyoda/ui-lib/src/plugins/axios";
import type {CobiConfigVersionDto} from "../components/DataMapper/MappingConfigDto.d.ts";

export const useChainingConfigStore = defineStore({
  id: 'chainingConfig',
  actions: {
    async postSave(data: any) {
      return await axios.post("/chaining-config/save", data);
    },
    async getListAll() {
      return await axios.get("/chaining-config/list-all");
    },
    async getById(id) {
      return await axios.get(`/chaining-config/get-by-id/${id}`);
    },
    async deleteById(id){
      return await axios.delete(`/chaining-config/delete-by-id/${id}`);
    },
    async getHistory(id){
      return await axios.get<CobiConfigVersionDto[]>(`/chaining-config/get-by-id/${id}/history`);
    },
    async getHistoryByTimeUid({id, timeId}){
      return await axios.get<CobiConfigVersionDto[]>(`/chaining-config/get-by-id/${id}/history/${timeId}`);
    }
  }
});
