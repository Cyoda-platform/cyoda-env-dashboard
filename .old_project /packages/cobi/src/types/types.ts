export interface ItemAPILink {
  hreflang?: null;
  title?: string | null;
  type?: "GET" | "POST";
  deprecation?: null;
}

export interface Link {
  href: string;
  title: string;
  type: string;
}

type ItemHistoryKey = "/report/{id}/stats" | "/report/{id}/config" | "/report/{id}/groups";

export interface ItemHistory {
  reportHistoryFields: ReportHistoryFields;
  _links?: {
    [key in ItemHistoryKey]: Link;
  };
}

export interface ReportHistoryFields {
  configName: string;
  createTime: string;
  finishTime: string;
  id: string;
  groupingVersion: string;
  reportFailed: boolean;
  type: string;
  userId: string;
  user?: {
    username: string;
  };
  description: string;
  status: string;
  hierarhyEnable: boolean;
  regroupingPossible: boolean;
  groupingColumns: string[];
  reportId: string;
  totalRowsCount: string;
}

// report stats response
export interface IReportStats {
  id: string; // "user@cyoda.com-InterfaceMessage-dd5e06f0-7daa-11e9-8aa2-901b0ea4aa73"
  createTime: string; // "2019-05-23T22:34:02.342+0000"
  finishTime: string; // "2019-05-23T22:34:02.929+0000"
  reportFailed: boolean;
  secondPhaseFinished: boolean;
  groupsCount: number;
  totalRowsCount: number;
  markedAsCancelled: boolean;
  rowsCountForFinishedShards?: any;
  reportFailedShards?: any;
  user: string; // "user@cyoda.com"
  configName: string; // "PLAY-InterfaceMessage_0-ExampleFixMessageReport"
  gridConfigId?: any;
  version?: any;
  pointTime: string; // "2199-12-31T23:00:00.000+0000";
  valuationPointTime: string; // "2019-05-22T21:09:36.632+0000";
  description?: any;
  _links?: any;
}

// report status response
export interface IReportStatus {
  content: {
    status: "STARTED" | "RUNNING" | "SUCCESSFUL" | "CANCELLED" | "FAILED";
    startTime: string; // '2019-06-29T06:31:21.355+0000'
    finishTime?: string; // '2019-06-29T06:31:21.884+0000'
    duration?: string; // '00s 529ms'
  };
  _links?: any;
}

export interface IDefinition {
  content: IDefinitionContent;
  _links?: any;
}

export interface IDefinitionStream {
  "@bean"?: string;
  createDate?: string;
  description: string;
  id?: string;
  name: string;
  owner?: string;
  streamDataDef: StreamDataDef;
}

export interface StreamDataDef {
  aliasDefs: AliasDef[];
  colDefs: ColDef[];
  columns: IDefinitionColumn[];
  condition: IDefinitionContentConditionGroup;
  rangeCondition: IDefinitionContentCondition;
  rangeOrder: "ASC" | "DESC";
  requestClass: string;
}

export interface IDefinitionContent {
  "@bean": string; // 'com.cyoda.service.api.beans.ReportDefinition'
  description: string;
  hierarhyEnable?: boolean;
  reportVersion?: number;
  requestClass: string; // 'com.cyoda.core.model.message.InterfaceMessage'
  condition: IDefinitionContentConditionGroup;
  sorting: IDefinitionContentSorting[];
  grouping: ReportColumn[];
  summary: Array<[ReportColumn, string[]]>;
  columns: IDefinitionColumn[];
  pointTime: string; // '2200-01-01T00:00:00.000+01:00'
  valuations: any[];
  valuationPointTime: string; // '2019-05-22T23:25:49.377+02:00'
  aliases: { [index: string]: AliasDefinition };
  colDefs: ColDef[];
  aliasDefs: AliasDef[];
  singletonReport: boolean;
}

export interface IDefinitionContentStream {
  "@bean"?: string; // 'com.cyoda.service.api.beans.ReportDefinition'
  description?: string;
  requestClass: string; // 'com.cyoda.core.model.message.InterfaceMessage'
  condition: IDefinitionContentConditionGroup;
  rangeCondition: IDefinitionContentCondition;
  rangeOrder: "ASC" | "DESC";
  columns: IDefinitionColumn[];
  pointTime?: string; // '2200-01-01T00:00:00.000+01:00'
  valuations?: any[];
  valuationPointTime?: string; // '2019-05-22T23:25:49.377+02:00'
  aliases?: { [index: string]: AliasDefinition };
  colDefs: ColDef[];
  aliasDefs: AliasDef[];
}

