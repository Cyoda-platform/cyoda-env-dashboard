/**
 * Helper Utilities
 * Common utility functions for state machine
 */

import type { PersistedType } from '../types';

/**
 * Get persisted type from boolean value
 */
export function getPersistedType(persisted: boolean): PersistedType {
  return persisted ? 'persisted' : 'transient';
}

/**
 * Check if persisted type is runtime (transient)
 */
export function isRuntime(persistedType: PersistedType): boolean {
  return persistedType === 'transient';
}

/**
 * Format state machine ID
 */
export function formatId(id: any): string {
  if (typeof id === 'string') {
    return id;
  }
  return id?.persistedId || id?.runtimeId || '';
}

