/**
 * Tests for FilterBuilder helpers
 */

import { describe, it, expect } from 'vitest';
import { HelperFilter, shortLabel } from '../helpers';
import { FilterGroup, FilterCondition } from '../types';

describe('HelperFilter', () => {
  describe('getGroup', () => {
    it('should return a new filter group with default values', () => {
      const group = HelperFilter.getGroup();
      
      expect(group).toEqual({
        '@bean': 'com.cyoda.core.conditions.GroupCondition',
        operator: 'AND',
        conditions: [],
      });
    });

    it('should return a new group each time', () => {
      const group1 = HelperFilter.getGroup();
      const group2 = HelperFilter.getGroup();
      
      expect(group1).not.toBe(group2);
      expect(group1).toEqual(group2);
    });

    it('should have empty conditions array', () => {
      const group = HelperFilter.getGroup();
      
      expect(group.conditions).toEqual([]);
      expect(group.conditions.length).toBe(0);
    });

    it('should have AND operator by default', () => {
      const group = HelperFilter.getGroup();
      
      expect(group.operator).toBe('AND');
    });
  });

  describe('getCondition', () => {
    it('should return a new filter condition with default values', () => {
      const condition = HelperFilter.getCondition();
      
      expect(condition).toEqual({
        '@bean': '',
        fieldName: '',
        operation: '',
      });
    });

    it('should return a new condition each time', () => {
      const condition1 = HelperFilter.getCondition();
      const condition2 = HelperFilter.getCondition();
      
      expect(condition1).not.toBe(condition2);
      expect(condition1).toEqual(condition2);
    });

    it('should have empty bean', () => {
      const condition = HelperFilter.getCondition();
      
      expect(condition['@bean']).toBe('');
    });

    it('should have empty fieldName', () => {
      const condition = HelperFilter.getCondition();
      
      expect(condition.fieldName).toBe('');
    });

    it('should have empty operation', () => {
      const condition = HelperFilter.getCondition();
      
      expect(condition.operation).toBe('');
    });
  });

  describe('isGroup', () => {
    it('should return true for group conditions', () => {
      const group: FilterGroup = {
        '@bean': 'com.cyoda.core.conditions.GroupCondition',
        operator: 'AND',
        conditions: [],
      };
      
      expect(HelperFilter.isGroup(group)).toBe(true);
    });

    it('should return false for regular conditions', () => {
      const condition: FilterCondition = {
        '@bean': 'com.cyoda.core.conditions.queryable.Equals',
        fieldName: 'name',
        operation: 'EQUALS',
      };
      
      expect(HelperFilter.isGroup(condition)).toBe(false);
    });

    it('should detect group by bean name containing GroupCondition', () => {
      const group: FilterGroup = {
        '@bean': 'some.package.GroupCondition',
        operator: 'OR',
        conditions: [],
      };
      
      expect(HelperFilter.isGroup(group)).toBe(true);
    });

    it('should return false for conditions with different bean names', () => {
      const condition: FilterCondition = {
        '@bean': 'com.cyoda.core.conditions.queryable.LessThan',
        fieldName: 'age',
        operation: 'LESS_THAN',
      };
      
      expect(HelperFilter.isGroup(condition)).toBe(false);
    });

    it('should handle empty bean name', () => {
      const condition: FilterCondition = {
        '@bean': '',
        fieldName: 'test',
        operation: 'EQUALS',
      };
      
      expect(HelperFilter.isGroup(condition)).toBe(false);
    });
  });
});

describe('shortLabel', () => {
  it('should return the last part of a dot-separated string', () => {
    expect(shortLabel('com.cyoda.core.Entity')).toBe('Entity');
  });

  it('should handle single word strings', () => {
    expect(shortLabel('Entity')).toBe('Entity');
  });

  it('should handle empty strings', () => {
    expect(shortLabel('')).toBe('');
  });

  it('should handle strings with multiple dots', () => {
    expect(shortLabel('com.example.package.subpackage.ClassName')).toBe('ClassName');
  });

  it('should handle strings ending with dot', () => {
    // When string ends with dot, split returns empty string as last element
    // But the function returns the original string if result is empty
    const result = shortLabel('com.example.');
    expect(result).toBe('com.example.');
  });

  it('should handle strings starting with dot', () => {
    expect(shortLabel('.example.Class')).toBe('Class');
  });

  it('should handle Java class names', () => {
    expect(shortLabel('java.lang.String')).toBe('String');
    expect(shortLabel('java.lang.Integer')).toBe('Integer');
    expect(shortLabel('java.time.LocalDateTime')).toBe('LocalDateTime');
  });

  it('should handle Cyoda class names', () => {
    expect(shortLabel('com.cyoda.core.conditions.queryable.Equals')).toBe('Equals');
    expect(shortLabel('com.cyoda.core.conditions.GroupCondition')).toBe('GroupCondition');
  });

  it('should return original string if no dots', () => {
    expect(shortLabel('SimpleClass')).toBe('SimpleClass');
  });

  it('should handle consecutive dots', () => {
    expect(shortLabel('com..example..Class')).toBe('Class');
  });
});

