import axios from "@cyoda/ui-lib/src/plugins/axios";
import type {
  ChildStatistics,
  DataSourceConfigDto,
  HttpEndpointConnectionCheckRequestDto,
  RootStatistics,
  TemplateVerificationDto
} from "../components/DataSourceConfig/DataSourceConfig.d.ts";
import type {CobiConfigVersionDto} from "../components/DataMapper/MappingConfigDto.d.ts";
import {defineStore} from "pinia";

export const useDataSourceConfigStore = defineStore({
  id: "dataSourceConfig",
  actions: {
    async postSave(data: DataSourceConfigDto) {
      return await axios.post("/data-source-config/save", data);
    },
    async getListAll() {
      return await axios.get("/data-source-config/list-all");
    },
    async getById(id: string) {
      return await axios.get(`/data-source-config/get-by-id/${id}`);
    },
    async deleteById(id: string) {
      return await axios.delete(`/data-source-config/delete-by-id/${id}`);
    },
    async getAvailableAuthType() {
      return await axios.get(`/data-source-config/available-auth-type`);
    },
    async getAvailableAuthTypeConfig(authType) {
      return await axios.get(`/data-source-config/auth-type-required-params/${authType}`);
    },
    async postCheckEndpointConnection(data: HttpEndpointConnectionCheckRequestDto) {
      return await axios.post(`/data-source-config/check-endpoint-connection`, data);
    },
    async getProxy() {
      return await axios.get(`/data-source-config/proxy`);
    },
    async exportAllCobi() {
      return await axios.get(`/data-source-config/export-all-cobi`);
    },
    async exportCobiForKeys(data) {
      return await axios.post(`/data-source-config/export-cobi-for-keys`, data);
    },
    async importCobiConfig({data, params}) {
      return await axios.post(`/data-source-config/import-cobi-config`, data, {
        params,
      });
    },
    async verifyTemplateCalc(data: TemplateVerificationDto) {
      return await axios.post(`/data-source-config/verify-template-calc`, data);
    },
    async request(data) {
      return await axios.post(`/data-source/request/request`, data);
    },
    async result(id) {
      return await axios.get(`/data-source/request/result/${id}`);
    },
    async resultState(id) {
      return await axios.get(`data-source/request/requestState/${id}`);
    },
    async datasources() {
      return await axios.get(`/data-source/request/datasources`);
    },
    async pluginsSetup() {
      return await axios.get(`/data-source/request/plugins-setup`);
    },
    async authServiceConfigs() {
      return await axios.get(`/data-source-config/auth-service-configs`);
    },
    async authRespParserConfigs() {
      return await axios.get(`/data-source-config/auth-resp-parser-configs`);
    },
    async getStatistics(pagination: any) {
      return await axios.get<RootStatistics>(`/data-source/request/statistics?size=${pagination.pageSize}&page=${pagination.page - 1}`);
    },
    async getStatisticsSearch({pagination, filter}) {
      return await axios.get<RootStatistics>(`/data-source/request/statistics/search?size=${pagination.pageSize}&page=${pagination.page - 1}`, {params: filter});
    },
    async getStatisticsSearchByRawRequestId({pagination, rootRawRequestId}) {
      return await axios.get<ChildStatistics>(`/data-source/request/statistics/${rootRawRequestId}/search?size=${pagination.pageSize}&page=${pagination.page - 1}`);
    },
    async getStatisticsById(rawRequestId: string) {
      return await axios.get(`/data-source/request/statistics/${rawRequestId}`);
    },
    async getStatisticsMapping({rootRawRequestId, mappingConfigId}) {
      return await axios.get(`/data-source/request/statistics/mapping?mappingConfigId=${mappingConfigId}&rawRequestId=${rootRawRequestId}`);
    },
    async getStatisticsSearchEntitiesByRequestIdAndStreamReport({requestId, configDefinitionRequest}) {
      return await axios.post(`/data-source/request/statistics/${requestId}/search_entities`, configDefinitionRequest);
    },
    async getPipeline(id) {
      return await axios.get(`/data-source-config/${id}/pipeline`)
    },
    async deleteRequestDeleteById(rootRawRequestId: string) {
      return await axios.delete(`/data-source/request/delete/${rootRawRequestId}`);
    },
    async getHistory(id) {
      return await axios.get<CobiConfigVersionDto[]>(`/data-source-config/get-by-id/${id}/history`);
    },
    async getHistoryByTimeUid({id, timeId}) {
      return await axios.get<CobiConfigVersionDto[]>(`/data-source-config/get-by-id/${id}/history/${timeId}`);
    }
    // async authServiceConfigs(authServiceClass: string) {
    //   return await axios.get(`/data-source-config/auth-service-config/${authServiceClass}`);
    // },
  },
})
