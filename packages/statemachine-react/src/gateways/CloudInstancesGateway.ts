/**
 * CloudInstancesGateway — calls the cloud entity API.
 *
 * Methods are filled in by Tasks C1-C6.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-instances-design.md §3.3
 */
import { axios, extractCyodaEntityData, extractCyodaEntityMeta, type CyodaCloudEntityEnvelope } from '@cyoda/http-api-react';
import { TooManyEntityIdsError } from './errors';
import type { ModelRef } from './workflowDocTypes';
import type {
  EntityEnvelopeResponse,
  EntityChange,
  InstancesGateway,
  InstancesPage,
} from './InstancesGateway';

export class CloudInstancesGateway implements InstancesGateway {
  async list(modelRef: ModelRef, opts: {
    pageSize?: number; pageNumber?: number; entityIds?: string[];
  }): Promise<InstancesPage> {
    if (opts.entityIds && opts.entityIds.length > 0) {
      if (opts.entityIds.length > 100) {
        throw new TooManyEntityIdsError(opts.entityIds.length);
      }
      const criterion = {
        type: 'group' as const,
        operator: 'OR' as const,
        conditions: opts.entityIds.map((id) => ({
          type: 'lifecycle' as const,
          field: 'id',
          operation: 'EQUALS',
          value: id,
        })),
      };
      return this.search(modelRef, criterion);
    }
    const url = `/entity/${encodeURIComponent(modelRef.entityName)}/${modelRef.modelVersion}`;
    const response = await axios.get<InstancesPage>(url, {
      params: { pageSize: opts.pageSize, pageNumber: opts.pageNumber },
    });
    return {
      items: response.data.items ?? [],
      hasMore: response.data.hasMore ?? false,
    };
  }
  async search(modelRef: ModelRef, criterion: unknown, opts: { limit?: number; pointInTime?: string } = {}): Promise<InstancesPage> {
    const url = `/search/direct/${encodeURIComponent(modelRef.entityName)}/${modelRef.modelVersion}`;
    const response = await axios.post<InstancesPage>(url, criterion, {
      params: { limit: opts.limit, pointInTime: opts.pointInTime },
    });
    return {
      items: response.data.items ?? [],
      hasMore: response.data.hasMore ?? false,
    };
  }
  async load(entityId: string, opts: { pointInTime?: string; transactionId?: string } = {}): Promise<EntityEnvelopeResponse> {
    const url = `/entity/${encodeURIComponent(entityId)}`;
    const response = await axios.get<CyodaCloudEntityEnvelope>(url, {
      params: { pointInTime: opts.pointInTime, transactionId: opts.transactionId },
    });
    return {
      data: extractCyodaEntityData(response.data),
      meta: extractCyodaEntityMeta(response.data),
    };
  }
  async loadChanges(entityId: string, opts: { pointInTime?: string } = {}): Promise<EntityChange[]> {
    const url = `/entity/${encodeURIComponent(entityId)}/changes`;
    const response = await axios.get<any[]>(url, {
      params: { pointInTime: opts.pointInTime },
    });
    return (response.data ?? []).map((c) => ({
      transactionId: String(c.transactionId ?? ''),
      timestamp: String(c.timestamp ?? ''),
      user: c.user,
      changeType: c.changeType,
      stateFrom: c.stateFrom ?? undefined,
      stateTo: c.stateTo ?? undefined,
    }));
  }
  async fireTransition(_entityId: string, _transition: string, _body: unknown): Promise<void> {
    throw new Error('not implemented');
  }
  async delete(_entityId: string): Promise<void> {
    throw new Error('not implemented');
  }
}