export interface IDefinitionContentStreamRequest {
  "@bean": string;
  pointTime: number | null;
  offset: number;
  length: number;
  fromPosIndex: number;
  sdDef: IDefinitionContentStream;
}

export interface IDefinitionContentStreamResult {
  lastRowIndexPosition: number;
  offset: number;
  pageSize: number;
  pointTime: number;
  rows: Array<{ columnsValues: { [key: string]: string } }>;
}

export interface ColDef {
  fullPath: string;
  parts: {
    "@meta": string;
    value: ColDefValue[];
  };
  colType: string;
}

export interface AliasDefColDef {
  colDef: ColDef;
  mapperClass: string;
  mapperParameters?: string;
}

export interface CatalogItem {
  "@bean"?: string;
  aliasDef: AliasDef;
  createDate?: string;
  desc: string;
  entityClass: string;
  id?: string;
  state?: string;
  user?: string;
  name: string;
}

export interface CatalogItemExportImportContainer {
  "@bean"?: string;
  aliases: CatalogItem[];
}

export interface AliasDef {
  name: string;
  aliasPaths: {
    "@meta": string;
    value: AliasDefColDef[];
  };
  aliasType: string;
}

export interface ColDefValue {
  rootClass: string;
  path: string;
  type: string;
}

export interface IDefinitionContentSummary {
  [index: string]: SummaryType[];
}

export interface IDefinitionColumn {
  "@bean"?: string;
  name: string; // 'id'
  id?: string; // 'id'
  dataType?: string; // 'java.util.UUID'
  type?: string; // 'COLUMN'
  rangeField?: boolean; // false
  parts?: {
    "@meta": string; // 'com.cyoda.core.reports.columnspecs.ReportColumnPartSpec[]'
    value: any[];
  };
  withRelatedObjects?: boolean; // false
}

export interface IDefinitionContentCondition {
  "@bean": string;
  fieldName: string;
  operation: string;
  from?: IDefinitionContentConditionValue;
  to?: IDefinitionContentConditionValue;
  value?: IDefinitionContentConditionValue | string;
}

export interface IDefinitionContentConditionGroup {
  "@bean": string;
  operator: string;
  conditions?: Array<IDefinitionContentCondition | IDefinitionContentConditionGroup>;
}

export interface IDefinitionContentConditionValue {
  "@type": string;
  value: any;
}

export type SummaryType = "MAX" | "MIN" | "COUNT" | "COUNT_UNIQUE" | "SUM" | "AVG" | "";

export interface AliasDefinition {
  type: string;
  paths: AliasPath[];
}

export interface AliasPath {
  name: string;
  path: string;
  type: string;
  mapperClass: string;
}

export interface TransferOption {
  label: string;
  key: string;
  type: SummaryType;
  options?: Array<{ label: string; key: string }>;
}

export interface ReportColumn {
  "@bean": string;
  name: string;
}

export interface IDefinitionContentSorting {
  column: ReportColumn;
  reverse: boolean;
}

export interface IGetDefinitionsQueryParams {
  user?: string;
  fields?: Array<"id" | "description" | "type" | "user">;
  size?: number;
}

export interface IGetDefinitionsArgs {
  pageUrl?: string;
  params: IGetDefinitionsQueryParams;
}

export interface IGetGroupsPathParams {
  reportId: string;
}

export interface GroupHeader {
  groupValuesJson: string;
  groupValuesJsonBase64: string;
  groupValues: string[];
  parentGroupValuesJson: string | null;
  groupLevel: number;
  isNext: boolean;
  leaf: boolean;
  summary: GroupHeaderSummary;
  commonGroupValues: {
    [key: string]: string;
  };
  columnNames: string[];
  _links: {
    "/report/{id}/{grouping_version}/groups/{parent_group_json_base64}": {
      href: string;
      title: string;
      type: string;
    };
    "/report/{id}/group_rows/{group_json_base64}": {
      href: string;
      title: string;
      type: string;
    };
  };
  parentId?: string;
  groupId?: string;
}

export interface GroupHeaderSummary {
  [key: string]: {
    values: {
      COUNT: number;
    };
  };
}

