/**
 * Processing Hooks
 *
 * React Query hooks for Processing Manager API operations.
 * Provides a comprehensive set of hooks for fetching and mutating processing data,
 * including cluster statistics, transactions, entity management, and more.
 *
 * All hooks use React Query for:
 * - Automatic caching and background refetching
 * - Request deduplication
 * - Optimistic updates
 * - Error handling
 * - Loading states
 *
 * Migrated from @cyoda/processing-manager/src/stores/processing.ts (Pinia → React Query)
 *
 * @module useProcessing
 *
 * @example
 * ```typescript
 * import { useClusterStats, useTransactions, useManualTransition } from '@cyoda/processing-manager-react';
 *
 * function MyComponent() {
 *   // Query hooks
 *   const { data, isLoading, error } = useClusterStats();
 *   const { data: transactions } = useTransactions({ page: 1, pageSize: 20 });
 *
 *   // Mutation hooks
 *   const mutation = useManualTransition();
 *
 *   const handleTransition = () => {
 *     mutation.mutate({ entityId: '123', targetState: 'PROCESSED' });
 *   };
 *
 *   return <div>...</div>;
 * }
 * ```
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosProcessing } from '@cyoda/http-api-react';
import moment from 'moment';
import { HelperUrl } from '../utils';
import type {
  PmClusterStats,
  ProcessingStats,
  ProcessEvent,
  Transaction,
  TransactionMember,
  TransactionEvent,
  EntityVersion,
  EntityChange,
  EntityStateMachine,
  ServiceProcess,
  ExecutionQueue,
  ExecutionMonitor,
  ProcessingFilter,
  Pagination,
} from '../types';
import { useProcessingStore } from '../stores';

// ============================================================================
// Query Keys
// ============================================================================

/**
 * Query Keys Factory
 *
 * Centralized query key management for React Query.
 * Keys are hierarchical to enable efficient cache invalidation.
 *
 * @example
 * ```typescript
 * // Invalidate all processing queries
 * queryClient.invalidateQueries({ queryKey: processingKeys.all });
 *
 * // Invalidate specific transaction
 * queryClient.invalidateQueries({ queryKey: processingKeys.transaction('tx-123') });
 * ```
 */
export const processingKeys = {
  /** Base key for all processing queries */
  all: ['processing'] as const,

  /** Nodes list query key */
  nodes: () => [...processingKeys.all, 'nodes'] as const,

  /** Cluster statistics query key */
  clusterStats: () => [...processingKeys.all, 'cluster-stats'] as const,

  /** Processing summary query key */
  summary: (params?: any) => [...processingKeys.all, 'summary', params] as const,

  /** Process events query key */
  processEvents: (params?: any) => [...processingKeys.all, 'process-events', params] as const,

  /** Polling info query key */
  pollingInfo: (params?: any) => [...processingKeys.all, 'polling-info', params] as const,

  /** Queue events query key */
  queueEvents: (params?: any) => [...processingKeys.all, 'queue-events', params] as const,

  /** Time statistics query key */
  statsTime: (params?: any) => [...processingKeys.all, 'stats-time', params] as const,

  /** Count statistics query key */
  statsCount: (params?: any) => [...processingKeys.all, 'stats-count', params] as const,

  /** Transactions list query key */
  transactions: (params?: any) => [...processingKeys.all, 'transactions', params] as const,

  /** Single transaction query key */
  transaction: (id: string) => [...processingKeys.all, 'transaction', id] as const,

  /** Transaction members query key */
  transactionMembers: (id: string, params?: any) => [...processingKeys.all, 'transaction', id, 'members', params] as const,

  /** Transaction events query key */
  transactionEvents: (id: string, params?: any) => [...processingKeys.all, 'transaction', id, 'events', params] as const,

  /** Entity versions query key */
  entityVersions: (params?: any) => [...processingKeys.all, 'entity-versions', params] as const,

  /** Entity changes query key */
  entityChanges: (params?: any) => [...processingKeys.all, 'entity-changes', params] as const,

  /** Entity state machine query key */
  entityStateMachine: (params?: any) => [...processingKeys.all, 'entity-state-machine', params] as const,

  /** Service processes query key */
  serviceProcesses: (params?: any) => [...processingKeys.all, 'service-processes', params] as const,

  /** Execution monitors query key */
  execMonitors: (params?: any) => [...processingKeys.all, 'exec-monitors', params] as const,

  /** Processing queues query key */
  processingQueues: (params?: any) => [...processingKeys.all, 'processing-queues', params] as const,
};

