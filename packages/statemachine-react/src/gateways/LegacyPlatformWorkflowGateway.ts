/**
 * LegacyPlatformWorkflowGateway — adapts the existing legacy granular store
 * calls to the WorkflowGateway interface. Used when isCyodaCloud() is false.
 *
 * Identity mapping: the gateway interface uses `name: string` as the workflow
 * key in operations like deleteWorkflow / copyWorkflow / renameWorkflow.
 * Legacy workflows are keyed by `id` (UUID) on the wire, so this gateway
 * treats the WorkflowGateway `name` parameter as the legacy workflow's id
 * (an opaque-but-string identifier from the gateway's perspective).
 *
 * The corresponding WorkflowSummary returned by listWorkflows() therefore
 * has its `name` field set to the legacy id; the human-readable name and
 * other legacy-specific fields are accessed by the legacy list page from
 * the underlying store record, not from this summary.
 */

import { useStatemachineStore } from '../stores/statemachineStore';
import { NotImplementedInLegacyError, RenameIncompleteError } from './errors';
import type { WorkflowGateway } from './WorkflowGateway';
import type { ModelRef, WorkflowDoc, WorkflowSummary } from './workflowDocTypes';

export class LegacyPlatformWorkflowGateway implements WorkflowGateway {
  async listWorkflows(_modelRef: ModelRef | null): Promise<WorkflowSummary[]> {
    throw new Error('not implemented');
  }

  async loadWorkflow(_modelRef: ModelRef | null, _name: string): Promise<WorkflowDoc> {
    throw new NotImplementedInLegacyError('loadWorkflow');
  }

  async saveWorkflow(
    _modelRef: ModelRef | null,
    _doc: WorkflowDoc,
    _mode: 'MERGE'
  ): Promise<void> {
    throw new Error('not implemented');
  }

  async deleteWorkflow(_modelRef: ModelRef | null, _name: string): Promise<void> {
    throw new Error('not implemented');
  }

  async copyWorkflow(
    _modelRef: ModelRef | null,
    _sourceName: string,
    _newName: string
  ): Promise<void> {
    throw new Error('not implemented');
  }

  async renameWorkflow(
    _modelRef: ModelRef | null,
    _oldName: string,
    _newName: string
  ): Promise<void> {
    throw new Error('not implemented');
  }
}
