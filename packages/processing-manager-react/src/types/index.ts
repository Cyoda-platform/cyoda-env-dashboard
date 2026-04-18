/**
 * Processing Manager Types
 * Migrated from @cyoda/processing-manager Vue package
 */

// ============================================================================
// Node & Cluster Types
// ============================================================================

export interface PmNode {
  hostname?: string;
  name?: string;
  host?: string;
  port?: number;
  baseUrl?: string;
  status?: string; // Can be 'Running', 'Stopped', 'ONLINE', 'OFFLINE', etc. - depends on backend
  version?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  uptime?: number;
  lastUpdate?: string;
  grafana?: any;
}

export interface PmClusterStats {
  pmNodes: PmNode[];
  totalNodes: number;
  runningNodes: number;
  stoppedNodes: number;
  errorNodes: number;
  consistencyTimeLagMs?: number;
}

// ============================================================================
// Transaction Types
// ============================================================================

export interface Transaction {
  id: string;
  status: TransactionStatus;
  entityId?: string;
  entityType?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  error?: string;
  user?: string;
}

/**
 * Row shape returned by `/platform-processing/transactions/view`.
 * Carries timing fields the compact `Transaction` summary doesn't model.
 */
export interface TransactionRow {
  id: string;
  userName: string;
  status: string;
  createTime: string;
  submitTime: string;
  finishTime: string;
  prepareTimeMillis: number;
  processTimeMillis: number;
  transactionSubmitNodeId: string;
}

/**
 * Paged envelope used by transactions-view and entity-versions endpoints.
 */
export interface PagedResponse<TRow> {
  rows: TRow[];
  firstPage: boolean;
  lastPage: boolean;
}

/**
 * Row shape returned by `/platform-processing/transactions/view/entity-versions`.
 * Different from `EntityVersion` (which is a summary) — this row carries the
 * per-column change detail the transition-versions tables render.
 */
export interface VersionRow {
  version: string;
  transactionId: string;
  actionType: string;
  colType: string;
  colTimeMillis: number;
  // Row-level fields used by the aggregated/sorted detail views.
  [key: string]: unknown;
}

export type TransactionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface TransactionMember {
  id: string;
  transactionId: string;
  entityId: string;
  entityType: string;
  operation: string;
  status: string;
  timestamp: string;
}

export interface TransactionEvent {
  id: string;
  transactionId: string;
  eventType: string;
  timestamp: string;
  data?: any;
  error?: string;
}

// ============================================================================
// Processing Events Types
// ============================================================================

export interface ProcessEvent {
  id: string;
  eventType: string;
  queue: string;
  shard: string;
  status: ProcessEventStatus;
  entityId?: string;
  entityType?: string;
  timestamp: string;
  processedTime?: string;
  error?: string;
  retryCount?: number;
}

export type ProcessEventStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'ERROR'
  | 'RETRY';

export interface ProcessEventStats {
  total: number;
  pending: number;
  processing: number;
  processed: number;
  error: number;
  byQueue: Record<string, number>;
  byShard: Record<string, number>;
}

/**
 * Response from `/platform-processing/processing-queue/show-event.json`.
 * The `event` object is the serialized platform event; `done` reflects
 * whether the event has been acknowledged / processed.
 *
 * The event body is schema-less metadata — fields are rendered directly
 * into descriptions lists, so we allow arbitrary indexed access.
 */
export interface ProcessingQueueErrorEvent {
  coreData?: unknown;
  clientData?: unknown;
  errorEventTimeUUID?: string;
  entityId?: string;
  entityClassName?: string;
  queueName?: string;
  shardId?: string;
  status?: string;
  createTime?: string;
  doneTime?: string;
  errorTime?: string;
  timeUUID?: string;
  coreDataClassName?: string;
  clientDataClassName?: string;
  [key: string]: unknown;
}

export interface ProcessingQueueErrorEventResponse {
  event: ProcessingQueueErrorEvent;
  done: boolean;
}

/**
 * Response from `/platform-processing/processing-queue/entities-error-list.json`.
 * Two shapes are observed in the wild depending on feature-flag state:
 *   - Legacy: `{ data: string[] }` (list of entity-class names)
 *   - Enveloped: `{ data: { elements: Record<string, unknown>[] } }`
 *   - Bare array (oldest): `string[]`
 * Consumers narrow at the callsite.
 */
export type ProcessingQueueEntitiesErrorListResponse =
  | { data: string[] }
  | { data: { elements: Array<Record<string, unknown>> } }
  | string[];

// ============================================================================
// Service & Resource Types
// ============================================================================

export interface ServiceProcess {
  name: string;
  running: boolean;
  status?: string;
  uptime?: number;
  memory?: number;
  cpu?: number;
}

/**
 * Response from `/platform-processing/service-processes/service-processes-stats.do`.
 * The endpoint partitions processes into "ready" and "not ready" buckets;
 * the UI renders them in two tables.
 */
