/**
 * Charts Data Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useChartsDataStore } from './chartsDataStore';

describe('chartsDataStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useChartsDataStore.setState({
      rowsMap: new Map(),
      rowsArr: [],
    });
  });

  describe('Initial State', () => {
    it('should have empty rowsMap initially', () => {
      const { rowsMap } = useChartsDataStore.getState();
      expect(rowsMap.size).toBe(0);
    });

    it('should have empty rowsArr initially', () => {
      const { rowsArr } = useChartsDataStore.getState();
      expect(rowsArr).toEqual([]);
    });
  });

  describe('addChartRows', () => {
    it('should add rows to the store', () => {
      const { addChartRows } = useChartsDataStore.getState();
      const rows = [
        { id: '1', name: 'Row 1', value: 100 },
        { id: '2', name: 'Row 2', value: 200 },
      ];

      addChartRows(rows);

      const { rowsArr } = useChartsDataStore.getState();
      expect(rowsArr).toHaveLength(2);
      expect(rowsArr[0]).toEqual(rows[0]);
      expect(rowsArr[1]).toEqual(rows[1]);
    });

    it('should update existing rows with same id', () => {
      const { addChartRows } = useChartsDataStore.getState();
      
      // Add initial rows
      addChartRows([
        { id: '1', name: 'Row 1', value: 100 },
      ]);

      // Update row with same id
      addChartRows([
        { id: '1', name: 'Updated Row 1', value: 150 },
      ]);

      const { rowsArr } = useChartsDataStore.getState();
      expect(rowsArr).toHaveLength(1);
      expect(rowsArr[0].name).toBe('Updated Row 1');
      expect(rowsArr[0].value).toBe(150);
    });

    it('should handle adding multiple batches of rows', () => {
      const { addChartRows } = useChartsDataStore.getState();
      
      addChartRows([
        { id: '1', name: 'Row 1', value: 100 },
      ]);

      addChartRows([
        { id: '2', name: 'Row 2', value: 200 },
        { id: '3', name: 'Row 3', value: 300 },
      ]);

      const { rowsArr } = useChartsDataStore.getState();
      expect(rowsArr).toHaveLength(3);
    });

    it('should handle empty array', () => {
      const { addChartRows } = useChartsDataStore.getState();
      
      addChartRows([]);

      const { rowsArr } = useChartsDataStore.getState();
      expect(rowsArr).toHaveLength(0);
    });

    it('should preserve rowsMap when adding rows', () => {
      const { addChartRows } = useChartsDataStore.getState();
      const rows = [
        { id: '1', name: 'Row 1', value: 100 },
        { id: '2', name: 'Row 2', value: 200 },
      ];

      addChartRows(rows);

      const { rowsMap } = useChartsDataStore.getState();
      expect(rowsMap.size).toBe(2);
      expect(rowsMap.get('1')).toEqual(rows[0]);
      expect(rowsMap.get('2')).toEqual(rows[1]);
    });
  });

  describe('clearChartRows', () => {
    it('should clear all rows', () => {
      const { addChartRows, clearChartRows } = useChartsDataStore.getState();
      
      // Add some rows
      addChartRows([
        { id: '1', name: 'Row 1', value: 100 },
        { id: '2', name: 'Row 2', value: 200 },
      ]);

      // Clear rows
      clearChartRows();

      const { rowsArr, rowsMap } = useChartsDataStore.getState();
      expect(rowsArr).toHaveLength(0);
      expect(rowsMap.size).toBe(0);
    });

    it('should handle clearing empty store', () => {
      const { clearChartRows } = useChartsDataStore.getState();
      
      clearChartRows();

      const { rowsArr, rowsMap } = useChartsDataStore.getState();
      expect(rowsArr).toHaveLength(0);
      expect(rowsMap.size).toBe(0);
    });
  });

  describe('getChartRows', () => {
    it('should return current rows array', () => {
      const { addChartRows, getChartRows } = useChartsDataStore.getState();
      const rows = [
        { id: '1', name: 'Row 1', value: 100 },
        { id: '2', name: 'Row 2', value: 200 },
      ];

      addChartRows(rows);

      const chartRows = getChartRows();
      expect(chartRows).toHaveLength(2);
      expect(chartRows).toEqual(rows);
    });

    it('should return empty array when no rows', () => {
      const { getChartRows } = useChartsDataStore.getState();
      
      const chartRows = getChartRows();
      expect(chartRows).toEqual([]);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle adding, updating, and clearing rows', () => {
      const { addChartRows, clearChartRows, getChartRows } = useChartsDataStore.getState();
      
      // Add initial rows
      addChartRows([
        { id: '1', name: 'Row 1', value: 100 },
      ]);
      expect(getChartRows()).toHaveLength(1);

      // Update row
      addChartRows([
        { id: '1', name: 'Updated Row 1', value: 150 },
      ]);
      expect(getChartRows()).toHaveLength(1);
      expect(getChartRows()[0].value).toBe(150);

      // Add more rows
      addChartRows([
        { id: '2', name: 'Row 2', value: 200 },
      ]);
      expect(getChartRows()).toHaveLength(2);

      // Clear all
      clearChartRows();
      expect(getChartRows()).toHaveLength(0);
    });

    it('should handle rows with additional properties', () => {
      const { addChartRows, getChartRows } = useChartsDataStore.getState();
      
      addChartRows([
        { 
          id: '1', 
          name: 'Row 1', 
          value: 100,
          metadata: { created: '2025-10-16', author: 'test' },
          tags: ['tag1', 'tag2'],
        },
      ]);

      const rows = getChartRows();
      expect(rows[0].metadata).toEqual({ created: '2025-10-16', author: 'test' });
      expect(rows[0].tags).toEqual(['tag1', 'tag2']);
    });

    it('should maintain insertion order when adding rows', () => {
      const { addChartRows, getChartRows } = useChartsDataStore.getState();
      
      addChartRows([
        { id: '3', name: 'Row 3', value: 300 },
        { id: '1', name: 'Row 1', value: 100 },
        { id: '2', name: 'Row 2', value: 200 },
      ]);

      const rows = getChartRows();
      // Map maintains insertion order
      expect(rows[0].id).toBe('3');
      expect(rows[1].id).toBe('1');
      expect(rows[2].id).toBe('2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rows with null values', () => {
      const { addChartRows, getChartRows } = useChartsDataStore.getState();
      
      addChartRows([
        { id: '1', name: null, value: null },
      ]);

      const rows = getChartRows();
      expect(rows[0].name).toBeNull();
      expect(rows[0].value).toBeNull();
    });

    it('should handle rows with undefined values', () => {
      const { addChartRows, getChartRows } = useChartsDataStore.getState();
      
      addChartRows([
        { id: '1', name: undefined, value: undefined },
      ]);

      const rows = getChartRows();
      expect(rows[0].name).toBeUndefined();
      expect(rows[0].value).toBeUndefined();
    });

    it('should handle large number of rows', () => {
      const { addChartRows, getChartRows } = useChartsDataStore.getState();
      
      const largeRowSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        name: `Row ${i}`,
        value: i * 100,
      }));

      addChartRows(largeRowSet);

      const rows = getChartRows();
      expect(rows).toHaveLength(1000);
      expect(rows[0].id).toBe('0');
      expect(rows[999].id).toBe('999');
    });
  });
});

