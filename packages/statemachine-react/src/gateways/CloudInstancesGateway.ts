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
  EntitySummary,
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
    const params: Record<string, unknown> = {};
    if (opts.pageSize !== undefined) params.pageSize = opts.pageSize;
    if (opts.pageNumber !== undefined) params.pageNumber = opts.pageNumber;
    const response = await axios.get<CyodaCloudEntityEnvelope[]>(
      url,
      Object.keys(params).length > 0 ? { params } : undefined,
    );
    const envelopes = response.data ?? [];
    const items: EntitySummary[] = envelopes.map((env) => ({
      entityId: String(env.meta?.id ?? ''),
      entityName: modelRef.entityName,
      modelVersion: modelRef.modelVersion,
      state: String(env.meta?.state ?? ''),
      creationDate: env.meta?.creationDate as string | undefined,
      lastUpdateTime: env.meta?.lastUpdateTime as string | undefined,
    }));
    return {
      items,
      hasMore: opts.pageSize !== undefined && items.length === opts.pageSize,
    };
  }
  async search(modelRef: ModelRef, criterion: unknown, opts: { limit?: number; pointInTime?: string } = {}): Promise<InstancesPage> {
    const url = `/search/direct/${encodeURIComponent(modelRef.entityName)}/${modelRef.modelVersion}`;
    const sparams: Record<string, unknown> = {};
    if (opts.limit !== undefined) sparams.limit = opts.limit;
    if (opts.pointInTime !== undefined) sparams.pointInTime = opts.pointInTime;
    const response = await axios.post<CyodaCloudEntityEnvelope[]>(
      url, criterion,
      Object.keys(sparams).length > 0 ? { params: sparams } : undefined,
    );
    const envelopes = response.data ?? [];
    const items: EntitySummary[] = envelopes.map((env) => ({
      entityId: String(env.meta?.id ?? ''),
      entityName: modelRef.entityName,
      modelVersion: modelRef.modelVersion,
      state: String(env.meta?.state ?? ''),
      creationDate: env.meta?.creationDate as string | undefined,
      lastUpdateTime: env.meta?.lastUpdateTime as string | undefined,
    }));
    return {
      items,
      hasMore: opts.limit !== undefined && items.length === opts.limit,
    };
  }
  async load(entityId: string, opts: { pointInTime?: string; transactionId?: string } = {}): Promise<EntityEnvelopeResponse> {
    const url = `/entity/${encodeURIComponent(entityId)}`;
    const lparams: Record<string, unknown> = {};
    if (opts.pointInTime !== undefined) lparams.pointInTime = opts.pointInTime;
    if (opts.transactionId !== undefined) lparams.transactionId = opts.transactionId;
    const response = await axios.get<CyodaCloudEntityEnvelope>(url, Object.keys(lparams).length > 0 ? { params: lparams } : undefined);
    return {
      data: extractCyodaEntityData(response.data),
      meta: extractCyodaEntityMeta(response.data),
    };
  }
  async loadChanges(entityId: string, opts: { pointInTime?: string } = {}): Promise<EntityChange[]> {
    const url = `/entity/${encodeURIComponent(entityId)}/changes`;
    const cparams: Record<string, unknown> = {};
    if (opts.pointInTime !== undefined) cparams.pointInTime = opts.pointInTime;
    const response = await axios.get<any[]>(url, Object.keys(cparams).length > 0 ? { params: cparams } : undefined);
    return (response.data ?? []).map((c) => ({
      transactionId: String(c.transactionId ?? ''),
      timestamp: String(c.timestamp ?? ''),
      user: c.user,
      changeType: c.changeType,
      stateFrom: c.stateFrom ?? undefined,
      stateTo: c.stateTo ?? undefined,
    }));
  }
  async fireTransition(entityId: string, transition: string, body: unknown): Promise<void> {
    const url = `/entity/JSON/${encodeURIComponent(entityId)}/${encodeURIComponent(transition)}`;
    await axios.put(url, body);
  }
  async delete(entityId: string): Promise<void> {
    await axios.delete(`/entity/${encodeURIComponent(entityId)}`);
  }
}
