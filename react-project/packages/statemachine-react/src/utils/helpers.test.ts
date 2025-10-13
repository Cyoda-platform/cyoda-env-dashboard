/**
 * Tests for helper utilities
 */

import { describe, it, expect } from 'vitest';
import { getPersistedType, isRuntime, formatId } from './helpers';

describe('Helper Utilities', () => {
  describe('getPersistedType', () => {
    it('should return "persisted" when input is true', () => {
      expect(getPersistedType(true)).toBe('persisted');
    });

    it('should return "transient" when input is false', () => {
      expect(getPersistedType(false)).toBe('transient');
    });

    it('should handle truthy values', () => {
      // TypeScript will prevent this, but testing runtime behavior
      expect(getPersistedType(1 as any)).toBe('persisted');
      expect(getPersistedType('true' as any)).toBe('persisted');
      expect(getPersistedType({} as any)).toBe('persisted');
      expect(getPersistedType([] as any)).toBe('persisted');
    });

    it('should handle falsy values', () => {
      // TypeScript will prevent this, but testing runtime behavior
      expect(getPersistedType(0 as any)).toBe('transient');
      expect(getPersistedType('' as any)).toBe('transient');
      expect(getPersistedType(null as any)).toBe('transient');
      expect(getPersistedType(undefined as any)).toBe('transient');
    });
  });

  describe('isRuntime', () => {
    it('should return true for "transient" type', () => {
      expect(isRuntime('transient')).toBe(true);
    });

    it('should return false for "persisted" type', () => {
      expect(isRuntime('persisted')).toBe(false);
    });

    it('should handle invalid persisted types', () => {
      // TypeScript will prevent this, but testing runtime behavior
      expect(isRuntime('invalid' as any)).toBe(false);
      expect(isRuntime('' as any)).toBe(false);
      expect(isRuntime(null as any)).toBe(false);
      expect(isRuntime(undefined as any)).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(isRuntime('Transient' as any)).toBe(false);
      expect(isRuntime('TRANSIENT' as any)).toBe(false);
      expect(isRuntime('Persisted' as any)).toBe(false);
    });
  });

  describe('formatId', () => {
    describe('string IDs', () => {
      it('should return string ID as-is', () => {
        expect(formatId('workflow-123')).toBe('workflow-123');
      });

      it('should handle empty string', () => {
        expect(formatId('')).toBe('');
      });

      it('should handle string with special characters', () => {
        expect(formatId('workflow-123-abc-xyz')).toBe('workflow-123-abc-xyz');
      });

      it('should handle UUID format', () => {
        const uuid = '550e8400-e29b-41d4-a716-446655440000';
        expect(formatId(uuid)).toBe(uuid);
      });
    });

    describe('object IDs with persistedId', () => {
      it('should return persistedId when present', () => {
        const id = {
          persistedId: 'persisted-123',
          runtimeId: 'runtime-456',
        };
        expect(formatId(id)).toBe('persisted-123');
      });

      it('should prefer persistedId over runtimeId', () => {
        const id = {
          persistedId: 'persisted-123',
          runtimeId: 'runtime-456',
        };
        expect(formatId(id)).toBe('persisted-123');
      });

      it('should handle persistedId with empty string', () => {
        const id = {
          persistedId: '',
          runtimeId: 'runtime-456',
        };
        // Empty string is falsy, so it should fall back to runtimeId
        expect(formatId(id)).toBe('runtime-456');
      });
    });

    describe('object IDs with runtimeId', () => {
      it('should return runtimeId when persistedId is not present', () => {
        const id = {
          runtimeId: 'runtime-456',
        };
        expect(formatId(id)).toBe('runtime-456');
      });

      it('should return runtimeId when persistedId is null', () => {
        const id = {
          persistedId: null,
          runtimeId: 'runtime-456',
        };
        expect(formatId(id)).toBe('runtime-456');
      });

      it('should return runtimeId when persistedId is undefined', () => {
        const id = {
          persistedId: undefined,
          runtimeId: 'runtime-456',
        };
        expect(formatId(id)).toBe('runtime-456');
      });
    });

    describe('edge cases', () => {
      it('should return empty string for null', () => {
        expect(formatId(null)).toBe('');
      });

      it('should return empty string for undefined', () => {
        expect(formatId(undefined)).toBe('');
      });

      it('should return empty string for empty object', () => {
        expect(formatId({})).toBe('');
      });

      it('should return empty string for object with neither persistedId nor runtimeId', () => {
        const id = {
          someOtherProperty: 'value',
        };
        expect(formatId(id)).toBe('');
      });

      it('should handle number input', () => {
        expect(formatId(123)).toBe('');
      });

      it('should handle boolean input', () => {
        expect(formatId(true)).toBe('');
        expect(formatId(false)).toBe('');
      });

      it('should handle array input', () => {
        expect(formatId([])).toBe('');
        expect(formatId(['id-123'])).toBe('');
      });

      it('should handle object with both IDs as empty strings', () => {
        const id = {
          persistedId: '',
          runtimeId: '',
        };
        expect(formatId(id)).toBe('');
      });

      it('should handle object with both IDs as null', () => {
        const id = {
          persistedId: null,
          runtimeId: null,
        };
        expect(formatId(id)).toBe('');
      });

      it('should handle nested object structure', () => {
        const id = {
          nested: {
            persistedId: 'nested-123',
          },
        };
        expect(formatId(id)).toBe('');
      });
    });

    describe('real-world scenarios', () => {
      it('should handle workflow ID from API response', () => {
        const workflowId = {
          persistedId: 'workflow-550e8400-e29b-41d4-a716-446655440000',
          runtimeId: null,
        };
        expect(formatId(workflowId)).toBe('workflow-550e8400-e29b-41d4-a716-446655440000');
      });

      it('should handle state ID from API response', () => {
        const stateId = {
          persistedId: null,
          runtimeId: 'state-runtime-123',
        };
        expect(formatId(stateId)).toBe('state-runtime-123');
      });

      it('should handle transition ID with both IDs present', () => {
        const transitionId = {
          persistedId: 'transition-persisted-123',
          runtimeId: 'transition-runtime-456',
        };
        expect(formatId(transitionId)).toBe('transition-persisted-123');
      });

      it('should handle simple string ID from form input', () => {
        const formId = 'new-workflow-123';
        expect(formatId(formId)).toBe('new-workflow-123');
      });
    });
  });

  describe('integration scenarios', () => {
    it('should work together: getPersistedType and isRuntime', () => {
      const persistedType1 = getPersistedType(true);
      expect(isRuntime(persistedType1)).toBe(false);

      const persistedType2 = getPersistedType(false);
      expect(isRuntime(persistedType2)).toBe(true);
    });

    it('should handle workflow lifecycle', () => {
      // New workflow (transient)
      const isTransient = false;
      const type = getPersistedType(isTransient);
      expect(type).toBe('transient');
      expect(isRuntime(type)).toBe(true);

      // Saved workflow (persisted)
      const isPersisted = true;
      const persistedType = getPersistedType(isPersisted);
      expect(persistedType).toBe('persisted');
      expect(isRuntime(persistedType)).toBe(false);
    });

    it('should format IDs based on persisted type', () => {
      const transientId = {
        persistedId: null,
        runtimeId: 'runtime-123',
      };
      const persistedId = {
        persistedId: 'persisted-456',
        runtimeId: 'runtime-123',
      };

      expect(formatId(transientId)).toBe('runtime-123');
      expect(formatId(persistedId)).toBe('persisted-456');
    });
  });
});

