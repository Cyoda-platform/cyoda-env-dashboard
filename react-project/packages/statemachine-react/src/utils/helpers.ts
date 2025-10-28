/**
 * Helper Utilities
 * Common utility functions for state machine
 */

import type { PersistedType } from '../types';

/**
 * Get persisted type from boolean value
 */
export function getPersistedType(persisted: boolean): PersistedType {
  return persisted ? 'persisted' : 'runtime';
}

/**
 * Check if persisted type is runtime
 */
export function isRuntime(persistedType: PersistedType): boolean {
  return persistedType === 'runtime';
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

