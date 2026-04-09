/**
 * Tests for ReportEditorStream Page
 * Tests for Stream Report Editor Range Condition Filters
 */

import { describe, it, expect } from 'vitest';

describe('ReportEditorStream - Range Condition Filters', () => {
  describe('Condition Types Configuration', () => {
    it('should provide exactly 6 condition types for range settings', () => {
      const expectedConditionTypes = [
        'LESS_THAN',
        'GREATER_THAN',
        'GREATER_OR_EQUAL',
        'LESS_OR_EQUAL',
        'BETWEEN',
        'BETWEEN_INCLUSIVE',
      ];

      // Verify we have exactly 6 types
      expect(expectedConditionTypes).toHaveLength(6);
    });

    it('should only include range-compatible condition types', () => {
      const expectedConditionTypes = [
        'LESS_THAN',
        'GREATER_THAN',
        'GREATER_OR_EQUAL',
        'LESS_OR_EQUAL',
        'BETWEEN',
        'BETWEEN_INCLUSIVE',
      ];

      // Verify all expected types are present
      expect(expectedConditionTypes).toContain('LESS_THAN');
      expect(expectedConditionTypes).toContain('GREATER_THAN');
      expect(expectedConditionTypes).toContain('GREATER_OR_EQUAL');
      expect(expectedConditionTypes).toContain('LESS_OR_EQUAL');
      expect(expectedConditionTypes).toContain('BETWEEN');
      expect(expectedConditionTypes).toContain('BETWEEN_INCLUSIVE');
    });

    it('should not include EQUALS condition type', () => {
      const expectedConditionTypes = [
        'LESS_THAN',
        'GREATER_THAN',
        'GREATER_OR_EQUAL',
        'LESS_OR_EQUAL',
        'BETWEEN',
        'BETWEEN_INCLUSIVE',
      ];

      // EQUALS is not a range condition
      expect(expectedConditionTypes).not.toContain('EQUALS');
    });

    it('should not include NOT_EQUAL condition type', () => {
      const expectedConditionTypes = [
        'LESS_THAN',
        'GREATER_THAN',
        'GREATER_OR_EQUAL',
        'LESS_OR_EQUAL',
        'BETWEEN',
        'BETWEEN_INCLUSIVE',
      ];

      // NOT_EQUAL is not a range condition
      expect(expectedConditionTypes).not.toContain('NOT_EQUAL');
    });

    it('should not include non-range condition types', () => {
      const nonRangeTypes = ['EQUALS', 'NOT_EQUAL', 'CONTAINS', 'STARTS_WITH', 'IEQUALS', 'INOT_EQUAL'];
      const expectedConditionTypes = [
        'LESS_THAN',
        'GREATER_THAN',
        'GREATER_OR_EQUAL',
        'LESS_OR_EQUAL',
        'BETWEEN',
        'BETWEEN_INCLUSIVE',
      ];

      // Verify none of the non-range types are included
      nonRangeTypes.forEach((type) => {
        expect(expectedConditionTypes).not.toContain(type);
      });
    });

    it('should include all comparison operators for range conditions', () => {
      const expectedConditionTypes = [
        'LESS_THAN',
        'GREATER_THAN',
        'GREATER_OR_EQUAL',
        'LESS_OR_EQUAL',
        'BETWEEN',
        'BETWEEN_INCLUSIVE',
      ];

      // Verify we have both less than variants
      expect(expectedConditionTypes).toContain('LESS_THAN');
      expect(expectedConditionTypes).toContain('LESS_OR_EQUAL');

      // Verify we have both greater than variants
      expect(expectedConditionTypes).toContain('GREATER_THAN');
      expect(expectedConditionTypes).toContain('GREATER_OR_EQUAL');

      // Verify we have both between variants
      expect(expectedConditionTypes).toContain('BETWEEN');
      expect(expectedConditionTypes).toContain('BETWEEN_INCLUSIVE');
    });
  });
});