export interface ReportGroup {
  _embedded: {
    groupHeaders: GroupHeader[];
  };
  page: Page;
}

export interface ReportHistory {
  _embedded: {
    reportHistoryFieldsViews: ItemHistory[];
  };
  page: Page;
}

type GridConfigFieldsViewKeys = "/definitions" | "/pre" | "/history";

export interface GridConfigFieldsView {
  gridConfigFields: {
    description: string;
    id: string;
    groupingVersion: string;
    type: string;
    user?: User;
    userId?: string;
    creationDate: string;
  };
  links: { [key in GridConfigFieldsViewKeys]: Link };
}

export interface ReportDefinition {
  _embedded: {
    gridConfigFieldsViews: GridConfigFieldsView[];
  };
  page: Page;
}

export interface ReportingInfoRow {
  columnName: string;
  columnPath: string;
  type: string;
  elementInfo?: ReportingInfoRow;
  declaredClass?: {
    abstract: boolean;
    class: string;
  };
  elementType?: ReportingInfoRow;
  clazzType?: string;
  subClasses?: Array<{
    abstract: boolean;
    class: string;
  }>;
  keyInfo?: string;
}

export interface ReportMapper {
  shortName: string;
  mapperClass: string;
  inType: string;
  outType: string;
  entityClass: string;
  parametrized: boolean;
  decision: string;
}

export interface Login {
  username: string;
  password: string;
}

export interface StreamDefinitionsIndex {
  indexName: string;
  rangeField: ColumnInfo;
  noneRangeFields: ColumnInfo[];
  decision: string;
}

export interface Column {
  columnInfo: ColumnInfo;
  decision: boolean;
  type: string;
  value: string;
  realClass: string;
  listSize: number;
  mapKeys?: string[];
}

export interface ColumnInfo {
  columnName: string;
  columnPath: string;
  type: string;
  clazzType: string;
  decision: null;
  declaredClass: string;
  subClasses: string[];
  value: string | boolean | number;
}

export interface UIColumns {
  "@bean": string;
  alias: string;
  colType: string;
  type: string;
  typeShort: string;
}

export interface RelatedPath {
  columnPath: string;
  decision: string;
  targetEntityClass: string;
}

export interface GroupCellRenderer {
  valueFormatted?: string;
  value: string;
  data: {
    count: number;
  };
}

export interface ReportInfoRows {
  columnName: string;
  columnPath: string;
  type: string;
  declaredClass: string;
  subClasses: string[];
  decision: string;
}

export interface ChartSettings {
  chartSettings: ChartSettingsChart;
  windowSettings: ChartSettingsWindow;
}

export interface ChartSettingsChart {
  reportDefinitionId: string;
  name: string;
  chartType: {
    label: string;
    value: string;
    icon: string;
    trendline: boolean;
    addNewLabel: boolean;
    multipleColumns: boolean;
    hierarchy: boolean;
  };
  dataSource: string;
  columns: ChartSettingsColumn[];
  xAxis: {
    chartData: {};
    chartLabel: {};
  };
  style: {
    backgroundColor: string | null;
    borderColor: string | null;
    verticalAxisColor: string | null;
    horizontalAxisColor: string | null;
  };
  options: {
    legend: {
      position: string;
    };
    title: {
      display: boolean;
      text: string;
    };
  };
}

export interface ChartSettingsWindow {
  size: "maximize" | "minimize";
  params: {
    heightmaximize?: number;
    leftmaximize?: number;
    topmaximize?: number;
    widthmaximize?: number;
  };
}

export interface ChartSettingsColumn {
  chartData: {
    label: string;
    key: string;
    prop: string;
    type: string;
    icon: string;
    trendline: boolean;
    trendlineType: string;
    isTrendlinePossible: boolean;
  };
  chartLabel: {};
  chartStyle: {
    borderColor: string;
    fill: string;
    backgroundColor: string;
  };
}

export interface RequestParam {
  reportClass: string;
  columnPath: string;
  requestClass: string;
  types: string[];
  baseColumnPath: string;
  reportClassShort?: string;
}

export interface Entity {
  columnInfo: ColumnInfo;
  value: string;
  type: string;
  decision: string;
  presented?: boolean;
}

export interface StateReports {
  runningReports: any[];
  reportsSettings: StateReportsSettings[];
}

export interface StateReportsSettings {
  id: string;
  settings: {
    idField: string;
  };
}

