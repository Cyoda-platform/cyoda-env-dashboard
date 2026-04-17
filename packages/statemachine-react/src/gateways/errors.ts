/**
 * Typed errors raised by WorkflowGateway implementations.
 */

/**
 * Thrown when a delete or deactivate request would leave the entity model
 * with zero active workflows. Cloud Cyoda requires at least one active
 * workflow per (entityName, modelVersion).
 */
export class MustHaveActiveWorkflowError extends Error {
  constructor(
    public readonly entityName: string,
    public readonly modelVersion: number,
    public readonly workflowName: string,
    /** What action triggered the error: 'delete' or 'deactivate'. */
    public readonly action: 'delete' | 'deactivate'
  ) {
    super(
      `Cannot ${action} workflow "${workflowName}" in model ` +
        `${entityName} v${modelVersion} — every model must have at least ` +
        `one active workflow.`
    );
    this.name = 'MustHaveActiveWorkflowError';
  }
}

/**
 * Thrown when a rename succeeded in copying the workflow under the new name
 * but failed to delete the old one. The caller must decide whether to retry
 * the delete or remove the new copy to undo the rename.
 */
export class RenameIncompleteError extends Error {
  constructor(
    public readonly oldName: string,
    public readonly newName: string,
    public readonly cause: unknown
  ) {
    super(
      `Workflow rename "${oldName}" → "${newName}" left the model in a partial state: ` +
        `the new copy exists but the old one could not be removed.`
    );
    this.name = 'RenameIncompleteError';
  }
}

/**
 * Thrown when a WorkflowGateway operation is invoked on the legacy gateway
 * but no legacy implementation exists for it (typically because no legacy
 * UI code path needs the operation today).
 */
export class NotImplementedInLegacyError extends Error {
  constructor(public readonly operation: string) {
    super(
      `Operation "${operation}" is not implemented in the legacy workflow gateway. ` +
        `It is currently only used by cloud-mode code.`
    );
    this.name = 'NotImplementedInLegacyError';
  }
}