// ============================================================================
// Cluster & Nodes
// ============================================================================

/**
 * Load Cluster Statistics
 *
 * Fetches cluster-wide statistics including all processing nodes and their status.
 * Automatically updates the processingStore with the list of nodes.
 *
 * @returns React Query result with cluster statistics
 *
 * @example
 * ```typescript
 * function ClusterDashboard() {
 *   const { data, isLoading, error } = useClusterStats();
 *
 *   if (isLoading) return <Spin />;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h2>Cluster Statistics</h2>
 *       <p>Total Nodes: {data.pmNodes.length}</p>
 *       <p>Active Transactions: {data.activeTransactions}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useClusterStats() {
  const setNodesProcessing = useProcessingStore((state) => state.setNodesProcessing);

  return useQuery({
    queryKey: processingKeys.clusterStats(),
    queryFn: async () => {
      const { data } = await axiosProcessing.get<PmClusterStats>(
        '/platform-processing/pm-cluster-stats-full.do'
      );
      setNodesProcessing(data.pmNodes);
      return data;
    },
  });
}

/**
 * Load Processing Summary
 *
 * Fetches processing summary for a specific node or time period.
 *
 * @param params - Query parameters (node, dateFrom, dateTo, etc.)
 * @returns React Query result with processing summary
 *
 * @example
 * ```typescript
 * function NodeSummary({ nodeName }: { nodeName: string }) {
 *   const { data } = useSummary({ node: nodeName });
 *
 *   return (
 *     <div>
 *       <h3>Summary for {nodeName}</h3>
 *       <p>Processed: {data?.processedCount}</p>
 *       <p>Failed: {data?.failedCount}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSummary(params?: any) {
  return useQuery({
    queryKey: processingKeys.summary(params),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/summary'),
        { params }
      );
      return data;
    },
    enabled: !!params,
  });
}

// ============================================================================
// Process Events
// ============================================================================

/**
 * Load Process Events Statistics
 *
 * Fetches statistics about process events with optional filtering.
 *
 * @param params - Query parameters (filters, pagination, etc.)
 * @returns React Query result with process events statistics
 *
 * @example
 * ```typescript
 * function EventsStats() {
 *   const { data } = useProcessEventsStats({
 *     eventType: 'PROCESSING',
 *     dateFrom: '2025-01-01',
 *     dateTo: '2025-01-31'
 *   });
 *
 *   return <div>Total Events: {data?.totalCount}</div>;
 * }
 * ```
 */
export function useProcessEventsStats(params?: any) {
  return useQuery({
    queryKey: processingKeys.processEvents(params),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/stats/process-events'),
        { params }
      );
      return data;
    },
  });
}

/**
 * Load polling info
 */
export function usePollingInfo(params?: any) {
  return useQuery({
    queryKey: processingKeys.pollingInfo(params),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/polling-info-json.do'),
        { params }
      );
      return data;
    },
  });
}

/**
 * Load processing queue events
 */
