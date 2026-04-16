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
    const response = await useStatemachineStore.getState().getAllWorkflowsList(undefined);
    const records = Array.isArray(response.data) ? response.data : [];
    return records.map((rec: any) => ({
      name: rec.id,
      desc: undefined,
      active: !!rec.active,
      initialState: '',
      criterion: undefined,
    }));
  }

  async loadWorkflow(_modelRef: ModelRef | null, _name: string): Promise<WorkflowDoc> {
    throw new NotImplementedInLegacyError('loadWorkflow');
  }

  async saveWorkflow(
    _modelRef: ModelRef | null,
    doc: WorkflowDoc,
    _mode: 'MERGE'
  ): Promise<void> {
    const store = useStatemachineStore.getState();
    const recordResp = await store.getWorkflow('persisted', doc.name);
    const record = recordResp?.data ?? {};
    const merged = {
      ...record,
      id: doc.name,
      active: doc.active === undefined ? true : doc.active,
    };
    await store.putWorkflow(merged);
  }

  async deleteWorkflow(_modelRef: ModelRef | null, name: string): Promise<void> {
    await useStatemachineStore.getState().deleteWorkflow(name);
  }

  async copyWorkflow(
    _modelRef: ModelRef | null,
    sourceName: string,
    newName: string
  ): Promise<void> {
    const store = useStatemachineStore.getState();
    const copyResp = await store.copyWorkflow('persisted', sourceName);
    const copyId = copyResp?.data?.id;
    if (!copyId) {
      throw new Error('copyWorkflow: backend response did not include the new workflow id');
    }
    const recordResp = await store.getWorkflow('persisted', copyId);
    const record = recordResp?.data ?? {};
    await store.putWorkflow({ ...record, id: copyId, name: newName });
  }

  async renameWorkflow(
    modelRef: ModelRef | null,
    oldName: string,
    newName: string
  ): Promise<void> {
    await this.copyWorkflow(modelRef, oldName, newName);
    try {
      await this.deleteWorkflow(modelRef, oldName);
    } catch (cause) {
      throw new RenameIncompleteError(oldName, newName, cause);
    }
  }
}
