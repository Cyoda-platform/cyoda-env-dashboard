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
 * mode. In legacy mode, the legacy gateway treats it as the user-facing workflow
 * name; uniqueness is the caller's responsibility.
 */

import type { ModelRef, WorkflowDoc, WorkflowSummary } from './workflowDocTypes';

export interface WorkflowGateway {
  /** List all workflows for the given model. In legacy mode, lists across all entity classes. */
  listWorkflows(modelRef: ModelRef | null): Promise<WorkflowSummary[]>;

  /** Load a full workflow document by name within the given model. */
  loadWorkflow(modelRef: ModelRef | null, name: string): Promise<WorkflowDoc>;

  /** Persist (create or update) a single workflow with the given import mode. */
  saveWorkflow(modelRef: ModelRef | null, doc: WorkflowDoc, mode: 'MERGE'): Promise<void>;

  /**
   * Delete a workflow by name. In cloud mode, enforces the ≥1 invariant
   * (throws `CannotDeleteLastWorkflowError` rather than emptying the model).
   */
  deleteWorkflow(modelRef: ModelRef | null, name: string): Promise<void>;

  /** Duplicate a workflow under a new name. Validates uniqueness of `newName` client-side. */
  copyWorkflow(modelRef: ModelRef | null, sourceName: string, newName: string): Promise<void>;

  /**
   * Rename a workflow. Implementations orchestrate copy-then-delete because
   * neither backend exposes a native rename. Throws `RenameIncompleteError`
   * if the copy succeeds but the delete fails.
   */
  renameWorkflow(modelRef: ModelRef | null, oldName: string, newName: string): Promise<void>;
}