export interface NamedParameter {
  [key: string]: string;

  "@bean": string;
  name: string;
  value: string;
  parameterType: string;
  // @ts-ignore
  oldName?: string;
}

export interface ReportingReportRows {
  _embedded: {
    reportRows: ReportRows[];
  };
  _links: {
    self: {
      href: string;
    };
  };
  page: Page;
}

export interface Page {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface ReportRows {
  // @ts-ignore
  content: {
    [p: string]: string;
  };

  [key: string]: string;
}

export interface ElementUiOption {
  label: string;
  value: string | number;
}

export interface RunningReport {
  reportId: string;
  groupingVersion: string;
  configName: string;
  reportExecutionTime: number;
  linkStatus: string;
  status: string;
}

export interface ReportingTypes {
  page: Page;
  _embedded: {
    strings: ReportingTypesEmbeddedStrings[];
  };
}

export interface ReportingTypesEmbeddedStrings {
  content: string;
  _links: {
    "/history": {
      href: string;
      templated: boolean;
      title: string;
      type: string;
    };
  };
}

export interface EntityViewerEntity {
  from: string;
  to: string;
}

export interface User {
  legalEntityId: string;
  userId: string;
  username: string;
}

export interface EntityRequest {
  entityClass: string;
  entityId: string;
  transition: string;
  transactional: boolean;
  async: boolean;
  values: EntityValueRequest[];
}

export interface EntityValueRequest {
  columnPath: string;
  value: string | number;
}

export interface ReportingReportStatus {
  content: {
    status: string;
    startTime: string;
  };
  _links: {
    "/report/{id}/{grouping_version}": {
      href: string;
      title: string;
      type: string;
    };
    "/report/{id}/{grouping_version}/status": {
      href: string;
      title: string;
      type: string;
    };
  };
  status: string;
  startTime: string;
}

export interface VersionPlatform {
  version: string;
  buildTime: string;
  gitBranchName: string;
}

export interface VersionClient {
  version: string;
  buildTime: string;
  gitBranchName: string;
}

export interface IndexConfiguration {
  indexId: string;
  indexName: string;
  entityClass: string;
  rangeField: {
    columnName: string;
    columnPath: string;
    type: string;
    clazzType: string;
    decision: null;
  };
  noneRangeFields: [
    {
      columnName: string;
      columnPath: string;
      type: string;
      clazzType: string;
      decision: null;
    }
  ];
  createDate: string;
  readyForQuerying: boolean;
  returnsList: boolean;
  persisted: boolean;
  decision: string;
}

export interface CompositeIndexExport {
  "@bean": string;
  data: {
    "@meta": string;
    value: CompositeIndexValueExport[];
  };
}

export interface CompositeIndexValueExport {
  "@bean": string;
  entityClass: string;
  name: string;
  rangeColPath: string;
  columns: string[];
}

export interface Transaction {
  changeCount: number;
  dateTime: string;
  transactionId: string;
}

export interface TransactionDiff {
  changedFields: TransactionDiffChangedField[];
}

export interface TransactionDiffChangedField {
  columnPath: string;
  columnPathContainer: {
    elements: TransactionDiffChangedFieldElements[];
    shortPath: string;
    prevValue: string;
    currValue: string;
  };
}

export interface TransactionDiffChangedFieldElements {
  columnName: string;
  type: string;
}

export interface Cache {
  cache: string;
  cacheServiceClass: string;
  size: number;
  lastInvalidateAllTime: string;
  lastInvalidateKeyTime: string;
}

export interface ServerInfo {
  type: string;
  id: string;
  nodeType: string;
  host: string;
  port: number;
  running: boolean;
  binded: boolean;
}

export interface NodeInfo {
  type: string;
  id: string;
  baseUrl: string;
  host: string;
  notificationsPort: number;
  processingNode: boolean;
}

export interface ClusterState {
  currentNode: NodeInfo;
  clientNodes: {
    DEFAULT: NodeInfo[];
    PROCESSING: NodeInfo[];
    TOOLBOX: NodeInfo[];
  };
  dispatcherNode: NodeInfo;
  shardsDistrState: ShardsDistr;
  shardsOwners: {
    [key: string]: string;
  };
  errorMsg: null;
}

export interface ShardsDistr {
  id: string;
  dispatcherNodeId: string;
  shardsByNodes: {
    [key: string]: number[];
  };
  nodesIds: string[];
}
