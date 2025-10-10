import {useChartsDataStore} from "../../../src/stores/charts-data";
import {createPinia, setActivePinia} from "pinia";

describe('chartsData', () => {
  let chartsDataStore;

  beforeEach(() => {
    setActivePinia(createPinia())
    chartsDataStore = useChartsDataStore();
  });

  it('adds chart rows to the store', () => {
    const rows = [
      {id: '1', data: 'data1'},
      {id: '2', data: 'data2'},
    ];

    chartsDataStore.addChartRows(rows);

    expect(chartsDataStore.rowsMap.size).toBe(2);
    expect(chartsDataStore.rowsArr).toEqual(rows);
  });

  it('clears chart rows from the store', () => {
    const rows = [
      {id: '1', data: 'data1'},
      {id: '2', data: 'data2'},
    ];

    chartsDataStore.addChartRows(rows);

    chartsDataStore.clearChartRows();

    expect(chartsDataStore.rowsMap.size).toBe(0);
    expect(chartsDataStore.rowsArr).toEqual([]);
  });

  it('gets chart rows using the getter', () => {
    const rows = [
      {id: '1', data: 'data1'},
      {id: '2', data: 'data2'},
    ];

    chartsDataStore.addChartRows(rows);

    const chartRows = chartsDataStore.chartRows;

    expect(chartRows).toEqual(rows);
  });
});
