export interface HistorySettings {
  displayGroupType: "in" | "out";
  lazyLoading: true;
}

export interface HistoryFilter {
  states: string[];
  types: string[];
  authors: string[];
  time_custom: "",
  times: [],
}

export interface ReportHistoryData {
  id: string;
  groupingColumns: string[];
  groupingVersion: string;
  title: string;
  createDateTime: string;
  createDateTimeMkTime: string;
  config: string;
  type: string;
  user: string;
  status: string;
  execution: string;
  rows: string;
  totalRowsCount: number;
  hierarhyEnable: string;
  regroupingPossible: string;
}

export interface StoreParamsReport {
  id: string;
  configName: string;
  reportExecutionTime: number;
  linkStatus: string;
  status: string;
}
