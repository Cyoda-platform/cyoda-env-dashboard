/**
 * Workflow gateway barrel + factory.
 *
 * `getWorkflowGateway()` is the only place in the codebase that consults
 * `HelperFeatureFlags.isCyodaCloud()` for workflow operations. Callers
 * (React Query hooks) call this every time and never cache the instance,
 * so a flag flip during HMR is reflected immediately.
 */

import { HelperFeatureFlags } from '@cyoda/http-api-react';
import { CloudWorkflowGateway } from './CloudWorkflowGateway';
import { LegacyPlatformWorkflowGateway } from './LegacyPlatformWorkflowGateway';
import type { WorkflowGateway } from './WorkflowGateway';

export type { WorkflowGateway } from './WorkflowGateway';
export {
  CannotDeleteLastWorkflowError,
  RenameIncompleteError,
  NotImplementedInLegacyError,
} from './errors';
export type {
  ModelRef,
  WorkflowDoc,
  WorkflowSummary,
  WorkflowImportMode,
  WorkflowExportResponse,
  WorkflowImportRequest,
  StateDefinition,
  TransitionDefinition,
  ProcessorDefinition,
  ExternalizedFunctionConfig,
  ExternalizedProcessorConfig,
  ScheduledTransitionConfig,
  ProcessorExecutionMode,
  QueryCondition,
} from './workflowDocTypes';
export { CloudWorkflowGateway } from './CloudWorkflowGateway';
export { LegacyPlatformWorkflowGateway } from './LegacyPlatformWorkflowGateway';

export function getWorkflowGateway(): WorkflowGateway {
  return HelperFeatureFlags.isCyodaCloud()
    ? new CloudWorkflowGateway()
    : new LegacyPlatformWorkflowGateway();
}