export function useProcessingQueueEvents(params?: ProcessingFilter) {
  const queryParams = {
    ...params,
    queue: params?.queue || 'ALL',
    shard: params?.shard || 'ALL',
    eventStatus: params?.status || 'ALL',
  };

  return useQuery({
    queryKey: processingKeys.queueEvents(queryParams),
    queryFn: async () => {
      const { data } = await axiosProcessing.get<ProcessEvent[]>(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/events'),
        { params: queryParams }
      );
      return data;
    },
  });
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Load time statistics
 */
export function useStatsTime(params?: any) {
  return useQuery({
    queryKey: processingKeys.statsTime(params),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/stats/time'),
        { params }
      );
      return data;
    },
  });
}

/**
 * Load count statistics
 */
export function useStatsCount(params?: any) {
  return useQuery({
    queryKey: processingKeys.statsCount(params),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/stats/count'),
        { params }
      );
      return data;
    },
  });
}

// ============================================================================
// Transactions
// ============================================================================

/**
 * Load transactions list
 */
export function useTransactions(params?: any) {
  return useQuery({
    queryKey: processingKeys.transactions(params),
    queryFn: async () => {
      const { data } = await axiosProcessing.get<Transaction[]>(
        HelperUrl.getLinkToServer('/platform-processing/transactions/view'),
        { params }
      );
      return data;
    },
  });
}

/**
 * Load transaction statuses
 */
export function useTransactionStatuses() {
  return useQuery({
    queryKey: [...processingKeys.all, 'transaction-statuses'],
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/transactions/statuses')
      );
      return data;
    },
  });
}

/**
 * Load single transaction
 */
