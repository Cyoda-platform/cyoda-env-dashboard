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
import { CloudInstancesGateway } from './CloudInstancesGateway';
import type { InstancesGateway } from './InstancesGateway';

export type { WorkflowGateway } from './WorkflowGateway';
export {
  MustHaveActiveWorkflowError,
  RenameIncompleteError,
  NotImplementedInLegacyError,
  TooManyEntityIdsError,
  WorkflowNotFoundError,
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
// Re-export from http-api-react so callers can import all gateway-related
// types from one place.
export type { EntityModelListItem } from '@cyoda/http-api-react';
export { CloudWorkflowGateway } from './CloudWorkflowGateway';
export { LegacyPlatformWorkflowGateway } from './LegacyPlatformWorkflowGateway';

export function getWorkflowGateway(): WorkflowGateway {
  return HelperFeatureFlags.isCyodaCloud()
    ? new CloudWorkflowGateway()
    : new LegacyPlatformWorkflowGateway();
}

export type { InstancesGateway, EntitySummary, EntityChange, InstancesPage, EntityEnvelopeResponse } from './InstancesGateway';

/**
 * Returns a CloudInstancesGateway. Cloud-only — there is no
 * LegacyPlatformInstancesGateway (see spec §3.4). Callers that reach this
 * factory outside cloud-business mode are programming errors; the factory
 * does NOT silently return a no-op shim.
 *
 * Why a factory rather than `new CloudInstancesGateway()` inline? It's a DI
 * seam for tests — vi.mock'ing a factory is the established idiom in this
 * codebase (mirrors getWorkflowGateway).
 */
export function getInstancesGateway(): InstancesGateway {
  return new CloudInstancesGateway();
}

export { CloudInstancesGateway } from './CloudInstancesGateway';
