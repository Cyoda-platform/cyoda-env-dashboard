import { describe, it, expect, vi } from 'vitest';
import HelperFormat from '../../../../src/helpers/HelperFormat';
import HelperDetailEntity from '../../../../src/helpers/HelperDetailEntity';
import { Entity } from '../../../../src/types/types';

vi.mock('../../../../src/helpers/HelperFormat', () => ({
  default: {
    isShortDetailTreeItem: vi.fn(),
  },
}));

describe('HelperDetailEntity', () => {
  describe('filterData', () => {
    it('should filter out entities without presented property or with presented set to false', () => {
      const datas: Entity[] = [
        { type: 'LEAF', value: 'A', presented: true },
        { type: 'LEAF', value: 'B', presented: false },
        { type: 'LEAF', value: 'C' },
      ];

      vi.mocked(HelperFormat.isShortDetailTreeItem).mockImplementation(() => true);

      const result = HelperDetailEntity.filterData(datas);

      expect(result).toEqual([
        { type: 'LEAF', value: 'A', presented: true },
        { type: 'LEAF', value: 'C' },
      ]);
    });

    it('should apply sorting after filtering', () => {
      const datas: Entity[] = [
        { type: 'LEAF', value: 'A', presented: true },
        { type: 'LEAF', value: 'B', presented: true },
        { type: 'BRANCH', value: 'C', presented: true },
      ];

      vi.mocked(HelperFormat.isShortDetailTreeItem)
        .mockImplementation((value) => value === 'A');

      const result = HelperDetailEntity.filterData(datas);

      expect(result).toEqual([
        { type: 'LEAF', value: 'A', presented: true },
        { type: 'LEAF', value: 'B', presented: true },
        { type: 'BRANCH', value: 'C', presented: true },
      ]);
    });
  });

  describe('applySorting', () => {
    it('should sort entities with LEAF types having short values first', () => {
      const data: Entity[] = [
        { type: 'LEAF', value: 'A' },
        { type: 'LEAF', value: 'B' },
        { type: 'BRANCH', value: 'C' },
      ];

      vi.mocked(HelperFormat.isShortDetailTreeItem)
        .mockImplementation((value) => value === 'A');

      const result = HelperDetailEntity.applySorting(data);

      expect(result).toEqual([
        { type: 'LEAF', value: 'A' },
        { type: 'LEAF', value: 'B' },
        { type: 'BRANCH', value: 'C' },
      ]);
    });

    it('should preserve non-LEAF entities in their original order', () => {
      const data: Entity[] = [
        { type: 'BRANCH', value: 'D' },
        { type: 'LEAF', value: 'B' },
        { type: 'LEAF', value: 'A' },
      ];

      vi.mocked(HelperFormat.isShortDetailTreeItem)
        .mockImplementation((value) => value === 'A');

      const result = HelperDetailEntity.applySorting(data);

      expect(result).toEqual([
        { type: 'LEAF', value: 'A' },
        { type: 'LEAF', value: 'B' },
        { type: 'BRANCH', value: 'D' },
      ]);
    });
  });
});
