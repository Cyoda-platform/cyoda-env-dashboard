import {defineStore} from 'pinia';
import axios from "@cyoda/ui-lib/src/plugins/axios";
import sampleDataJson from '../assets/dataSample.json';

export const useSqlSchemaStore = defineStore({
  id: 'sqlSchema',
  actions: {
    getListAll() {
      return axios.get("/sql/schema/listAll");
    },
    delete(schemaId) {
      return axios.delete(`/sql/schema/${schemaId}`);
    },
    getSchemaById(schemaId: string) {
      return axios.get(`/sql/schema/${schemaId}`)
    },
    saveSchema(data) {
      return axios.post(`/sql/schema/`, data)
    },
    getEntityModelList() {
      return axios.get(`/model/`);
    },
    getGenTable(id: string) {
      return axios.get(`/sql/schema/genTables/${id}`);
    },
    importData() {
      return axios.post('/model/import/JSON/SAMPLE_DATA/nobel_1/1', sampleDataJson)
    },
    updateTables(metaId: string, tables: any[]) {
      return axios.post(`/sql/schema/updateTables/${metaId}`, tables);
    }
  }
});
