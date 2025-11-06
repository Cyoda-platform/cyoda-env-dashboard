/**
 * HelperModelling Tests
 */

import { describe, it, expect } from 'vitest';
import HelperModelling from './HelperModelling';
import type { ReportingInfoRow } from '../types';

describe('HelperModelling', () => {
  describe('filterData', () => {
    it('should filter out rows with empty elementType', () => {
      const data: ReportingInfoRow[] = [
        { columnName: 'id', columnPath: 'id', columnType: 'STRING', elementType: 'STRING' },
        { columnName: 'name', columnPath: 'name', columnType: 'STRING', elementType: '' },
        { columnName: 'age', columnPath: 'age', columnType: 'INTEGER', elementType: 'INTEGER' },
      ];
      
      const filtered = HelperModelling.filterData(data);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(r => r.columnName)).toEqual(['id', 'age']);
    });

    it('should filter out rows with empty elementInfo', () => {
      const data: ReportingInfoRow[] = [
        { columnName: 'id', columnPath: 'id', columnType: 'STRING', elementInfo: 'info' },
        { columnName: 'name', columnPath: 'name', columnType: 'STRING', elementInfo: '' },
        { columnName: 'age', columnPath: 'age', columnType: 'INTEGER', elementInfo: 'info' },
      ];
      
      const filtered = HelperModelling.filterData(data);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(r => r.columnName)).toEqual(['id', 'age']);
    });

    it('should keep rows without elementType or elementInfo fields', () => {
      const data: ReportingInfoRow[] = [
        { columnName: 'id', columnPath: 'id', columnType: 'STRING' },
        { columnName: 'name', columnPath: 'name', columnType: 'STRING' },
      ];
      
      const filtered = HelperModelling.filterData(data);
      
      expect(filtered).toHaveLength(2);
    });

    it('should handle empty array', () => {
      const filtered = HelperModelling.filterData([]);
      expect(filtered).toEqual([]);
    });
  });

  describe('sortData', () => {
    it('should sort rows alphabetically by columnName', () => {
      const data: ReportingInfoRow[] = [
        { columnName: 'zebra', columnPath: 'zebra', columnType: 'STRING' },
        { columnName: 'apple', columnPath: 'apple', columnType: 'STRING' },
        { columnName: 'mango', columnPath: 'mango', columnType: 'STRING' },
      ];
      
      const sorted = HelperModelling.sortData(data);
      
      expect(sorted.map(r => r.columnName)).toEqual(['apple', 'mango', 'zebra']);
    });

    it('should handle already sorted data', () => {
      const data: ReportingInfoRow[] = [
        { columnName: 'apple', columnPath: 'apple', columnType: 'STRING' },
        { columnName: 'mango', columnPath: 'mango', columnType: 'STRING' },
        { columnName: 'zebra', columnPath: 'zebra', columnType: 'STRING' },
      ];
      
      const sorted = HelperModelling.sortData(data);
      
      expect(sorted.map(r => r.columnName)).toEqual(['apple', 'mango', 'zebra']);
    });

    it('should handle empty array', () => {
      const sorted = HelperModelling.sortData([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single item', () => {
      const data: ReportingInfoRow[] = [
        { columnName: 'single', columnPath: 'single', columnType: 'STRING' },
      ];
      
      const sorted = HelperModelling.sortData(data);
      
      expect(sorted).toHaveLength(1);
      expect(sorted[0].columnName).toBe('single');
    });
  });
});

