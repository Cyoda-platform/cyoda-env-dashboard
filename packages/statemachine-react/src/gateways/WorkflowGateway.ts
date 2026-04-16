/**
 * WorkflowGateway — the strategy boundary for workflow data access.
 *
 * Two implementations exist: `CloudWorkflowGateway` (cloud document API) and
 * `LegacyPlatformWorkflowGateway` (legacy granular CRUD). The factory in
 * `./index.ts` picks one based on `HelperFeatureFlags.isCyodaCloud()`.
 *
 * In legacy mode, `modelRef` is `null` and the legacy gateway ignores it.
 * In cloud mode, `modelRef` carries the (entityName, modelVersion) of the
 * entity model whose workflows are being operated on.
 *
 * `name` is the workflow's identity within `(entityName, modelVersion)` in cloud
 * mode (uniquely identifies the workflow per the cloud doc model). In legacy
 * mode the legacy gateway treats it as the legacy backend's workflow `id` —
 * an opaque-but-string identifier from the gateway's perspective. The
 * human-readable workflow name (which the legacy backend allows duplicates
 * of) lives on the underlying store record and is accessed by the legacy UI
 * directly, not via this gateway.
 */

import type { ModelRef, WorkflowDoc, WorkflowSummary } from './workflowDocTypes';

export interface WorkflowGateway {
  /** List all workflows for the given model. In legacy mode, lists across all entity classes. */
  listWorkflows(modelRef: ModelRef | null): Promise<WorkflowSummary[]>;

  /** Load a full workflow document by name within the given model. */
  loadWorkflow(modelRef: ModelRef | null, name: string): Promise<WorkflowDoc>;

  /**
   * Persist (create or update) a single workflow with the given import mode.
   * Returns the gateway-key of the affected workflow so callers (e.g. UI navigation)
   * can address it without a follow-up fetch.
   */
  saveWorkflow(modelRef: ModelRef | null, doc: WorkflowDoc, mode: 'MERGE'): Promise<{ key: string }>;

  /**
   * Delete a workflow by name. In cloud mode, enforces the ≥1 invariant
   * (throws `CannotDeleteLastWorkflowError` rather than emptying the model).
   */
  deleteWorkflow(modelRef: ModelRef | null, name: string): Promise<void>;

  /**
   * Duplicate a workflow under a new name. Validates uniqueness of `newName` client-side.
   * Returns the gateway-key of the new copy so callers can navigate to it without a
   * follow-up fetch.
   */
  copyWorkflow(modelRef: ModelRef | null, sourceName: string, newName: string): Promise<{ key: string }>;

  /**
   * Rename a workflow. Implementations orchestrate copy-then-delete because
   * neither backend exposes a native rename. Throws `RenameIncompleteError`
   * if the copy succeeds but the delete fails.
   */
  renameWorkflow(modelRef: ModelRef | null, oldName: string, newName: string): Promise<void>;
}
