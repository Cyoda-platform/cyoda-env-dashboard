/**
 * Cloud workflow type definitions.
 *
 * These types model the cloud workflow API documented in
 * `docs/cyoda-cloud/api/openapi-workflow.yml`. Used by the WorkflowGateway
 * interface and both gateway implementations.
 */

/** Identifier of an entity model in the cloud API. */
export interface ModelRef {
  entityName: string;
  modelVersion: number;
}

/** Import mode for the workflow/import endpoint. */
export type WorkflowImportMode = 'REPLACE' | 'ACTIVATE' | 'MERGE';

/** Execution mode of an externalized processor. */
export type ProcessorExecutionMode = 'SYNC' | 'ASYNC_SAME_TX' | 'ASYNC_NEW_TX';

/**
 * QueryCondition is the cloud's polymorphic condition tree (simple / group / function).
 * Defined in openapi-common.yml. We type it as `unknown`-shaped here and let editors
 * pass through; precise modeling lives in sub-branch 4 with the QueryConditionEditor.
 */
export type QueryCondition = Record<string, unknown>;

/** Externalized function configuration shared by externalized processors and function criteria. */
export interface ExternalizedFunctionConfig {
  attachEntity?: boolean;
  calculationNodesTags?: string;
  responseTimeoutMs?: number;
  retryPolicy?: string;
  context?: string;
  [key: string]: unknown;
}

/** Configuration for an externalized processor, extending the function config with async options. */
export interface ExternalizedProcessorConfig extends ExternalizedFunctionConfig {
  asyncResult?: boolean;
  crossoverToAsyncMs?: number;
}

/** Configuration for a scheduled-transition processor. */
export interface ScheduledTransitionConfig {
  delayMs: number;
  /** Timeout for the scheduled transition (ms). Optional per openapi-common.yml. */
  timeoutMs?: number;
  transition: string;
}

/** Polymorphic processor definition (externalized or scheduled). */
export interface ProcessorDefinition {
  type: 'externalized' | 'scheduled';
  name: string;
  executionMode?: ProcessorExecutionMode;
  config?: ExternalizedProcessorConfig | ScheduledTransitionConfig;
}

/** Definition of a state transition. */
export interface TransitionDefinition {
  name: string;
  next: string;
  manual: boolean;
  disabled?: boolean;
  processors?: ProcessorDefinition[];
  criterion?: QueryCondition;
}

/** Definition of a workflow state. */
export interface StateDefinition {
  transitions?: TransitionDefinition[];
}

/**
 * Full cloud workflow document — matches `WorkflowConfiguration` in openapi-workflow.yml.
 */
export interface WorkflowDoc {
  version: string;
  name: string;
  desc?: string;
  initialState: string;
  active?: boolean;
  criterion?: QueryCondition;
  states: Record<string, StateDefinition>;
}

/**
 * A summary projection of WorkflowDoc, returned by listWorkflows.
 * Includes everything a workflow-list table needs without the per-state details.
 */
export interface WorkflowSummary {
  name: string;
  desc?: string;
  active?: boolean;
  initialState?: string;
  criterion?: QueryCondition;
}

/** Response shape of GET /model/{entityName}/{modelVersion}/workflow/export. */
export interface WorkflowExportResponse {
  entityName: string;
  modelVersion: number;
  workflows: WorkflowDoc[];
}

/** Body shape of POST /model/{entityName}/{modelVersion}/workflow/import. */
export interface WorkflowImportRequest {
  workflows: WorkflowDoc[];
  importMode?: WorkflowImportMode;
}
