import {defineStore} from 'pinia';
import axios from "@cyoda/ui-lib/src/plugins/axios";
import type {ColDef} from "@cyoda/statemachine/src/types/type";
import HelperAxios from "../helpers/HelperAxios";
import type {CobiConfigVersionDto, CobiCoreMetadataParameterDto} from "../components/DataMapper/MappingConfigDto.d.ts";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags";

export const usePlatformMappingStore = defineStore({
  id: 'platformMapping',
  state: () => ({
    listAllTransformers: [],
    activeRelation: {},
    reassignRelation: null,
    hoveredRelations: [],
    fullPathRelation: '',
    typeContent: '',
    sourceDataComputed: null,
    dataType: '',
  }),
  actions: {
    async getTest() {
      return await axios.get("/platform-mapping-plugin/config/test");
    },
    async getListAllDataTypes() {
      return await axios.get("/platform-mapping-plugin/config/list-all-datatypes");
    },
    async getListAllTransformers() {
      const data = await HelperAxios.getStaticData("/platform-mapping-plugin/config/list-all-transformers");
      this.listAllTransformers = data.data;
      return data;
    },
    async getListAllDictionaries() {
      return await HelperAxios.getStaticData("/platform-mapping-plugin/config/dictionaries");
    },
    async getListAllDataMappings(withSampleContent = true) {
      return await axios.get(`/platform-mapping-plugin/config/list-all-data-mappings?withSampleContent=${withSampleContent}`);
    },
    async getTestDataMapping() {
      return await axios.get("/platform-mapping-plugin/config/test-data-mapping");
    },
    async getDataMapping(id) {
      return await axios.get(`/platform-mapping-plugin/config/get-data-mapping/${id}`);
    },
    async postSave(data) {
      return await axios.post("/platform-mapping-plugin/config/save", data);
    },
    async dryRun(data) {
      return await axios.post("/platform-mapping-plugin/config/dry-run", data);
    },
    async getListAllFunctions() {
      return await HelperAxios.getStaticData("/platform-mapping-plugin/config/list-all-functions");
    },
    async getListExamplesFunctions() {
      return await HelperAxios.getStaticData("/platform-mapping-plugin/config/list-examples");
    },
    async getListExamplesTransformers() {
      return await HelperAxios.getStaticData("/platform-mapping-plugin/config/list-examples-transformers");
    },
    setActiveRelation(data) {
      this.activeRelation = data;
    },
    setReassignRelation(data) {
      this.reassignRelation = data;
    },
    setHoveredRelations(data) {
      this.hoveredRelations = data;
    },
    setFullPathRelation(path) {
      this.fullPathRelation = path;
    },
    setTypeContent(typeContent) {
      this.typeContent = typeContent;
    },
    setSourceDataComputed(sourceDataComputed) {
      this.sourceDataComputed = sourceDataComputed;
    },
    setDataType(dataType) {
      this.dataType = dataType;
    },
    async deleteById(id) {
      return await axios.delete(`/platform-mapping-plugin/config/delete-data-mapping/${id}`);
    },
    async getCriteriaDefs(params) {
      const colPaths = params.colPaths
        .map(el => `colPath=${encodeURIComponent(el)}`)
        .join('&');
      const {data} = await axios.get<ColDef[]>(`/platform-api/entity-info/fetch/coldefs?rootClass=${params.rootClass}&${colPaths}`);
      return data;
    },
    async getListAllCobiMetaParams() {
      return await axios.get<CobiCoreMetadataParameterDto[]>("/platform-mapping-plugin/config/list-all-cobi-meta-params");
    },
    async getHistory(id) {
      return await axios.get<CobiConfigVersionDto[]>(`/platform-mapping-plugin/config/get-data-mapping/${id}/history`);
    },
    async getHistoryByTimeUid({id, timeId}) {
      return await axios.get<CobiConfigVersionDto[]>(`/platform-mapping-plugin/config/get-data-mapping/${id}/history/${timeId}`);
    },
    async validatePaths(entityClass, body) {
      if (HelperFeatureFlags.isUseModelsInfo()) {
        return await axios.post<CobiConfigVersionDto[]>(`/platform-api/entity-info/model-info/paths/validate`, body, {params: {entityModel: entityClass}});
      }
      return await axios.post<CobiConfigVersionDto[]>(`/platform-api/entity-info/paths/validate`, body, {params: {entityClass}});
    },
  },
});