export function useTransaction(id: string) {
  return useQuery({
    queryKey: processingKeys.transaction(id),
    queryFn: async () => {
      const { data } = await axiosProcessing.get<Transaction>(
        HelperUrl.getLinkToServer(`/platform-processing/transactions/view/${id}`)
      );
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Load transaction members
 */
export function useTransactionMembers(id: string, params?: any, options?: any) {
  return useQuery({
    queryKey: processingKeys.transactionMembers(id, params),
    queryFn: async () => {
      const { data } = await axiosProcessing.get<TransactionMember[]>(
        HelperUrl.getLinkToServer(`/platform-processing/transactions/view/${id}/members`),
        { params }
      );
      return data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
    ...options,
  });
}

/**
 * Load transaction events
 */
export function useTransactionEvents(id: string, params?: any, options?: any) {
  return useQuery({
    queryKey: processingKeys.transactionEvents(id, params),
    queryFn: async () => {
      const { data } = await axiosProcessing.get<TransactionEvent[]>(
        HelperUrl.getLinkToServer(`/platform-processing/transactions/view/${id}/exec-events`),
        { params }
      );
      return data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
    ...options,
  });
}

/**
 * Load transactions entities list
 */
export function useTransactionsEntitiesList(params?: any, options?: any) {
  return useQuery({
    queryKey: [...processingKeys.all, 'transactions-entities-list', params],
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/transactions/entities-list'),
        { params }
      );
      return data;
    },
    ...options,
  });
}

/**
 * Load entities list possible
 */
export function useEntitiesListPossible(params?: any, options?: any) {
  return useQuery({
    queryKey: [...processingKeys.all, 'entities-list-possible', params],
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/transactions/entities-list/possible'),
        { params }
      );
      return data;
    },
    ...options,
  });
}

/**
 * Load Transaction Event Statuses List
 *
 * Fetches available event status filters for transactions.
 * Note: This endpoint exists in the API but was not used in the Vue version.
 * Added for 100% API parity.
 *
 * @param params - Query parameters
 * @returns Query result with list of status strings
 *
 * @example
 * ```typescript
 * const { data: statuses } = useTransactionEventStatusesList({ transactionId: '123' });
 * ```
 */
export function useTransactionEventStatusesList(params?: any) {
  return useQuery({
    queryKey: [...processingKeys.all, 'transaction-event-statuses', params],
    queryFn: async () => {
      const { data } = await axiosProcessing.get<string[]>(
        HelperUrl.getLinkToServer('/platform-processing/transactions/event-ref-status-filters'),
        { params }
      );
      return data;
    },
    enabled: !!params, // Only fetch if params are provided
  });
}

// ============================================================================
// Entity Versions & Changes
// ============================================================================

/**
 * Load entity versions
 */
export function useEntityVersions(params?: any) {
  // Map React-friendly param names to API param names
  const apiParams = params ? {
    type: params.entityType || params.type,
    id: params.entityId || params.id,
    ...params,
  } : undefined;

  return useQuery({
    queryKey: processingKeys.entityVersions(apiParams),
    queryFn: async () => {
      const { data } = await axiosProcessing.get<EntityVersion[]>(
        HelperUrl.getLinkToServer('/platform-processing/transactions/view/entity-versions'),
        { params: apiParams }
      );
      return data;
    },
    enabled: !!(apiParams?.type && apiParams?.id),
  });
}

/**
 * Load entity changes
 */
export function useEntityChanges(params?: any) {
  // Map React-friendly param names to API param names
  const apiParams = params ? {
    type: params.entityType || params.type,
    id: params.entityId || params.id,
    ...params,
  } : undefined;

  return useQuery({
    queryKey: processingKeys.entityChanges(apiParams),
    queryFn: async () => {
      const { data } = await axiosProcessing.get<EntityChange[]>(
        HelperUrl.getLinkToServer('/platform-processing/transactions/view/entity-changes'),
        { params: apiParams }
      );
      return data;
    },
    enabled: !!(apiParams?.type && apiParams?.id),
  });
}

// ============================================================================
// Entity State Machine
// ============================================================================

/**
 * Load entity state machine
 */
export function useEntityStateMachine(params?: any) {
  // Map React-friendly param names to API param names
  const apiParams = params ? {
    type: params.entityType || params.type,
    id: params.entityId || params.id,
    ...params,
  } : undefined;

  return useQuery({
    queryKey: processingKeys.entityStateMachine(apiParams),
    queryFn: async () => {
      const { data } = await axiosProcessing.get<EntityStateMachine>(
        HelperUrl.getLinkToServer('/platform-processing/transactions/view/entity-state-machine'),
        { params: apiParams }
      );
      return data;
    },
    enabled: !!(apiParams?.type && apiParams?.id),
  });
}

// ============================================================================
// Service Processes
// ============================================================================

/**
 * Load service processes stats
 */
export function useServiceProcessesStats(params?: any) {
  return useQuery({
    queryKey: processingKeys.serviceProcesses(params),
    queryFn: async () => {
      const { data } = await axiosProcessing.get<ServiceProcess[]>(
        HelperUrl.getLinkToServer('/platform-processing/service-processes/service-processes-stats.do'),
        { params }
      );
      return data;
    },
  });
}

// ============================================================================
// Execution Monitors
// ============================================================================

/**
 * Load execution monitors info
 */
export function useExecMonitorsInfo(params?: any) {
  return useQuery({
    queryKey: processingKeys.execMonitors(params),
    queryFn: async () => {
      const { data } = await axiosProcessing.get<ExecutionMonitor[]>(
        HelperUrl.getLinkToServer('/platform-processing/exec-monitors-info-json.do'),
        { params }
      );
      return data;
    },
  });
}

/**
 * Load execution transactions info
 */
export function useExecTransactionsInfo(params = { limit: 100 }) {
  return useQuery({
    queryKey: [...processingKeys.all, 'exec-transactions-info', params],
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/exec-transactions-info-json.do'),
        { params }
      );
      return data;
    },
  });
}

// ============================================================================
// Processing Queues
// ============================================================================

/**
 * Load processing queues
 */
export function useProcessingQueues(params?: any) {
  return useQuery({
    queryKey: processingKeys.processingQueues(params),
    queryFn: async () => {
      const { data } = await axiosProcessing.get<ExecutionQueue[]>(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/queues.do'),
        { params }
      );
      return data;
    },
  });
}

