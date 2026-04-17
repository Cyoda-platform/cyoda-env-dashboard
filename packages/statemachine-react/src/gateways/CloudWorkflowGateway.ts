/**
 * CloudWorkflowGateway — calls the cloud document-based workflow API.
 *
 * Maps WorkflowGateway operations to the two endpoints documented in
 * `docs/cyoda-cloud/api/openapi-workflow.yml`:
 *   - GET  /model/{entityName}/{modelVersion}/workflow/export
 *   - POST /model/{entityName}/{modelVersion}/workflow/import
 *
 * Stateless — instantiation is free. The factory creates a fresh instance per
 * call (see `getWorkflowGateway()`); do not introduce a singleton cache here
 * without revisiting the HMR-flag-flip behavior the factory test pins.
 */

import { axios } from '@cyoda/http-api-react';
import { MustHaveActiveWorkflowError, RenameIncompleteError, WorkflowNotFoundError } from './errors';
import type { WorkflowGateway } from './WorkflowGateway';
import type {
  ModelRef,
  WorkflowDoc,
  WorkflowExportResponse,
  WorkflowImportRequest,
  WorkflowSummary,
} from './workflowDocTypes';

function exportUrl(modelRef: ModelRef): string {
  return `/model/${encodeURIComponent(modelRef.entityName)}/${modelRef.modelVersion}/workflow/export`;
}

function importUrl(modelRef: ModelRef): string {
  return `/model/${encodeURIComponent(modelRef.entityName)}/${modelRef.modelVersion}/workflow/import`;
}

function toSummary(doc: WorkflowDoc): WorkflowSummary {
  return {
    name: doc.name,
    desc: doc.desc,
    active: doc.active,
    initialState: doc.initialState,
    criterion: doc.criterion,
  };
}

export class CloudWorkflowGateway implements WorkflowGateway {
  async listWorkflows(modelRef: ModelRef | null): Promise<WorkflowSummary[]> {
    if (modelRef === null) {
      throw new Error('CloudWorkflowGateway.listWorkflows: modelRef is required');
    }
    const url = exportUrl(modelRef);
    const response = await axios.get<WorkflowExportResponse>(url);
    return (response.data.workflows ?? []).map(toSummary);
  }

  async loadWorkflow(modelRef: ModelRef | null, name: string): Promise<WorkflowDoc> {
    if (modelRef === null) {
      throw new Error('CloudWorkflowGateway.loadWorkflow: modelRef is required');
    }
    const response = await axios.get<WorkflowExportResponse>(exportUrl(modelRef));
    const found = (response.data.workflows ?? []).find((w) => w.name === name);
    if (!found) {
      throw new WorkflowNotFoundError(modelRef.entityName, modelRef.modelVersion, name);
    }
    return found;
  }

  async saveWorkflow(
    modelRef: ModelRef | null,
    doc: WorkflowDoc,
    mode: 'MERGE'
  ): Promise<{ key: string }> {
    if (modelRef === null) {
      throw new Error('CloudWorkflowGateway.saveWorkflow: modelRef is required');
    }
    // If this MERGE would deactivate a workflow, ensure at least one OTHER
    // active workflow remains. We don't know what the existing active state
    // is without a fetch, so only enforce when the caller is explicitly
    // setting active=false.
    if (doc.active === false) {
      const response = await axios.get<WorkflowExportResponse>(exportUrl(modelRef));
      const all = response.data.workflows ?? [];
      const otherActive = all.filter((w) => w.active && w.name !== doc.name);
      if (otherActive.length === 0) {
        throw new MustHaveActiveWorkflowError(
          modelRef.entityName,
          modelRef.modelVersion,
          doc.name,
          'deactivate'
        );
      }
    }
    const body: WorkflowImportRequest = { importMode: mode, workflows: [doc] };
    await axios.post(importUrl(modelRef), body);
    return { key: doc.name };
  }

  async deleteWorkflow(modelRef: ModelRef | null, name: string): Promise<void> {
    if (modelRef === null) {
      throw new Error('CloudWorkflowGateway.deleteWorkflow: modelRef is required');
    }
    const response = await axios.get<WorkflowExportResponse>(exportUrl(modelRef));
    const all = response.data.workflows ?? [];
    const remaining = all.filter((w) => w.name !== name);
    const remainingActive = remaining.filter((w) => w.active);
    if (remainingActive.length === 0) {
      throw new MustHaveActiveWorkflowError(
        modelRef.entityName,
        modelRef.modelVersion,
        name,
        'delete'
      );
    }
    if (remaining.length === all.length) {
      // Target wasn't in the export (already deleted by another caller, or never existed).
      // Nothing to do.
      return;
    }
    const body: WorkflowImportRequest = { importMode: 'REPLACE', workflows: remaining };
    await axios.post(importUrl(modelRef), body);
  }

  async copyWorkflow(
    modelRef: ModelRef | null,
    sourceName: string,
    newName: string
  ): Promise<{ key: string }> {
    if (modelRef === null) {
      throw new Error('CloudWorkflowGateway.copyWorkflow: modelRef is required');
    }
    const response = await axios.get<WorkflowExportResponse>(exportUrl(modelRef));
    const all = response.data.workflows ?? [];

    if (all.some((w) => w.name === newName)) {
      throw new Error(
        `Cannot copy: a workflow named "${newName}" already exists in model ` +
          `${modelRef.entityName} v${modelRef.modelVersion}`
      );
    }

    const source = all.find((w) => w.name === sourceName);
    if (!source) {
      throw new WorkflowNotFoundError(modelRef.entityName, modelRef.modelVersion, sourceName);
    }

    const clone: WorkflowDoc = { ...source, name: newName };
    const body: WorkflowImportRequest = { importMode: 'MERGE', workflows: [clone] };
    await axios.post(importUrl(modelRef), body);
    return { key: newName };
  }

  async renameWorkflow(
    modelRef: ModelRef | null,
    oldName: string,
    newName: string
  ): Promise<void> {
    if (modelRef === null) {
      throw new Error('CloudWorkflowGateway.renameWorkflow: modelRef is required');
    }
    if (oldName === newName) {
      return; // no-op: rename to the same name has no effect
    }
    // Copy first; if this throws, no state has changed and the caller sees the underlying error.
    await this.copyWorkflow(modelRef, oldName, newName);
    // Then delete the old. If this throws, we wrap it in RenameIncompleteError so the caller
    // can prompt the user (retry delete vs. discard the new copy).
    try {
      await this.deleteWorkflow(modelRef, oldName);
    } catch (cause) {
      throw new RenameIncompleteError(oldName, newName, cause);
    }
  }
}
