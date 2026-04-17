/**
 * Cloud Instances gateway interface. Implemented by CloudInstancesGateway.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-instances-design.md §3.2
 */
import type { ModelRef } from './workflowDocTypes';

export interface EntitySummary {
  entityId: string;
  entityName: string;
  modelVersion: number;
  state: string;
  currentWorkflowName?: string;
  creationDate?: string;
  lastUpdateTime?: string;
  deleted?: boolean;
}

export interface EntityChange {
  transactionId: string;
  /** ISO-8601 timestamp. */
  timestamp: string;
  user?: string;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE';
  stateFrom?: string;
  stateTo?: string;
}

export interface InstancesPage {
  items: EntitySummary[];
  hasMore: boolean;
}
// No `totalCount` — neither cloud `GET /entity/{name}/{ver}` nor `POST /search/direct/...`
// documents one. The UI shows "Showing N items" and uses `hasMore` for the Next-page button.

export interface EntityEnvelopeResponse {
  /** The pure entity body. */
  data: Record<string, unknown> | undefined;
  /** Lifecycle metadata: id, state, creationDate, lastUpdateTime, previousTransition. */
  meta: {
    id?: string;
    state?: string;
    creationDate?: string;
    lastUpdateTime?: string;
    previousTransition?: string;
    [key: string]: unknown;
  } | undefined;
}

export interface InstancesGateway {
  list(modelRef: ModelRef, opts: {
    /** Required for the unfiltered list path. Ignored when `entityIds` is set. */
    pageSize?: number;
    /** 1-indexed (verify at plan execution against the live API). Required for the unfiltered list path; ignored when `entityIds` is set. */
    pageNumber?: number;
    /** ≤100 entity IDs accepted; >100 throws TooManyEntityIdsError synchronously. */
    entityIds?: string[];
  }): Promise<InstancesPage>;

  search(modelRef: ModelRef, criterion: unknown, opts?: {
    limit?: number;
    pointInTime?: string;
  }): Promise<InstancesPage>;

  load(entityId: string, opts?: {
    pointInTime?: string;
    transactionId?: string;
  }): Promise<EntityEnvelopeResponse>;

  loadChanges(entityId: string, opts?: {
    pointInTime?: string;
  }): Promise<EntityChange[]>;

  fireTransition(entityId: string, transition: string, body: unknown): Promise<void>;

  delete(entityId: string): Promise<void>;
}