/**
 * Load processing queue error events
 */
export function useProcessingQueueEventsError(params: any, options?: any) {
  return useQuery({
    queryKey: [...processingKeys.all, 'queue-events-error', params],
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer(
          `/platform-processing/processing-queue/events/error.json?queue=${params.queue}&shard=${
            params.shard
          }&from=${moment(params.from).format('x') * 1000}&to=${
            moment(params.to).format('x') * 1000
          }&sort=${params.sort}&pageSize=9999999&pageNum=${params.pageNum}`
        )
      );
      return data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : (!!params?.queue && !!params?.shard),
    ...options,
  });
}

/**
 * Load processing queue entities error list
 */
export function useProcessingQueueEntitiesErrorList(params?: any, options?: any) {
  return useQuery({
    queryKey: [...processingKeys.all, 'queue-entities-error-list', params],
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/entities-error-list.json'),
        { params }
      );
      return data;
    },
    ...options,
  });
}

/**
 * Load processing queue error event by entity
 */
export function useProcessingQueueErrorEventByEntity(params?: any) {
  return useQuery({
    queryKey: [...processingKeys.all, 'queue-error-event-by-entity', params],
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/show-event.json'),
        { params }
      );
      return data;
    },
    enabled: !!params,
  });
}

// ============================================================================
// Grafana API
// ============================================================================

/**
 * Get Grafana dashboard by name
 */
export function useGrafanaDashboardByName(name: string) {
  return useQuery({
    queryKey: [...processingKeys.all, 'grafana', 'dashboard', name],
    queryFn: async () => {
      const query = encodeURIComponent(name);
      const { data } = await axiosProcessing.get(`/grafana/search?query=${query}`);
      return data;
    },
    enabled: !!name,
  });
}

/**
 * Get all panels by dashboard UID
 */
export function useGrafanaPanelsByUid(uid: string) {
  return useQuery({
    queryKey: [...processingKeys.all, 'grafana', 'panels', uid],
    queryFn: async () => {
      const { data} = await axiosProcessing.get(`/grafana/dashboards/uid/${uid}`);
      return data;
    },
    enabled: !!uid,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Force mark processed
 */
export function useForceMarkProcessed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/force-mark-processed.do'),
        { params }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processingKeys.queueEvents() });
    },
  });
}

/**
 * Do manual transition
 */
export function useManualTransition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await axiosProcessing.put(
        HelperUrl.getLinkToServer('/platform-api/entity'),
        params
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processingKeys.entityStateMachine() });
    },
  });
}

/**
 * Get SIFT Logger Configuration
 *
 * Fetches the SIFT logger configuration for a node.
 *
 * @returns Query result with SIFT logger data
 */
export function useSiftLogger(params: any) {
  return useQuery({
    queryKey: processingKeys.all.concat(['sift-logger', params]),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/sift-logger.do'),
        { params }
      );
      return data;
    },
    enabled: !!params,
  });
}

/**
 * Update SIFT Logger Configuration
 *
 * Updates the SIFT logger configuration for a node.
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useUpdateSiftLogger(options?: any) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: any) => {
      const response = await axiosProcessing.post(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/update-sift-logger.do'),
        params
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processingKeys.all });
      options?.onSuccess?.();
    },
    ...options,
  });
}

/**
 * Clear Time Statistics
 *
 * Clears time statistics for a node.
 *
 * @returns Mutation result
 */
export function useClearTimeStats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (url?: string) => {
      const targetUrl = url
        ? `${url}/platform-processing/stats/clear-time-stats`
        : HelperUrl.getLinkToServer('/platform-processing/stats/clear-time-stats');
      const { data } = await axiosProcessing.put(targetUrl);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processingKeys.all });
    },
  });
}

/**
 * Clear All Caches
 *
 * Clears all caches for a node.
 *
 * @returns Mutation result
 */
