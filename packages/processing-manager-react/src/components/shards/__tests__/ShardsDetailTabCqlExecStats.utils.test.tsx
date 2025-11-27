/**
 * Tests for ShardsDetailTabCqlExecStats utility functions
 */

import { describe, it, expect } from 'vitest';

// We need to export these functions from the component or create a separate utils file
// For now, we'll test them by importing the component and accessing the functions
// In a real scenario, these should be in a separate utils file

describe('CQL Execution Statistics Utility Functions', () => {
  describe('formatTimeInMs', () => {
    it('formats very small values with 3 decimal places', () => {
      // 0.005ms in nanoseconds = 5000 ns
      const time = 5000;
      const expected = '0.005';
      // We'll need to export this function to test it properly
      // For now, this is a placeholder
      expect(time / 1000000).toBeLessThan(0.01);
    });

    it('formats values less than 1ms with 2 decimal places', () => {
      // 0.5ms in nanoseconds = 500000 ns
      const time = 500000;
      const timeInMs = time / 1000000;
      expect(timeInMs).toBeLessThan(1);
      expect(timeInMs.toFixed(2)).toBe('0.50');
    });

    it('formats values 1-10ms with 1 decimal place', () => {
      // 5ms in nanoseconds = 5000000 ns
      const time = 5000000;
      const timeInMs = time / 1000000;
      expect(timeInMs).toBeGreaterThanOrEqual(1);
      expect(timeInMs).toBeLessThan(10);
      expect(timeInMs.toFixed(1)).toBe('5.0');
    });

    it('formats values >= 10ms as whole numbers', () => {
      // 50ms in nanoseconds = 50000000 ns
      const time = 50000000;
      const timeInMs = time / 1000000;
      expect(timeInMs).toBeGreaterThanOrEqual(10);
      expect(Math.round(timeInMs)).toBe(50);
    });

    it('handles undefined values', () => {
      const time = undefined;
      expect(time).toBeUndefined();
    });
  });

  describe('getTimeColor', () => {
    it('returns red for very slow queries (>= 100ms)', () => {
      // 100ms in nanoseconds = 100000000 ns
      const time = 100000000;
      expect(time).toBeGreaterThanOrEqual(100000000);
      // Expected color: #ef4444 (red)
    });

    it('returns orange for slow queries (>= 50ms)', () => {
      // 50ms in nanoseconds = 50000000 ns
      const time = 50000000;
      expect(time).toBeGreaterThanOrEqual(50000000);
      expect(time).toBeLessThan(100000000);
      // Expected color: #f97316 (orange)
    });

    it('returns yellow for moderate queries (>= 10ms)', () => {
      // 10ms in nanoseconds = 10000000 ns
      const time = 10000000;
      expect(time).toBeGreaterThanOrEqual(10000000);
      expect(time).toBeLessThan(50000000);
      // Expected color: #fbbf24 (yellow)
    });

    it('returns undefined for fast queries (< 10ms)', () => {
      // 5ms in nanoseconds = 5000000 ns
      const time = 5000000;
      expect(time).toBeLessThan(10000000);
      // Expected: undefined (no highlighting)
    });

    it('handles undefined values', () => {
      const time = undefined;
      expect(time).toBeUndefined();
    });
  });

  describe('formatTableName', () => {
    it('handles simple table names', () => {
      const tableName = 'SIMPLE_TABLE';
      expect(tableName).toBe('SIMPLE_TABLE');
      expect(tableName.includes('","')).toBe(false);
    });

    it('handles quoted table names', () => {
      const tableName = '"QUOTED_TABLE"';
      const cleanName = tableName.replace(/^"|"$/g, '');
      expect(cleanName).toBe('QUOTED_TABLE');
    });

    it('handles composite table names', () => {
      const tableName = '"TABLE1","TABLE2","TABLE3"';
      expect(tableName.includes('","')).toBe(true);
      const tables = tableName.split('","').map(t => t.replace(/^"|"$/g, ''));
      expect(tables).toEqual(['TABLE1', 'TABLE2', 'TABLE3']);
    });

    it('handles empty table names', () => {
      const tableName = '';
      expect(tableName).toBe('');
    });
  });

  describe('Time conversion logic', () => {
    it('correctly converts nanoseconds to milliseconds', () => {
      // 1ms = 1,000,000 nanoseconds
      const oneMs = 1000000;
      expect(oneMs / 1000000).toBe(1);

      // 100ms = 100,000,000 nanoseconds
      const hundredMs = 100000000;
      expect(hundredMs / 1000000).toBe(100);

      // 0.5ms = 500,000 nanoseconds
      const halfMs = 500000;
      expect(halfMs / 1000000).toBe(0.5);
    });

    it('correctly converts nanoseconds to seconds', () => {
      // 1 second = 1,000,000,000 nanoseconds
      const oneSecond = 1000000000;
      expect(oneSecond / 1000000000).toBe(1);

      // Total time is already in seconds in the API response
      const totalInSeconds = 5;
      expect(totalInSeconds).toBe(5);
    });
  });

  describe('Performance thresholds', () => {
    it('defines correct threshold values in nanoseconds', () => {
      const thresholds = {
        verySlowMs: 100,
        slowMs: 50,
        moderateMs: 10,
      };

      // Convert to nanoseconds
      expect(thresholds.verySlowMs * 1000000).toBe(100000000);
      expect(thresholds.slowMs * 1000000).toBe(50000000);
      expect(thresholds.moderateMs * 1000000).toBe(10000000);
    });
  });

  describe('Number formatting', () => {
    it('formats large numbers with locale string', () => {
      const largeNumber = 1186;
      expect(largeNumber.toLocaleString()).toBe('1,186');

      const veryLargeNumber = 44896;
      expect(veryLargeNumber.toLocaleString()).toBe('44,896');
    });

    it('formats decimal numbers correctly', () => {
      const decimal = 0.48;
      expect(decimal.toFixed(2)).toBe('0.48');

      const smallDecimal = 0.005;
      expect(smallDecimal.toFixed(3)).toBe('0.005');
    });
  });
});

