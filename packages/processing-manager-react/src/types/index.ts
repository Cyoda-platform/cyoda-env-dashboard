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

export interface GrafanaChart {
  id: string;
  title: string;
  url: string;
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
  port: number;
  username: string;
  connected: boolean;
  lastConnected?: string;
}

export interface SshCommand {
  command: string;
  output?: string;
  error?: string;
  exitCode?: number;
  timestamp: string;
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
  charts: GrafanaChart[];
  selectedChart: GrafanaChart | null;
  loading: boolean;
  error: string | null;
}

