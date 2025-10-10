import MockAdapter from 'axios-mock-adapter';
import axios from '@cyoda/ui-lib/src/plugins/axios';
import {createPinia, setActivePinia} from "pinia";
import {useChainingConfigStore} from "../../../../src/stores/chaining-config";

describe('ChainingConfigModule Vuex Module', () => {
  let chainingConfigStore;
  let mock;

  beforeEach(() => {
    setActivePinia(createPinia())
    chainingConfigStore = useChainingConfigStore();
    mock = new MockAdapter(axios);
  });

  it('calls postSave and successfully posts data', async () => {
    const data = "test";

    mock.onPost('/chaining-config/save').reply(200, data);

    const result = await chainingConfigStore.postSave(data);
    expect(result.data).toEqual(data);
  });

  it('calls getListAll and successfully gets list', async () => {
    const data = [{test1: "1"}, {test2: "2"}];
    mock.onGet('/chaining-config/list-all').reply(200, data);

    const result = await chainingConfigStore.getListAll();
    expect(result.data).toEqual(data);
  });

  it('calls getHistory and successfully gets history', async () => {
    const id = 'test-id';
    const url = `/chaining-config/get-by-id/${id}/history`;
    mock.onGet(url).reply(200, []);

    await chainingConfigStore.getHistory(id);
    expect(mock.history.get[0].url).toEqual(url)
  });

  it('calls getById', async () => {
    const id = 'test-id';
    const url = `/chaining-config/get-by-id/${id}`;
    mock.onGet(url).reply(200, []);

    await chainingConfigStore.getById(id);
    expect(mock.history.get[0].url).toEqual(url)
  });

  it('calls deleteById', async () => {
    const id = 'test-id';
    const url = `/chaining-config/delete-by-id/${id}`;
    mock.onDelete(url).reply(200, []);

    await chainingConfigStore.deleteById(id);
    expect(mock.history.delete[0].url).toEqual(url)
  });

  it('calls getHistoryByTimeUid', async () => {
    const id = 'test-id';
    const timeId = 'timeId';
    const url = `/chaining-config/get-by-id/${id}/history/${timeId}`;
    mock.onGet(url).reply(200, []);

    await chainingConfigStore.getHistoryByTimeUid({id, timeId});
    expect(mock.history.get[0].url).toEqual(url)
  });
});
