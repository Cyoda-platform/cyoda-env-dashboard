export interface Alias {
  alias: string;
  typeShort: string;
  type: string;
  "@bean": string;
  colType: string;
}

export interface ConfigEditorNewForm {
  name: string;
  description: string;
  requestClass: string;
}

export interface ConfigEditorReportsStreamStreamFilter {
  entities: string[];
  status: string[];
  authors: string[];
  times: string[];
  time_custom: string;
}

export interface ConfigEditorReportsStreamTableDataRow {
  id: string;
  name: string;
  username: string;
  deleteLoading?: boolean;
  description: string;
  createdHuman: string;
  created: string;
  entity: string;
  loadingReportButton: boolean;
  state?: string;
}

export interface ConfigEditorReportsTableDataRow {
  id: string;
  name: string;
  entity: string;
  username: string;
  description: string;
  loadingReportButton: boolean;
  reportExecutionTime: number;
  created: string;
  createdHuman: string;
  reportId: string;
  state?: string;
}
