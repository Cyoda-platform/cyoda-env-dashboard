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

export class CloudWorkflowGateway implements WorkflowGateway {
  async listWorkflows(_modelRef: ModelRef | null): Promise<WorkflowSummary[]> {
    throw new Error('not implemented');
  }

  async loadWorkflow(_modelRef: ModelRef | null, _name: string): Promise<WorkflowDoc> {
    throw new Error('not implemented');
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
