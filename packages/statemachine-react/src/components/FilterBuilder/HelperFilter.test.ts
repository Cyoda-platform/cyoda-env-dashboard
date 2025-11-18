/**
 * HelperFilter Tests
 * Tests for the FilterBuilder helper class
 */

import { describe, it, expect } from 'vitest';
import HelperFilter, { type Condition, type GroupCondition } from './HelperFilter';

describe('HelperFilter', () => {
  describe('getCondition', () => {
    it('should return a new empty condition', () => {
      const condition = HelperFilter.getCondition();
      
      expect(condition).toEqual({
        '@bean': '',
        fieldName: '',
        operation: '',
        value: {
          '@type': '',
          value: '',
        },
      });
    });

    it('should return a new instance each time', () => {
      const condition1 = HelperFilter.getCondition();
      const condition2 = HelperFilter.getCondition();
      
      expect(condition1).not.toBe(condition2);
      expect(condition1.value).not.toBe(condition2.value);
    });

    it('should have correct structure', () => {
      const condition = HelperFilter.getCondition();
      
      expect(condition).toHaveProperty('@bean');
      expect(condition).toHaveProperty('fieldName');
      expect(condition).toHaveProperty('operation');
      expect(condition).toHaveProperty('value');
      expect(condition.value).toHaveProperty('@type');
      expect(condition.value).toHaveProperty('value');
    });

    it('should not have from or to properties by default', () => {
      const condition = HelperFilter.getCondition();
      
      expect(condition).not.toHaveProperty('from');
      expect(condition).not.toHaveProperty('to');
    });
  });

  describe('getGroup', () => {
    it('should return a new group condition with default operator AND', () => {
      const group = HelperFilter.getGroup();
      
      expect(group['@bean']).toBe('com.cyoda.core.conditions.GroupCondition');
      expect(group.operator).toBe('AND');
      expect(group.conditions).toHaveLength(1);
    });

    it('should include one empty condition by default', () => {
      const group = HelperFilter.getGroup();
      
      expect(group.conditions).toHaveLength(1);
      expect(group.conditions[0]).toEqual({
        '@bean': '',
        fieldName: '',
        operation: '',
        value: {
          '@type': '',
          value: '',
        },
      });
    });

    it('should return a new instance each time', () => {
      const group1 = HelperFilter.getGroup();
      const group2 = HelperFilter.getGroup();
      
      expect(group1).not.toBe(group2);
      expect(group1.conditions).not.toBe(group2.conditions);
    });

    it('should have correct structure', () => {
      const group = HelperFilter.getGroup();
      
      expect(group).toHaveProperty('@bean');
      expect(group).toHaveProperty('operator');
      expect(group).toHaveProperty('conditions');
      expect(Array.isArray(group.conditions)).toBe(true);
    });

    it('should have GroupCondition bean type', () => {
      const group = HelperFilter.getGroup();
      
      expect(group['@bean']).toBe('com.cyoda.core.conditions.GroupCondition');
    });
  });

  describe('isGroupCondition', () => {
    it('should return true for a group condition', () => {
      const group = HelperFilter.getGroup();
      
      expect(HelperFilter.isGroupCondition(group)).toBe(true);
    });

    it('should return false for a regular condition', () => {
      const condition = HelperFilter.getCondition();
      
      expect(HelperFilter.isGroupCondition(condition)).toBe(false);
    });

    it('should return falsy for null', () => {
      expect(HelperFilter.isGroupCondition(null)).toBeFalsy();
    });

    it('should return falsy for undefined', () => {
      expect(HelperFilter.isGroupCondition(undefined)).toBeFalsy();
    });

    it('should return false for empty object', () => {
      expect(HelperFilter.isGroupCondition({})).toBe(false);
    });

    it('should return false for object with different @bean', () => {
      const obj = {
        '@bean': 'com.cyoda.core.conditions.SomeOtherCondition',
        operator: 'AND',
        conditions: [],
      };
      
      expect(HelperFilter.isGroupCondition(obj)).toBe(false);
    });

    it('should return true for manually created group condition', () => {
      const group: GroupCondition = {
        '@bean': 'com.cyoda.core.conditions.GroupCondition',
        operator: 'OR',
        conditions: [],
      };
      
      expect(HelperFilter.isGroupCondition(group)).toBe(true);
    });

    it('should work with nested group conditions', () => {
      const nestedGroup: GroupCondition = {
        '@bean': 'com.cyoda.core.conditions.GroupCondition',
        operator: 'AND',
        conditions: [
          HelperFilter.getCondition(),
          HelperFilter.getGroup(),
        ],
      };
      
      expect(HelperFilter.isGroupCondition(nestedGroup)).toBe(true);
      expect(HelperFilter.isGroupCondition(nestedGroup.conditions[0])).toBe(false);
      expect(HelperFilter.isGroupCondition(nestedGroup.conditions[1])).toBe(true);
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify condition type', () => {
      const condition = HelperFilter.getCondition();
      
      if (!HelperFilter.isGroupCondition(condition)) {
        // TypeScript should know this is a Condition
        expect(condition.fieldName).toBeDefined();
        expect(condition.operation).toBeDefined();
      }
    });

    it('should correctly identify group type', () => {
      const group = HelperFilter.getGroup();
      
      if (HelperFilter.isGroupCondition(group)) {
        // TypeScript should know this is a GroupCondition
        expect(group.operator).toBeDefined();
        expect(group.conditions).toBeDefined();
      }
    });
  });

  describe('Complex Scenarios', () => {
    it('should create nested group structure', () => {
      const rootGroup = HelperFilter.getGroup();
      const nestedGroup = HelperFilter.getGroup();
      
      rootGroup.conditions.push(nestedGroup);
      
      expect(rootGroup.conditions).toHaveLength(2);
      expect(HelperFilter.isGroupCondition(rootGroup.conditions[0])).toBe(false);
      expect(HelperFilter.isGroupCondition(rootGroup.conditions[1])).toBe(true);
    });

    it('should create complex filter with multiple conditions', () => {
      const group = HelperFilter.getGroup();
      
      // Add more conditions
      group.conditions.push(HelperFilter.getCondition());
      group.conditions.push(HelperFilter.getCondition());
      
      expect(group.conditions).toHaveLength(3);
      group.conditions.forEach((condition) => {
        expect(HelperFilter.isGroupCondition(condition)).toBe(false);
      });
    });

    it('should support OR operator', () => {
      const group = HelperFilter.getGroup();
      group.operator = 'OR';
      
      expect(group.operator).toBe('OR');
      expect(HelperFilter.isGroupCondition(group)).toBe(true);
    });

    it('should create condition with range values', () => {
      const condition: Condition = {
        ...HelperFilter.getCondition(),
        '@bean': 'com.cyoda.core.conditions.queryable.Between',
        fieldName: 'age',
        operation: 'BETWEEN',
        from: {
          '@type': 'Integer',
          value: 18,
        },
        to: {
          '@type': 'Integer',
          value: 65,
        },
      };
      
      expect(condition.from).toBeDefined();
      expect(condition.to).toBeDefined();
      expect(condition.from?.value).toBe(18);
      expect(condition.to?.value).toBe(65);
    });

    it('should create deeply nested group structure', () => {
      const level1 = HelperFilter.getGroup();
      const level2 = HelperFilter.getGroup();
      const level3 = HelperFilter.getGroup();
      
      level2.conditions.push(level3);
      level1.conditions.push(level2);
      
      expect(HelperFilter.isGroupCondition(level1)).toBe(true);
      expect(HelperFilter.isGroupCondition(level1.conditions[1])).toBe(true);
      
      const level2Group = level1.conditions[1] as GroupCondition;
      expect(HelperFilter.isGroupCondition(level2Group.conditions[1])).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty conditions array in group', () => {
      const group = HelperFilter.getGroup();
      group.conditions = [];
      
      expect(group.conditions).toHaveLength(0);
      expect(HelperFilter.isGroupCondition(group)).toBe(true);
    });

    it('should handle condition with all optional fields', () => {
      const condition: Condition = {
        '@bean': 'com.cyoda.core.conditions.queryable.Between',
        fieldName: 'date',
        operation: 'BETWEEN',
        value: {
          '@type': 'String',
          value: 'test',
        },
        from: {
          '@type': 'LocalDate',
          value: '2024-01-01',
        },
        to: {
          '@type': 'LocalDate',
          value: '2024-12-31',
        },
      };
      
      expect(condition.value).toBeDefined();
      expect(condition.from).toBeDefined();
      expect(condition.to).toBeDefined();
    });
  });
});

