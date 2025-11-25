/**
 * Report hooks
 * Provides React hooks for report operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import * as reportsApi from '../api/reports';
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

/**
 * Hook to get report types
 */
export function useReportTypes(
  args: IGetReportTypesArgs,
  options?: Omit<UseQueryOptions<ReportingTypes>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['reports', 'types', args],
    queryFn: async () => {
      const response = await reportsApi.getReportTypes(args);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get report history
 */
export function useReportHistory(
  args: IGetHistoryArgs,
  options?: Omit<UseQueryOptions<ReportHistory>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['reports', 'history', args],
    queryFn: async () => {
      const response = await reportsApi.getHistory(args);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook to get report status
 */
export function useReportStatus(
  reportId: string,
  groupingVersion?: string,
  options?: Omit<UseQueryOptions<IReportStatus>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['reports', reportId, groupingVersion, 'status'],
    queryFn: async () => {
      const response = await reportsApi.getReportStatus(reportId, groupingVersion);
      return response.data;
    },
    enabled: !!reportId,
    refetchInterval: (data) => {
      // Auto-refetch every 2 seconds if report is running
      const status = data?.content?.status;
      return status === 'RUNNING' || status === 'STARTED' ? 2000 : false;
    },
    ...options,
  });
}

/**
 * Hook to get report statistics
 */
export function useReportStats(
  reportId: string,
  groupingVersion?: string,
  options?: Omit<UseQueryOptions<IReportStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['reports', reportId, groupingVersion, 'stats'],
    queryFn: async () => {
      const response = await reportsApi.getReportStats(reportId, groupingVersion);
      return response.data;
    },
    enabled: !!reportId,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook to get report configuration
 */
export function useReportConfig(
  reportId: string,
  options?: Omit<UseQueryOptions<IDefinition>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['reports', reportId, 'config'],
    queryFn: async () => {
      const response = await reportsApi.getReportConfig(reportId);
      return response.data;
    },
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get report groups
 */
export function useReportGroups(
  reportId: string,
  options?: Omit<UseQueryOptions<{ _embedded: { reportGroups: ReportGroup[] } }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['reports', reportId, 'groups'],
    queryFn: async () => {
      const response = await reportsApi.getReportGroups(reportId);
      return response.data;
    },
    enabled: !!reportId,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook to get specific report group
 */
export function useReportGroup(
  reportId: string,
  groupId: string,
  options?: Omit<UseQueryOptions<ReportGroup>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['reports', reportId, 'groups', groupId],
    queryFn: async () => {
      const response = await reportsApi.getReportGroup(reportId, groupId);
      return response.data;
    },
    enabled: !!reportId && !!groupId,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook to get report configurations/definitions
 */
export function useReportConfigs(
  args?: IGetDefinitionsArgs,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['reports', 'configs', args],
    queryFn: async () => {
      const response = await reportsApi.getReportConfigs(args);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get report data (rows)
 */
export function useReportData(
  reportId: string,
  groupId?: string,
  params?: any,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['reports', reportId, 'data', groupId, params],
    queryFn: async () => {
      const response = await reportsApi.getReportData(reportId, groupId, params);
      return response.data;
    },
    enabled: !!reportId,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook to create a new report
 */
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: any) => {
      const response = await reportsApi.createReport(config);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['reports', 'configs'] });
    },
  });
}

/**
 * Hook to update report configuration
 */
export function useUpdateReportConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, config }: { reportId: string; config: any }) => {
      const response = await reportsApi.updateReportConfig(reportId, config);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports', variables.reportId, 'config'] });
    },
  });
}

/**
 * Hook to delete a report
 */
export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      const response = await reportsApi.deleteReport(reportId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'history'] });
    },
  });
}

/**
 * Hook to cancel a report
 */
export function useCancelReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      const response = await reportsApi.cancelReport(reportId);
      return response.data;
    },
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: ['reports', reportId, 'status'] });
    },
  });
}

/**
 * Hook to export a report
 */
export function useExportReport() {
  return useMutation({
    mutationFn: async ({ reportId, format }: { reportId: string; format?: 'csv' | 'excel' | 'json' }) => {
      const response = await reportsApi.exportReport(reportId, format);
      return response.data;
    },
  });
}

/**
 * Hook to clone a report
 */
export function useCloneReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      const response = await reportsApi.cloneReport(reportId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'history'] });
    },
  });
}

/**
 * Hook to regroup a report
 */
export function useRegroupReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, groupingColumns }: { reportId: string; groupingColumns: string[] }) => {
      const response = await reportsApi.regroupReport(reportId, groupingColumns);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports', variables.reportId, 'groups'] });
    },
  });
}

/**
 * Hook to get report summary
 */
export function useReportSummary(
  reportId: string,
  groupId?: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['reports', reportId, 'summary', groupId],
    queryFn: async () => {
      const response = await reportsApi.getReportSummary(reportId, groupId);
      return response.data;
    },
    enabled: !!reportId,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

