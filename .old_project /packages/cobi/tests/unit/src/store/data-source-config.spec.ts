import axios from "@cyoda/ui-lib/src/plugins/axios";
import { setActivePinia, createPinia } from 'pinia';
import MockAdapter from "axios-mock-adapter";
import {useDataSourceConfigStore} from "../../../../src/stores/data-source-config";

const localVue = {};

const mock = new MockAdapter(axios);

describe("Data Source Config Vuex Module", () => {
  let dataSourceConfigStore;

  beforeEach(() => {
    setActivePinia(createPinia())
    dataSourceConfigStore= useDataSourceConfigStore();
  });

  afterEach(() => {
    mock.reset();
  });

  it("should make a POST request for postSave action", async () => {
    const data = {test: "1"};
    const url = "/data-source-config/save";

    mock.onPost(url).reply(200, {});

    await dataSourceConfigStore.postSave(data);

    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe(url);
    expect(JSON.parse(mock.history.post[0].data)).toEqual(data);
  });

  it("should make a GET request for getListAll action", async () => {
    const url = "/data-source-config/list-all";

    mock.onGet(url).reply(200, []);

    await dataSourceConfigStore.getListAll();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getById action", async () => {
    const id = "some-id";
    const url = `/data-source-config/get-by-id/${id}`;

    mock.onGet(url).reply(200, {});

    await dataSourceConfigStore.getById(id);

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a DELETE request for deleteById action", async () => {
    const id = "some-id";
    const url = `/data-source-config/delete-by-id/${id}`;

    mock.onDelete(url).reply(200, {});

    await dataSourceConfigStore.deleteById(id);

    expect(mock.history.delete.length).toBe(1);
    expect(mock.history.delete[0].url).toBe(url);
  });

  it("should make a GET request for getAvailableAuthType action", async () => {
    const url = `/data-source-config/available-auth-type`;

    mock.onGet(url).reply(200, {});

    await dataSourceConfigStore.getAvailableAuthType();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getAvailableAuthTypeConfig action", async () => {
    const authType = "test";
    const url = `/data-source-config/auth-type-required-params/${authType}`;

    mock.onGet(url).reply(200, {});

    await dataSourceConfigStore.getAvailableAuthTypeConfig(authType);

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a POST request for postCheckEndpointConnection action", async () => {
    const url = `/data-source-config/check-endpoint-connection`;
    const data = {test: 1};

    mock.onPost(url).reply(200, data);

    await dataSourceConfigStore.postCheckEndpointConnection(data);

    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe(url);
    expect(mock.history.post[0].data).toBe(JSON.stringify(data));
  });

  it("should make a GET request for getProxy action", async () => {
    const url = `/data-source-config/proxy`;

    mock.onGet(url).reply(200, {});

    await dataSourceConfigStore.getProxy();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for exportAllCobi action", async () => {
    const url = `/data-source-config/export-all-cobi`;

    mock.onGet(url).reply(200, {});

    await dataSourceConfigStore.exportAllCobi();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for exportCobiForKeys action", async () => {
    const data = {test: 1};
    const url = `/data-source-config/export-cobi-for-keys`;

    mock.onPost(url).reply(200, data);

    await dataSourceConfigStore.exportCobiForKeys(data);

    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe(url);
    expect(mock.history.post[0].data).toBe(JSON.stringify(data));
  });

  it("should make a GET request for importCobiConfig action", async () => {
    const data = {test: 1};
    const params = {test: 1};
    const url = `/data-source-config/import-cobi-config`;

    mock.onPost(url).reply(200, data);

    await dataSourceConfigStore.importCobiConfig({data, params});

    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe(url);
    expect(mock.history.post[0].data).toBe(JSON.stringify(data));
  });

  it("should make a GET request for verifyTemplateCalc action", async () => {
    const data = {test: 1};
    const url = `/data-source-config/verify-template-calc`;

    mock.onPost(url).reply(200, data);

    await dataSourceConfigStore.verifyTemplateCalc(data);

    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe(url);
    expect(mock.history.post[0].data).toBe(JSON.stringify(data));
  });

  it("should make a GET request for request action", async () => {
    const data = {test: 1};
    const url = `/data-source/request/request`;

    mock.onPost(url).reply(200, data);

    await dataSourceConfigStore.request(data);

    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe(url);
    expect(mock.history.post[0].data).toBe(JSON.stringify(data));
  });

  it("should make a GET request for result action", async () => {
    const id = "some-id";
    const url = `/data-source/request/result/${id}`;

    mock.onGet(url).reply(200);

    await dataSourceConfigStore.result(id);

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for resultState action", async () => {
    const id = "some-id";
    const url = `data-source/request/requestState/${id}`;

    mock.onGet(url).reply(200);

    await dataSourceConfigStore.resultState(id);

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for datasources action", async () => {
    const url = `/data-source/request/datasources`;

    mock.onGet(url).reply(200);

    await dataSourceConfigStore.datasources();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for pluginsSetup action", async () => {
    const url = `/data-source/request/plugins-setup`;

    mock.onGet(url).reply(200);

    await dataSourceConfigStore.pluginsSetup();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for authServiceConfigs action", async () => {
    const url = `/data-source-config/auth-service-configs`;

    mock.onGet(url).reply(200);

    await dataSourceConfigStore.authServiceConfigs();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for authRespParserConfigs action", async () => {
    const url = `/data-source-config/auth-resp-parser-configs`;

    mock.onGet(url).reply(200);

    await dataSourceConfigStore.authRespParserConfigs();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getStatistics action", async () => {
    const pagination = {
      pageSize: 10,
      page: 1,
    }
    const url = `/data-source/request/statistics?size=${pagination.pageSize}&page=${pagination.page - 1}`;

    mock.onGet(url).reply(200);

    await dataSourceConfigStore.getStatistics(pagination);

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getStatisticsSearch action", async () => {
    const pagination = {
      pageSize: 10,
      page: 1,
    }
    const filter = {};
    const url = `/data-source/request/statistics/search?size=${pagination.pageSize}&page=${pagination.page - 1}`;

    mock.onGet(url).reply(200);

    await dataSourceConfigStore.getStatisticsSearch({pagination, filter});

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getStatisticsSearchByRawRequestId action", async () => {
    const pagination = {
      pageSize: 10,
      page: 1,
    }
    const rootRawRequestId = "some-id";
    const url = `/data-source/request/statistics/${rootRawRequestId}/search?size=${pagination.pageSize}&page=${pagination.page - 1}`;

    mock.onGet(url).reply(200);

    await dataSourceConfigStore.getStatisticsSearchByRawRequestId({pagination, rootRawRequestId});

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getStatisticsById action", async () => {
    const rawRequestId = "some-id";
    const url = `/data-source/request/statistics/${rawRequestId}`;

    mock.onGet(url).reply(200);

    await dataSourceConfigStore.getStatisticsById(rawRequestId);

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getStatisticsMapping action", async () => {
    const rootRawRequestId = "some-id";
    const mappingConfigId = "some-id";
    const url = `/data-source/request/statistics/mapping?mappingConfigId=${mappingConfigId}&rawRequestId=${rootRawRequestId}`;

    mock.onGet(url).reply(200);

    await dataSourceConfigStore.getStatisticsMapping({rootRawRequestId, mappingConfigId});

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getStatisticsSearchEntitiesByRequestIdAndStreamReport action", async () => {
    const requestId = "some-id";
    const configDefinitionRequest = {test: 1};
    const url = `/data-source/request/statistics/${requestId}/search_entities`;

    mock.onPost(url).reply(200);

    await dataSourceConfigStore.getStatisticsSearchEntitiesByRequestIdAndStreamReport({
      requestId,
      configDefinitionRequest
    });

    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe(url);
  });

  it("should make a GET request for getPipeline action", async () => {
    const id = "some-id";
    const url = `/data-source-config/${id}/pipeline`;

    mock.onGet(url).reply(200);

    await dataSourceConfigStore.getPipeline(id);

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for deleteRequestDeleteById action", async () => {
    const rootRawRequestId = "some-id";
    const url = `/data-source/request/delete/${rootRawRequestId}`;

    mock.onDelete(url).reply(200);

    await dataSourceConfigStore.deleteRequestDeleteById(rootRawRequestId);

    expect(mock.history.delete.length).toBe(1);
    expect(mock.history.delete[0].url).toBe(url);
  });

  it("should make a GET request for getHistory action", async () => {
    const id = "some-id";
    const url = `/data-source-config/get-by-id/${id}/history`;

    mock.onGet(url).reply(200);

    await dataSourceConfigStore.getHistory(id);

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getHistoryByTimeUid action", async () => {
    const id = "some-id";
    const timeId = "some-timeId";
    const url = `/data-source-config/get-by-id/${id}/history/${timeId}`;

    mock.onGet(url).reply(200);

    await dataSourceConfigStore.getHistoryByTimeUid({id, timeId});

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });


});
