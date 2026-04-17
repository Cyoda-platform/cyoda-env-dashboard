/**
 * CloudInstancesGateway — calls the cloud entity API.
 *
 * Methods are filled in by Tasks C1-C6.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-instances-design.md §3.3
 */
import type { ModelRef } from './workflowDocTypes';
import type {
  EntityEnvelopeResponse,
  EntityChange,
  InstancesGateway,
  InstancesPage,
} from './InstancesGateway';

export class CloudInstancesGateway implements InstancesGateway {
  async list(_modelRef: ModelRef, _opts: {
    pageSize?: number; pageNumber?: number; entityIds?: string[];
  }): Promise<InstancesPage> {
    throw new Error('not implemented');
  }
  async search(_modelRef: ModelRef, _criterion: unknown, _opts?: { limit?: number; pointInTime?: string }): Promise<InstancesPage> {
    throw new Error('not implemented');
  }
  async load(_entityId: string, _opts?: { pointInTime?: string; transactionId?: string }): Promise<EntityEnvelopeResponse> {
    throw new Error('not implemented');
  }
  async loadChanges(_entityId: string, _opts?: { pointInTime?: string }): Promise<EntityChange[]> {
    throw new Error('not implemented');
  }
  async fireTransition(_entityId: string, _transition: string, _body: unknown): Promise<void> {
    throw new Error('not implemented');
  }
  async delete(_entityId: string): Promise<void> {
    throw new Error('not implemented');
  }
}
