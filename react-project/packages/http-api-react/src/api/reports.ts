/**
 * Report API endpoints
 * Migrated from @cyoda/ui-lib/src/api/index.ts
 */

import axios from '../config/axios';
import { axiosPublic } from '../config/axios';
import qs from 'qs';
import type {
  ReportHistory,
  IReportStatus,
  IReportStats,
  ReportGroup,
  IDefinition,
  ReportingTypes,
  IGetReportTypesArgs,
  IGetHistoryArgs,
  IGetDefinitionsArgs,
} from '../types';
import { HelperStorage } from '../utils/storage';

const helperStorage = new HelperStorage();

function currentUserName(): string {
  const auth = helperStorage.get('auth');
  if (auth && auth.username) {
    return auth.username;
  }
  return '';
}

const stringifyOpts = {
  addQueryPrefix: true,
  arrayFormat: 'comma' as const,
  encode: false,
  encodeValuesOnly: true,
  skipNulls: true,
};

/**
 * URL mapping for report endpoints
 */
export const reportUrls = {
  REPORT_HISTORY: (username = currentUserName()) =>
    `platform-api/history?username=${encodeURIComponent(username)}&fields=id,configName,reportFailed,finishTime`,
  REPORT_STATUS: (reportId: string) => `platform-api/report/${reportId}/status`,
  REPORT_CONFIG: (reportId: string) => `platform-api/report/${reportId}/config`,
  REPORT_STATISTICS: (reportId: string) => `platform-api/report/${reportId}/stats?full=false`,
  REPORT_GROUPS: (reportId: string) => `platform-api/report/${reportId}/groups`,
  REPORT_GROUP: (reportId: string, groupId: string) => `platform-api/report/${reportId}/groups/${groupId}`,
  RUN_REPORT_FROM_PREDEFINED_CONFIG: (gridConfig: string) => `/platform-api/pre?gridConfig=${gridConfig}`,
  GET_REPORT_CONFIGS: () => `/platform-api/definitions?fields=description`,
};

/**
 * Get report types
 */
export function getReportTypes(args: IGetReportTypesArgs) {
  if (args.pageUrl) {
    return axios.get<ReportingTypes>(args.pageUrl);
  }

  const params = {
    size: args.params.size,
  };

  const query = qs.stringify(params, stringifyOpts);
  return axios.get<ReportingTypes>(`/platform-api/reporting/types${query}`);
}

/**
 * Get report history
 */
export function getHistory(args: IGetHistoryArgs) {
  if (args.pageUrl) {
    return axios.get<ReportHistory>(args.pageUrl);
  }

  const query = qs.stringify(args.params, stringifyOpts);
  return axios.get<ReportHistory>(`/platform-api/history${query}`);
}

/**
 * Get report status
 */
export function getReportStatus(reportId: string) {
  return axios.get<IReportStatus>(reportUrls.REPORT_STATUS(reportId));
}

/**
 * Get report statistics
 */
export function getReportStats(reportId: string) {
  return axios.get<IReportStats>(reportUrls.REPORT_STATISTICS(reportId));
}

/**
 * Get report configuration
 */
export function getReportConfig(reportId: string) {
  return axios.get<IDefinition>(reportUrls.REPORT_CONFIG(reportId));
}

/**
 * Get report groups
 */
export function getReportGroups(reportId: string) {
  return axios.get<{ _embedded: { reportGroups: ReportGroup[] } }>(reportUrls.REPORT_GROUPS(reportId));
}

/**
 * Get specific report group
 */
export function getReportGroup(reportId: string, groupId: string) {
  return axios.get<ReportGroup>(reportUrls.REPORT_GROUP(reportId, groupId));
}

/**
 * Run report from predefined config
 */
export function runReportFromPredefinedConfig(gridConfig: string) {
  return axios.post(reportUrls.RUN_REPORT_FROM_PREDEFINED_CONFIG(gridConfig));
}

/**
 * Get report definitions/configs
 */
export function getReportConfigs(args?: IGetDefinitionsArgs) {
  if (args?.pageUrl) {
    return axios.get(args.pageUrl);
  }

  const params = args?.params || {};
  const query = qs.stringify(params, stringifyOpts);
  return axios.get(`/platform-api/definitions${query}`);
}

/**
 * Delete report
 */
export function deleteReport(reportId: string) {
  return axios.delete(`/platform-api/report/${reportId}`);
}

/**
 * Cancel report
 */
export function cancelReport(reportId: string) {
  return axios.post(`/platform-api/report/${reportId}/cancel`);
}

/**
 * Create new report
 */
export function createReport(config: any) {
  return axios.post('/platform-api/report', config);
}

/**
 * Create report definition
 * Migrated from Vue: createDefinitions(name, content)
 */
export function createReportDefinition(name: string, content: any) {
  return axios.post(`/platform-api/reporting/definitions?name=${encodeURIComponent(name)}`, content);
}

/**
 * Update report configuration
 */
export function updateReportConfig(reportId: string, config: any) {
  return axios.put(`/platform-api/report/${reportId}/config`, config);
}

/**
 * Get report data (rows)
 */
export function getReportData(reportId: string, groupId?: string, params?: any) {
  const url = groupId
    ? `/platform-api/report/${reportId}/groups/${groupId}/rows`
    : `/platform-api/report/${reportId}/rows`;
  
  const query = params ? qs.stringify(params, stringifyOpts) : '';
  return axios.get(`${url}${query}`);
}

/**
 * Export report
 */
export function exportReport(reportId: string, format: 'csv' | 'excel' | 'json' = 'csv') {
  return axios.get(`/platform-api/report/${reportId}/export?format=${format}`, {
    responseType: 'blob',
  });
}

/**
 * Get report column values (for filters)
 */
export function getReportColumnValues(reportId: string, columnPath: string, params?: any) {
  const query = params ? qs.stringify(params, stringifyOpts) : '';
  return axios.get(`/platform-api/report/${reportId}/column/${encodeURIComponent(columnPath)}/values${query}`);
}

/**
 * Regroup report
 */
export function regroupReport(reportId: string, groupingColumns: string[]) {
  return axios.post(`/platform-api/report/${reportId}/regroup`, {
    groupingColumns,
  });
}

/**
 * Get report summary
 */
export function getReportSummary(reportId: string, groupId?: string) {
  const url = groupId
    ? `/platform-api/report/${reportId}/groups/${groupId}/summary`
    : `/platform-api/report/${reportId}/summary`;
  
  return axios.get(url);
}

/**
 * Clone report
 */
export function cloneReport(reportId: string) {
  return axios.post(`/platform-api/report/${reportId}/clone`);
}

/**
 * Get report metadata
 */
export function getReportMetadata(reportId: string) {
  return axios.get(`/platform-api/report/${reportId}/metadata`);
}

/**
 * Get report chart data
 */
export function getReportChartData(reportId: string, chartConfig: any) {
  return axios.post(`/platform-api/report/${reportId}/chart`, chartConfig);
}

/**
 * Get report pivot data
 */
export function getReportPivotData(reportId: string, pivotConfig: any) {
  return axios.post(`/platform-api/report/${reportId}/pivot`, pivotConfig);
}