export function useDoClearAllCaches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/clear-all-caches.do'),
        { params }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processingKeys.all });
    },
  });
}

/**
 * Hard Reset Consistency Time
 *
 * Performs a hard reset of consistency time for a node.
 *
 * @returns Mutation result
 */
export function useDoHardResetConsistencyTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/transactions/hard-reset-consistency-time.do'),
        { params }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processingKeys.all });
    },
  });
}

/**
 * Manual Transition (alias for useManualTransition)
 */
export function useDoManualTransition() {
  return useManualTransition();
}

/**
 * Force Mark Processed (alias for useForceMarkProcessed)
 */
export function useProcessingQueueForceMarkProcessed() {
  return useForceMarkProcessed();
}

/**
 * Load Service Processes Stats (alias for useServiceProcessesStats)
 */
export function useLoadServiceProcessesStats(params?: any) {
  return useServiceProcessesStats(params);
}

/**
 * Get Platform Common Network Info - Server
 *
 * Fetches network server information for a node.
 *
 * @returns Query result with network server data
 */
export function usePlatformCommonNetInfoServer() {
  const { selectedNode } = useProcessingStore();

  return useQuery({
    queryKey: processingKeys.all.concat(['net-info-server', selectedNode]),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer(`/platform-api/net-info/server/${selectedNode}`)
      );
      return data;
    },
    enabled: !!selectedNode,
  });
}

/**
 * Get Platform Common Network Info - Clients
 *
 * Fetches network client information for a node.
 *
 * @returns Query result with network clients data
 */
export function usePlatformCommonNetInfoClients() {
  const { selectedNode } = useProcessingStore();

  return useQuery({
    queryKey: processingKeys.all.concat(['net-info-clients', selectedNode]),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer(`/platform-api/net-info/clients/${selectedNode}`)
      );
      return data;
    },
    enabled: !!selectedNode,
  });
}

/**
 * Get Platform Common ZooKeeper Info - Current Node Info
 *
 * Fetches current ZooKeeper node information.
 *
 * @returns Query result with ZK node data
 */
export function usePlatformCommonZkInfoCurrNodeInfo() {
  const { selectedNode } = useProcessingStore();

  return useQuery({
    queryKey: processingKeys.all.concat(['zk-info-curr-node', selectedNode]),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer(`/platform-api/zk-info/curr-node/${selectedNode}`)
      );
      return data;
    },
    enabled: !!selectedNode,
  });
}

/**
 * Get Platform Common ZooKeeper Info - Loaded Online Nodes
 *
 * Fetches loaded online nodes from ZooKeeper.
 *
 * @returns Query result with online nodes data
 */
export function usePlatformCommonZkInfoLoadedOnlineNodes() {
  const { selectedNode } = useProcessingStore();

  return useQuery({
    queryKey: processingKeys.all.concat(['zk-info-online-nodes', selectedNode]),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer(`/platform-api/zk-info/online-nodes/${selectedNode}`)
      );
      return data;
    },
    enabled: !!selectedNode,
  });
}

// ============================================================================
// Runnable Components
// ============================================================================

/**
 * Load runnable components
 */
export function useLoadRunnableComponents(params?: any) {
  return useQuery({
    queryKey: [...processingKeys.all, 'runnable-components', params],
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/runnable-components.do'),
        { params }
      );
      return data;
    },
  });
}

/**
 * Start runnable component
 */
export function useStartRunnableComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string }) => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/start-runnable-component.do'),
        { params }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...processingKeys.all, 'runnable-components'] });
    },
  });
}

/**
 * Stop runnable component
 */
export function useStopRunnableComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string }) => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/stop-runnable-component.do'),
        { params }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...processingKeys.all, 'runnable-components'] });
    },
  });
}

/**
 * Get Platform Common ZooKeeper Info - Loaded Shards Distribution
 *
 * Fetches shards distribution from ZooKeeper.
 *
 * @returns Query result with shards distribution data
 */
