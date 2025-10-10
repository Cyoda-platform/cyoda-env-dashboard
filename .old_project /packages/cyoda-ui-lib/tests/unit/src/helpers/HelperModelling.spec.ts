import { describe, it, expect } from 'vitest';
import HelperModelling from '../../../../src/helpers/HelperModelling';
import { ReportingInfoRow } from '../../../../src/types/types';

describe('HelperModelling', () => {
  describe('filterData', () => {
    it('should filter out rows with empty elementType or elementInfo', () => {
      const input: ReportingInfoRow[] = [
        { columnName: 'A', elementType: null, elementInfo: { columnPath: 'path1' } },
        { columnName: 'B', elementType: { columnPath: 'path2' }, elementInfo: null },
        { columnName: 'C', elementType: { columnPath: 'path3' }, elementInfo: { columnPath: 'path3' } },
      ];

      const result = HelperModelling.filterData(input);

      expect(result).toEqual([
        { columnName: 'C', elementType: { columnPath: 'path3' }, elementInfo: { columnPath: 'path3' } },
      ]);
    });

    it('should return an empty array if all rows are invalid', () => {
      const input: ReportingInfoRow[] = [
        { columnName: 'A', elementType: null, elementInfo: null },
      ];

      const result = HelperModelling.filterData(input);

      expect(result).toEqual([]);
    });
  });

  describe('sortData', () => {
    it('should sort rows by columnName in ascending order', () => {
      const input: ReportingInfoRow[] = [
        { columnName: 'B', elementType: { columnPath: 'path2' }, elementInfo: { columnPath: 'path2' } },
        { columnName: 'A', elementType: { columnPath: 'path1' }, elementInfo: { columnPath: 'path1' } },
        { columnName: 'C', elementType: { columnPath: 'path3' }, elementInfo: { columnPath: 'path3' } },
      ];

      const result = HelperModelling.sortData(input);

      expect(result).toEqual([
        { columnName: 'A', elementType: { columnPath: 'path1' }, elementInfo: { columnPath: 'path1' } },
        { columnName: 'B', elementType: { columnPath: 'path2' }, elementInfo: { columnPath: 'path2' } },
        { columnName: 'C', elementType: { columnPath: 'path3' }, elementInfo: { columnPath: 'path3' } },
      ]);
    });
  });

  describe('applyNameSpace', () => {
    it('should apply namespace to columnPath in all rows', () => {
      const input: ReportingInfoRow[] = [
        { columnName: 'A', columnPath: 'path1', elementType: { columnPath: 'path1' }, elementInfo: { columnPath: 'path1' } },
        { columnName: 'B', columnPath: 'path2', elementType: { columnPath: 'path2' }, elementInfo: { columnPath: 'path2' } },
      ];

      const namespace = 'namespace';

      const result = HelperModelling.applyNameSpace(input, namespace);

      expect(result).toEqual([
        {
          columnName: 'A',
          columnPath: 'namespace.path1',
          elementType: { columnPath: 'namespace.path1' },
          elementInfo: { columnPath: 'namespace.path1' },
        },
        {
          columnName: 'B',
          columnPath: 'namespace.path2',
          elementType: { columnPath: 'namespace.path2' },
          elementInfo: { columnPath: 'namespace.path2' },
        },
      ]);
    });

    it('should not modify columnPath if namespace is empty', () => {
      const input: ReportingInfoRow[] = [
        { columnName: 'A', columnPath: 'path1', elementType: { columnPath: 'path1' }, elementInfo: { columnPath: 'path1' } },
      ];

      const namespace = '';

      const result = HelperModelling.applyNameSpace(input, namespace);

      expect(result).toEqual(input);
    });
  });
});
