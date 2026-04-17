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
 *
 * Known limitation — `copyWorkflow` partial failure: the orchestration is three
 * sequential HTTP calls (copy → get → put). If `getWorkflow` or `putWorkflow`
 * fails after the underlying `copyWorkflow` succeeded, the legacy backend will
 * be left with an auto-named copy that the user never sees. The error is
 * surfaced to the caller raw. A typed CopyIncompleteError that carries the
 * orphan id (so a future UI can offer a "Discard the auto-named copy" action)
 * is a worthwhile follow-up; not implemented here because no current caller
 * could act on it. Track in a follow-up issue when the cloud editor lands.
 *
 * Stateless — instantiation is free. The factory creates a fresh instance per
 * call (see `getWorkflowGateway()`); do not introduce a singleton cache here
 * without revisiting the HMR-flag-flip behavior the factory test pins.
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
      initialState: undefined,
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
  ): Promise<{ key: string }> {
    const store = useStatemachineStore.getState();
    const recordResp = await store.getWorkflow('persisted', doc.name);
    const record = recordResp?.data ?? {};
    // Spread doc.active only when defined, so an undefined `active` preserves
    // the existing record's value (no silent re-enable). Symmetric with
    // CloudWorkflowGateway.saveWorkflow which forwards the doc verbatim.
    const merged = {
      ...record,
      id: doc.name,
      ...(doc.active !== undefined ? { active: doc.active } : {}),
    };
    await store.putWorkflow(merged);
    return { key: doc.name };
  }

  async deleteWorkflow(_modelRef: ModelRef | null, name: string): Promise<void> {
    await useStatemachineStore.getState().deleteWorkflow(name);
  }

  async copyWorkflow(
    _modelRef: ModelRef | null,
    sourceName: string,
    newName: string
  ): Promise<{ key: string }> {
    const store = useStatemachineStore.getState();
    const copyResp = await store.copyWorkflow('persisted', sourceName);
    const copyId = copyResp?.data?.id;
    if (!copyId) {
      throw new Error('copyWorkflow: backend response did not include the new workflow id');
    }
    const recordResp = await store.getWorkflow('persisted', copyId);
    const record = recordResp?.data ?? {};
    await store.putWorkflow({ ...record, id: copyId, name: newName });
    return { key: copyId };
  }

  async renameWorkflow(
    modelRef: ModelRef | null,
    oldName: string,
    newName: string
  ): Promise<void> {
    if (oldName === newName) {
      return; // no-op: rename to the same name has no effect
    }
    await this.copyWorkflow(modelRef, oldName, newName);
    try {
      await this.deleteWorkflow(modelRef, oldName);
    } catch (cause) {
      throw new RenameIncompleteError(oldName, newName, cause);
    }
  }
}
