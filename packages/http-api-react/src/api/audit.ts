/**
 * Cyoda Cloud Audit API
 * API functions for fetching audit events from the Cyoda Cloud audit endpoint
 * Only available when VITE_FEATURE_FLAG_IS_CYODA_CLOUD is enabled
 */

import axios from '../config/axios';

// ============================================================================
// Types
// ============================================================================

export type AuditEventType = 'StateMachine' | 'EntityChange' | 'System';
export type AuditEventSeverity = 'ERROR' | 'INFO' | 'WARN' | 'DEBUG';

export interface AuditActorInfo {
  id: string;
  legalId: string;
  name?: string;
}

export interface BaseAuditEvent {
  auditEventType: AuditEventType;
  severity: AuditEventSeverity;
  consistencyTime?: string;
  utcTime: string;
  microsTime: number;
  entityId?: string;
  entityModel?: string;
  transactionId?: string;
  actor?: AuditActorInfo;
  details?: string;
  system?: boolean;
}

export interface StateMachineAuditEvent extends BaseAuditEvent {
  auditEventType: 'StateMachine';
  state: string;
  eventType: string;
  data?: {
    eventType: string;
    workflowName?: string;
    transition?: string;
    newState?: string;
    state?: string;
    success?: boolean;
    reason?: string;
    stateProcessId?: {
      persisted: boolean;
      persistedId?: string;
      runtimeId: number;
    };
    stateProcessClassName?: string;
    stateProcessType?: string;
    failReason?: string;
  };
}

export interface EntityChangeAuditEvent extends BaseAuditEvent {
  auditEventType: 'EntityChange';
  changeType: 'CREATED' | 'UPDATED' | 'DELETED';
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
}

export interface SystemAuditEvent extends BaseAuditEvent {
  auditEventType: 'System';
  errorTime?: string;
  doneTime?: string;
  queueName?: string;
  shardId?: string;
  status?: string;
  data?: Record<string, unknown>;
}

export type AuditEvent = StateMachineAuditEvent | EntityChangeAuditEvent | SystemAuditEvent;

export interface CursorPaginationInfo {
  hasNext: boolean;
  nextCursor?: string;
}

export interface EntityAuditEventsResponse {
  items: AuditEvent[];
  pagination: CursorPaginationInfo;
}

export interface AuditSearchParams {
  eventType?: AuditEventType[];
  severity?: AuditEventSeverity;
  fromUtcTime?: string;
  toUtcTime?: string;
  transactionId?: string;
  cursor?: string;
  limit?: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Search audit events for a specific entity
 * @param entityId - The entity UUID
 * @param params - Optional search parameters
 * @returns Paginated audit events response
 */
export function getEntityAuditEvents(entityId: string, params?: AuditSearchParams) {
  return axios.get<EntityAuditEventsResponse>(
    `/audit/entity/${encodeURIComponent(entityId)}`,
    { params }
  );
}

/**
 * Get state machine audit events for an entity
 * @param entityId - The entity UUID
 * @param transactionId - Optional transaction ID to filter by
 * @returns Paginated audit events response with only StateMachine events
 */
export function getStateMachineAuditEvents(entityId: string, transactionId?: string) {
  const params: AuditSearchParams = {
    eventType: ['StateMachine'],
    transactionId,
    limit: 100,
  };
  return getEntityAuditEvents(entityId, params);
}

/**
 * Get entity change audit events for an entity
 * @param entityId - The entity UUID
 * @param transactionId - Optional transaction ID to filter by
 * @returns Paginated audit events response with only EntityChange events
 */
export function getEntityChangeAuditEvents(entityId: string, transactionId?: string) {
  const params: AuditSearchParams = {
    eventType: ['EntityChange'],
    transactionId,
    limit: 100,
  };
  return getEntityAuditEvents(entityId, params);
}

/**
 * Get system audit events for an entity
 * @param entityId - The entity UUID
 * @param transactionId - Optional transaction ID to filter by
 * @returns Paginated audit events response with only System events
 */
export function getSystemAuditEvents(entityId: string, transactionId?: string) {
  const params: AuditSearchParams = {
    eventType: ['System'],
    transactionId,
    limit: 100,
  };
  return getEntityAuditEvents(entityId, params);
}

