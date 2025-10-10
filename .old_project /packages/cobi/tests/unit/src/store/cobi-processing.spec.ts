import axios from "@cyoda/ui-lib/src/plugins/axios";
import MockAdapter from "axios-mock-adapter";
import cobiProcessing from "../../../../src/store/cobi-processing";
import {setActivePinia, createPinia} from 'pinia';
import {useCobiProcessingStore} from "../../../../src/stores/cobi-processing";

const mock = new MockAdapter(axios);

describe("Cobi Processing Vuex Module", () => {
  let cobiProcessingStore;
  beforeEach(() => {
    setActivePinia(createPinia())
    cobiProcessingStore = useCobiProcessingStore();
    cobiProcessingStore.transactionsList = [];
  });

  afterEach(() => {
    mock.reset();
  });

  it("should add transaction to the list and update storage", () => {
    const transaction = {id: 1, data: "transaction data"};

    cobiProcessingStore.addTransactionsToList({...transaction});


    expect(cobiProcessingStore.transactionsList).toHaveLength(1);
    expect(cobiProcessingStore.transactionsList[0]).toEqual(transaction);
  });

  it("should delete transaction from the list and update storage", () => {
    const transaction1 = {id: 1, data: "transaction data"};
    const transaction2 = {id: 2, data: "another transaction data"};

    cobiProcessingStore.addTransactionsToList({...transaction1});
    cobiProcessingStore.addTransactionsToList({...transaction2});

    expect(cobiProcessingStore.transactionsList).toHaveLength(2);

    cobiProcessingStore.deleteTransactionsFromList({id: 1});

    expect(cobiProcessingStore.transactionsList).toHaveLength(2);
    expect(cobiProcessingStore.transactionsList[0]).toEqual(transaction1);
  });

  it("should make a GET request for getStatusOfTransactions action", async () => {
    const transactionId = "123";

    mock.onGet(`/platform-processing/transactions/view?transactionId=${transactionId}`).reply(200, {});

    await cobiProcessingStore.getStatusOfTransactions(transactionId);

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe(`/platform-processing/transactions/view?transactionId=${transactionId}`);
  });
});
