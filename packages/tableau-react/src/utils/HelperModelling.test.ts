/**
 * Tests for HelperModelling Utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HelperModelling from './HelperModelling';
import type { ReportingInfoRow } from '../types/modelling';

describe('HelperModelling', () => {
  describe('Constants', () => {
    it('should have correct regex patterns', () => {
      expect(HelperModelling.REGEX_SOURCE).toEqual(/\//);
      expect(HelperModelling.REGEX_TARGET).toEqual(/@|\./);
    });

    it('should have correct notPrimitiveList', () => {
      expect(HelperModelling.notPrimitiveList).toEqual(['EMBEDDED', 'LIST', 'MAP']);
    });
  });

  describe('filterData', () => {
    let consoleWarnSpy: any;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('should filter out rows with empty elementType', () => {
      const data: ReportingInfoRow[] = [
        { columnName: 'field1', columnPath: 'path1', type: 'LEAF', elementType: null } as any,
        { columnName: 'field2', columnPath: 'path2', type: 'LEAF', elementType: { type: 'LEAF' } } as any,
      ];

      const result = HelperModelling.filterData(data);

      expect(result).toHaveLength(1);
      expect(result[0].columnName).toBe('field2');
    });

    it('should filter out rows with empty elementInfo', () => {
      const data: ReportingInfoRow[] = [
        { columnName: 'field1', columnPath: 'path1', type: 'LIST', elementInfo: null } as any,
        { columnName: 'field2', columnPath: 'path2', type: 'LIST', elementInfo: { type: 'LEAF' } } as any,
      ];

      const result = HelperModelling.filterData(data);

      expect(result).toHaveLength(1);
      expect(result[0].columnName).toBe('field2');
    });

    it('should keep rows without elementType or elementInfo', () => {
      const data: ReportingInfoRow[] = [
        { columnName: 'field1', columnPath: 'path1', type: 'LEAF' } as any,
      ];

      const result = HelperModelling.filterData(data);

      expect(result).toHaveLength(1);
    });

    it('should return empty array for non-array input', () => {
      const result = HelperModelling.filterData('not an array' as any);

      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('sortData', () => {
    let consoleWarnSpy: any;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('should sort data by columnName alphabetically', () => {
      const data: ReportingInfoRow[] = [
        { columnName: 'zebra', columnPath: 'path1', type: 'LEAF' } as any,
        { columnName: 'apple', columnPath: 'path2', type: 'LEAF' } as any,
        { columnName: 'banana', columnPath: 'path3', type: 'LEAF' } as any,
      ];

      const result = HelperModelling.sortData(data);

      expect(result[0].columnName).toBe('apple');
      expect(result[1].columnName).toBe('banana');
      expect(result[2].columnName).toBe('zebra');
    });

    it('should return empty array for non-array input', () => {
      const result = HelperModelling.sortData(null as any);

      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('applyNameSpace', () => {
    it('should apply namespace to columnPath', () => {
      const rows: ReportingInfoRow[] = [
        { columnName: 'field1', columnPath: 'path1', type: 'LEAF' } as any,
      ];

      const result = HelperModelling.applyNameSpace(rows, 'namespace');

      expect(result[0].columnPath).toBe('namespace.path1');
    });

    it('should apply namespace to elementInfo.columnPath', () => {
      const rows: ReportingInfoRow[] = [
        {
          columnName: 'field1',
          columnPath: 'path1',
          type: 'LIST',
          elementInfo: { columnPath: 'elementPath', type: 'LEAF' } as any,
        } as any,
      ];

      const result = HelperModelling.applyNameSpace(rows, 'namespace');

      expect(result[0].elementInfo!.columnPath).toBe('namespace.elementPath');
    });

    it('should apply namespace to elementType.columnPath', () => {
      const rows: ReportingInfoRow[] = [
        {
          columnName: 'field1',
          columnPath: 'path1',
          type: 'MAP',
          elementType: { columnPath: 'elementPath', type: 'LEAF' } as any,
        } as any,
      ];

      const result = HelperModelling.applyNameSpace(rows, 'namespace');

      expect(result[0].elementType!.columnPath).toBe('namespace.elementPath');
    });

    it('should not modify paths when namespace is empty', () => {
      const rows: ReportingInfoRow[] = [
        { columnName: 'field1', columnPath: 'path1', type: 'LEAF' } as any,
      ];

      const result = HelperModelling.applyNameSpace(rows, '');

      expect(result[0].columnPath).toBe('path1');
    });
  });

  describe('rowCanBeSelected', () => {
    it('should return true for LEAF type', () => {
      const row: ReportingInfoRow = {
        columnName: 'field1',
        columnPath: 'path1',
        type: 'LEAF',
      } as any;

      expect(HelperModelling.rowCanBeSelected(row)).toBe(true);
    });

    it('should return true for elementInfo with LEAF type', () => {
      const row: ReportingInfoRow = {
        columnName: 'field1',
        columnPath: 'path1',
        type: 'LIST',
        elementInfo: { type: 'LEAF' } as any,
      } as any;

      expect(HelperModelling.rowCanBeSelected(row)).toBe(true);
    });

    it('should return true for elementType with LEAF type', () => {
      const row: ReportingInfoRow = {
        columnName: 'field1',
        columnPath: 'path1',
        type: 'MAP',
        elementType: { type: 'LEAF' } as any,
      } as any;

      expect(HelperModelling.rowCanBeSelected(row)).toBe(true);
    });

    it('should return false for non-LEAF types', () => {
      const row: ReportingInfoRow = {
        columnName: 'field1',
        columnPath: 'path1',
        type: 'EMBEDDED',
      } as any;

      expect(HelperModelling.rowCanBeSelected(row)).toBe(false);
    });
  });

  describe('isChildAvailable', () => {
    it('should return true for EMBEDDED type', () => {
      const row: ReportingInfoRow = {
        columnName: 'field1',
        columnPath: 'path1',
        type: 'EMBEDDED',
      } as any;

      expect(HelperModelling.isChildAvailable(row)).toBe(true);
    });

    it('should return true for LIST type', () => {
      const row: ReportingInfoRow = {
        columnName: 'field1',
        columnPath: 'path1',
        type: 'LIST',
      } as any;

      expect(HelperModelling.isChildAvailable(row)).toBe(true);
    });

    it('should return true for MAP type', () => {
      const row: ReportingInfoRow = {
        columnName: 'field1',
        columnPath: 'path1',
        type: 'MAP',
      } as any;

      expect(HelperModelling.isChildAvailable(row)).toBe(true);
    });

    it('should return false for LEAF type', () => {
      const row: ReportingInfoRow = {
        columnName: 'field1',
        columnPath: 'path1',
        type: 'LEAF',
      } as any;

      expect(HelperModelling.isChildAvailable(row)).toBe(false);
    });
  });

  describe('isJoinAvailable', () => {
    it('should return true when joinInfo exists', () => {
      const row: ReportingInfoRow = {
        columnName: 'field1',
        columnPath: 'path1',
        type: 'LEAF',
        joinInfo: { targetClass: 'com.test.Target' } as any,
      } as any;

      expect(HelperModelling.isJoinAvailable(row)).toBe(true);
    });

    it('should return false when joinInfo is null', () => {
      const row: ReportingInfoRow = {
        columnName: 'field1',
        columnPath: 'path1',
        type: 'LEAF',
        joinInfo: null,
      } as any;

      expect(HelperModelling.isJoinAvailable(row)).toBe(false);
    });

    it('should return false when joinInfo is undefined', () => {
      const row: ReportingInfoRow = {
        columnName: 'field1',
        columnPath: 'path1',
        type: 'LEAF',
      } as any;

      expect(HelperModelling.isJoinAvailable(row)).toBe(false);
    });
  });

  describe('getLabel', () => {
    it('should return columnName when no parent', () => {
      const row: ReportingInfoRow = {
        columnName: 'field1',
        columnPath: 'path1',
        type: 'LEAF',
      } as any;

      expect(HelperModelling.getLabel(row)).toBe('field1');
    });

    it('should return combined label with parent', () => {
      const row: ReportingInfoRow = {
        columnName: 'field1',
        columnPath: 'path1',
        type: 'LEAF',
      } as any;

      expect(HelperModelling.getLabel(row, 'parent')).toBe('parent.field1');
    });
  });

  describe('getFullPath', () => {
    it('should return columnPath', () => {
      const row: ReportingInfoRow = {
        columnName: 'field1',
        columnPath: 'full.path.to.field',
        type: 'LEAF',
      } as any;

      expect(HelperModelling.getFullPath(row)).toBe('full.path.to.field');
    });
  });

  describe('isChecked', () => {
    it('should return true when path is in checked array', () => {
      const checked = [
        { fullPath: 'path1' },
        { fullPath: 'path2' },
      ];

      expect(HelperModelling.isChecked(checked, 'path1')).toBe(true);
    });

    it('should return false when path is not in checked array', () => {
      const checked = [
        { fullPath: 'path1' },
        { fullPath: 'path2' },
      ];

      expect(HelperModelling.isChecked(checked, 'path3')).toBe(false);
    });
  });

  describe('formatClassName', () => {
    it('should return short class name', () => {
      expect(HelperModelling.formatClassName('com.cyoda.tdb.model.Customer')).toBe('Customer');
    });

    it('should handle single part name', () => {
      expect(HelperModelling.formatClassName('Customer')).toBe('Customer');
    });
  });

  describe('matchesSearch', () => {
    it('should return true when search is empty', () => {
      expect(HelperModelling.matchesSearch('any.path', '')).toBe(true);
    });

    it('should return true when path contains search term', () => {
      expect(HelperModelling.matchesSearch('user.name', 'name')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(HelperModelling.matchesSearch('user.NAME', 'name')).toBe(true);
      expect(HelperModelling.matchesSearch('user.name', 'NAME')).toBe(true);
    });

    it('should return false when path does not contain search term', () => {
      expect(HelperModelling.matchesSearch('user.email', 'name')).toBe(false);
    });
  });
});