export interface ServiceProcessesStatsResponse {
  ready: ServiceProcess[];
  noneReady: ServiceProcess[];
}

export interface Resource {
  name: string;
  size: number;
  available: number;
  used?: number;
  percentage?: number;
}

export interface ExecutionQueue {
  name: string;
  size: number;
  pending: number;
  processing: number;
  completed: number;
}

export interface ExecutionMonitor {
  id: string;
  name: string;
  status: string;
  lastUpdate: string;
  metrics?: Record<string, any>;
}

/**
 * Row shape returned by `/platform-processing/exec-monitors-info-json.do`.
 * The compact `ExecutionMonitor` summary doesn't carry the per-thread counts
 * the monitor table renders; this is the on-wire shape.
 */
export interface ExecutionMonitorRow {
  index: number;
  name: string;
  entityId: string;
  entityClass: string;
  expectedThreadsCount: number;
  lastAccessTime: string;
  processFinished: boolean;
  processingThreadsCount: number;
  finishedThreadsCount: number;
}

/**
 * Response envelope from `/platform-processing/exec-monitors-info-json.do`.
 */
export interface ExecutionMonitorsInfoResponse {
  data: ExecutionMonitorRow[];
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface ProcessingStats {
  timeStats: TimeStats[];
  countStats: CountStats[];
  summary: ProcessingSummary;
}

export interface TimeStats {
  timestamp: string;
  value: number;
  label?: string;
}

export interface CountStats {
  category: string;
  count: number;
  percentage?: number;
}

export interface ProcessingSummary {
  totalProcessed: number;
  totalPending: number;
  totalErrors: number;
  averageProcessingTime: number;
  throughput: number;
}

// ============================================================================
// Entity State Machine Types
// ============================================================================

export interface EntityStateMachine {
  entityId: string;
  entityType: string;
  currentState: string;
  previousState?: string;
  transitions: StateTransition[];
  history: StateHistory[];
  // Additional fields from API response
  entityVersions?: Array<{
    state: string;
    date: string;
  }>;
  possibleTransitions?: string[];
  stateMachineEvents?: Array<{
    event: {
      type: string;
      transactionId: string;
      state: string;
    };
    message: string;
  }>;
}

export interface StateTransition {
  id: string;
  fromState: string;
  toState: string;
  event: string;
  timestamp: string;
  user?: string;
  data?: any;
}

export interface StateHistory {
  state: string;
  timestamp: string;
  duration?: number;
  event?: string;
}

// ============================================================================
// Version & Changes Types
// ============================================================================

export interface EntityVersion {
  version: number;
  entityId: string;
  entityType: string;
  timestamp: string;
  user?: string;
  changes: EntityChange[];
}

export interface EntityChange {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
}

// ============================================================================
// Grafana Types
// ============================================================================

// Renamed from `GrafanaChartConfig` to avoid colliding with the component export of
// the same name from ./components/grafana. Consumers should prefer the
// component import; this shape is kept as a type-only helper.
export interface GrafanaChartConfig {
  id: string;
  name?: string;
  title?: string;
  url?: string;
  panelId?: number;
  from?: string;
  to?: string;
  refresh?: string;
  theme?: 'light' | 'dark';
}

export interface GrafanaQuery {
  panelId: number;
  from: string;
  to: string;
  query?: string;
  variables?: Record<string, string>;
}

// ============================================================================
// SSH Types
// ============================================================================

export interface SshConnection {
  host: string;
  port?: number;
  username?: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  connected?: boolean;
  lastConnected?: string;
}

export interface SshCommand {
  id?: string;
  command: string;
  output?: string;
  error?: string;
  exitCode?: number;
  timestamp?: string;
}

// ============================================================================
// Filter & Pagination Types
// ============================================================================

export interface ProcessingFilter {
  queue?: string;
  shard?: string;
  status?: ProcessEventStatus;
  eventType?: string;
  from?: string;
  to?: string;
  entityId?: string;
  entityType?: string;
}

export interface Pagination {
  pageNum: number;
  pageSize: number;
  total?: number;
  totalPages?: number;
}

export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
  total: number;
}

// ============================================================================
// Store State Types
// ============================================================================

export interface AppState {
  node: string;
  baseUrl: string;
  proxyRequest: boolean;
  loading: boolean;
  error: string | null;
}

export interface ProcessingState {
  nodesProcessing: PmNode[];
  selectedNode: PmNode | null;
  loading: boolean;
  error: string | null;
}

export interface SshState {
  connection: SshConnection | null;
  commands: SshCommand[];
  loading: boolean;
  error: string | null;
}

export interface GrafanaState {
  charts: GrafanaChartConfig[];
  selectedChart: GrafanaChartConfig | null;
  loading: boolean;
  error: string | null;
}