export function usePlatformCommonZkInfoLoadedShardsDistribution() {
  const { selectedNode } = useProcessingStore();

  return useQuery({
    queryKey: processingKeys.all.concat(['zk-info-shards-distribution', selectedNode]),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer(`/platform-api/zk-info/shards-distribution/${selectedNode}`)
      );
      return data;
    },
    enabled: !!selectedNode,
  });
}

/**
 * Get Transactions View - get single transaction details by ID
 * Original Vue: transactionsView({ id })
 * Endpoint: /platform-processing/transactions/view/${id}
 */
export function useTransactionsView(params?: { id?: string }) {
  const id = params?.id;
  return useQuery({
    queryKey: [...processingKeys.all, 'transactions-view', id],
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer(`/platform-processing/transactions/view/${id}`)
      );
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Get Transactions View Members (alias for useTransactionMembers)
 * Supports both signatures:
 * 1. useTransactionsViewMembers(id, params, options) - new signature
 * 2. useTransactionsViewMembers({ id, ...params }, options) - old signature for compatibility
 */
export function useTransactionsViewMembers(idOrParams: string | any, paramsOrOptions?: any, options?: any) {
  // Support both old and new signatures
  if (typeof idOrParams === 'string') {
    return useTransactionMembers(idOrParams, paramsOrOptions, options);
  } else {
    const { id, ...restParams } = idOrParams;
    return useTransactionMembers(id, restParams, paramsOrOptions);
  }
}

/**
 * Get Transactions View Events (alias for useTransactionEvents)
 * Supports both signatures:
 * 1. useTransactionsViewEvents(id, params, options) - new signature
 * 2. useTransactionsViewEvents({ id, ...params }, options) - old signature for compatibility
 */
export function useTransactionsViewEvents(idOrParams: string | any, paramsOrOptions?: any, options?: any) {
  // Support both old and new signatures
  if (typeof idOrParams === 'string') {
    return useTransactionEvents(idOrParams, paramsOrOptions, options);
  } else {
    const { id, ...restParams } = idOrParams;
    return useTransactionEvents(id, restParams, paramsOrOptions);
  }
}

export default {
  useClusterStats,
  useSummary,
  useProcessEventsStats,
  usePollingInfo,
  useProcessingQueueEvents,
  useStatsTime,
  useStatsCount,
  useTransactions,
  useTransactionStatuses,
  useTransaction,
  useTransactionMembers,
  useTransactionEvents,
  useTransactionsEntitiesList,
  useEntitiesListPossible,
  useTransactionEventStatusesList,
  useEntityVersions,
  useEntityChanges,
  useEntityStateMachine,
  useServiceProcessesStats,
  useExecMonitorsInfo,
  useExecTransactionsInfo,
  useProcessingQueues,
  useProcessingQueueEventsError,
  useProcessingQueueEntitiesErrorList,
  useProcessingQueueErrorEventByEntity,
  useGrafanaDashboardByName,
  useGrafanaPanelsByUid,
  useForceMarkProcessed,
  useManualTransition,
  useSiftLogger,
  useUpdateSiftLogger,
  useClearTimeStats,
  useDoClearAllCaches,
  useDoHardResetConsistencyTime,
  useDoManualTransition,
  useProcessingQueueForceMarkProcessed,
  useLoadServiceProcessesStats,
  useLoadRunnableComponents,
  useStartRunnableComponent,
  useStopRunnableComponent,
  usePlatformCommonNetInfoServer,
  usePlatformCommonNetInfoClients,
  usePlatformCommonZkInfoCurrNodeInfo,
  usePlatformCommonZkInfoLoadedOnlineNodes,
  usePlatformCommonZkInfoLoadedShardsDistribution,
  useTransactionsView,
  useTransactionsViewMembers,
  useTransactionsViewEvents,
};

