import Vuex from "vuex";
import axios from "@cyoda/ui-lib/src/plugins/axios";
import MockAdapter from "axios-mock-adapter";
import {createPinia, setActivePinia} from "pinia";
import {usePlatformMappingStore} from "../../../../src/stores/platform-mapping";

const mock = new MockAdapter(axios);

describe("Platform Mapping Vuex Module", () => {
  let platformMappingStore;

  beforeEach(() => {
    setActivePinia(createPinia())
    platformMappingStore = usePlatformMappingStore();
  });

  afterEach(() => {
    mock.reset();
  });

  it("should make a GET request for getTest action", async () => {
    const url = "/platform-mapping-plugin/config/test";
    mock.onGet(url).reply(200, {});

    await platformMappingStore.getTest();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getListAllDataTypes action", async () => {
    const url = "/platform-mapping-plugin/config/list-all-datatypes";
    mock.onGet(url).reply(200, []);

    await platformMappingStore.getListAllDataTypes();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getListAllTransformers action", async () => {
    const url = "/platform-mapping-plugin/config/list-all-transformers";
    const responseData = [{test: 1, test2: 2}];
    mock.onGet(url).reply(200, responseData);

    await platformMappingStore.getListAllTransformers();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
    expect(platformMappingStore.listAllTransformers).toEqual(responseData);
  });

  it("should make a GET request for getListAllDictionaries action", async () => {
    const url = "/platform-mapping-plugin/config/dictionaries";
    mock.onGet(url).reply(200, []);

    await platformMappingStore.getListAllDictionaries();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getListAllDataMappings action", async () => {
    const withSampleContent = "some-id";
    const url = `/platform-mapping-plugin/config/list-all-data-mappings?withSampleContent=${withSampleContent}`;
    mock.onGet(url).reply(200, []);

    await platformMappingStore.getListAllDataMappings(withSampleContent);

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getTestDataMapping action", async () => {
    const url = `/platform-mapping-plugin/config/test-data-mapping`;
    mock.onGet(url).reply(200, []);

    await platformMappingStore.getTestDataMapping();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getDataMapping action", async () => {
    const id = "some-id";
    const url = `/platform-mapping-plugin/config/get-data-mapping/${id}`;
    mock.onGet(url).reply(200, []);

    await platformMappingStore.getDataMapping(id);

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a POST request for postSave action", async () => {
    const data = {
      test: 1,
      test2: 2
    };
    const url = "/platform-mapping-plugin/config/save";
    mock.onPost(url).reply(200, {});

    await platformMappingStore.postSave(data);

    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe(url);
    expect(JSON.parse(mock.history.post[0].data)).toEqual(data);
  });

  it("should make a POST request for dryRun action", async () => {
    const data = {
      test: 1,
      test2: 2
    };
    const url = `/platform-mapping-plugin/config/dry-run`;
    mock.onPost(url).reply(200, data);

    await platformMappingStore.dryRun(data);

    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe(url);
    expect(JSON.parse(mock.history.post[0].data)).toEqual(data);
  });

  it("should make a GET request for getListAllFunctions action", async () => {
    const url = `/platform-mapping-plugin/config/list-all-functions`;
    mock.onGet(url).reply(200, []);

    await platformMappingStore.getListAllFunctions();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getListExamplesFunctions action", async () => {
    const url = `/platform-mapping-plugin/config/list-examples`;
    mock.onGet(url).reply(200, []);

    await platformMappingStore.getListExamplesFunctions();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getListExamplesTransformers action", async () => {
    const url = `/platform-mapping-plugin/config/list-examples-transformers`;
    mock.onGet(url).reply(200, []);

    await platformMappingStore.getListExamplesTransformers();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a DELETE request for deleteById action", async () => {
    const id = "some-id";
    const url = `/platform-mapping-plugin/config/delete-data-mapping/${id}`;
    mock.onDelete(url).reply(200, []);

    await platformMappingStore.deleteById(id);

    expect(mock.history.delete.length).toBe(1);
    expect(mock.history.delete[0].url).toBe(url);
  });

  it("should make a GET request for getCriteriaDefs action", async () => {
    const params = {
      rootClass: "testClass",
      colPaths: ['path1', 'path2']
    }
    const colPaths = params.colPaths
      .map((el: any) => {
        return `colPath=${encodeURIComponent(el)}`;
      })
      .join("&");
    const url = `/platform-api/entity-info/fetch/coldefs?rootClass=${params.rootClass}&${colPaths}`;
    mock.onGet(url).reply(200, []);

    await platformMappingStore.getCriteriaDefs(params);

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getListAllCobiMetaParams action", async () => {
    const url = `/platform-mapping-plugin/config/list-all-cobi-meta-params`;
    mock.onGet(url).reply(200, []);

    await platformMappingStore.getListAllCobiMetaParams();

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getHistory action", async () => {
    const id = "some-id";
    const url = `/platform-mapping-plugin/config/get-data-mapping/${id}/history`;
    mock.onGet(url).reply(200, []);

    await platformMappingStore.getHistory(id);

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should make a GET request for getHistoryByTimeUid action", async () => {
    const id = "some-id";
    const timeId = "some-timeId";
    const url = `/platform-mapping-plugin/config/get-data-mapping/${id}/history/${timeId}`;
    mock.onGet(url).reply(200, []);

    await platformMappingStore.getHistoryByTimeUid({id, timeId});

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(url);
  });

  it("should commit the correct mutation for setActiveRelation action", async () => {
    const data = {
      test: 1,
      test2: 2
    };
    await platformMappingStore.setActiveRelation(data);

    expect(platformMappingStore.activeRelation).toEqual(data);
  });

  it("should commit the correct mutation for setReassignRelation action", async () => {
    const data = {
      test: 1,
      test2: 2
    };
    await platformMappingStore.setReassignRelation(data);

    expect(platformMappingStore.reassignRelation).toEqual(data);
  });

  it("should commit the correct mutation for setHoveredRelations action", async () => {
    const data = {
      test: 1,
      test2: 2
    };
    await platformMappingStore.setHoveredRelations(data);

    expect(platformMappingStore.hoveredRelations).toEqual(data);
  });

  it("should commit the correct mutation for setFullPathRelation action", async () => {
    const data = {
      test: 1,
      test2: 2
    };
    await platformMappingStore.setFullPathRelation(data);

    expect(platformMappingStore.fullPathRelation).toEqual(data);
  });

  it("should commit the correct mutation for setTypeContent action", async () => {
    const data = {
      test: 1,
      test2: 2
    };
    await platformMappingStore.setTypeContent(data);

    expect(platformMappingStore.typeContent).toEqual(data);
  });

  it("should commit the correct mutation for setSourceDataComputed action", async () => {
    const data = {
      test: 1,
      test2: 2
    };
    await platformMappingStore.setSourceDataComputed(data);

    expect(platformMappingStore.sourceDataComputed).toEqual(data);
  });

  it("should commit the correct mutation for setDataType action", async () => {
    const data = {
      test: 1,
      test2: 2
    };
    await platformMappingStore.setDataType(data);

    expect(platformMappingStore.dataType).toEqual(data);
  });

});
