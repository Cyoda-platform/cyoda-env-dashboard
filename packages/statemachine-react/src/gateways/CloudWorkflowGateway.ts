/**
 * CloudWorkflowGateway — calls the cloud document-based workflow API.
 *
 * Maps WorkflowGateway operations to the two endpoints documented in
 * `docs/cyoda-cloud/api/openapi-workflow.yml`:
 *   - GET  /model/{entityName}/{modelVersion}/workflow/export
 *   - POST /model/{entityName}/{modelVersion}/workflow/import
 */

import { axios } from '@cyoda/http-api-react';
import { CannotDeleteLastWorkflowError, RenameIncompleteError } from './errors';
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
      throw new Error(
        `Workflow "${name}" not found in model ${modelRef.entityName} v${modelRef.modelVersion}`
      );
    }
    return found;
  }

  async saveWorkflow(
    modelRef: ModelRef | null,
    doc: WorkflowDoc,
    mode: 'MERGE'
  ): Promise<void> {
    if (modelRef === null) {
      throw new Error('CloudWorkflowGateway.saveWorkflow: modelRef is required');
    }
    const body: WorkflowImportRequest = { importMode: mode, workflows: [doc] };
    await axios.post(importUrl(modelRef), body);
  }

  async deleteWorkflow(modelRef: ModelRef | null, name: string): Promise<void> {
    if (modelRef === null) {
      throw new Error('CloudWorkflowGateway.deleteWorkflow: modelRef is required');
    }
    const response = await axios.get<WorkflowExportResponse>(exportUrl(modelRef));
    const all = response.data.workflows ?? [];
    const remaining = all.filter((w) => w.name !== name);
    if (remaining.length === 0) {
      throw new CannotDeleteLastWorkflowError(modelRef.entityName, modelRef.modelVersion, name);
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
