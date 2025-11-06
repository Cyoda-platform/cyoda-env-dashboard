import { describe, it, expect } from 'vitest';
import {
  getAllFields,
  checkIsExistFlatten,
  countHiddenFields,
  countHiddenTables,
  filterVisible,
  filterHidden,
} from '../helpers';
import type { SqlField, SqlTable } from '../../types';

describe('helper utilities', () => {
  describe('getAllFields', () => {
    it('should return all fields including nested array fields', () => {
      const fields: SqlField[] = [
        {
          fieldName: 'field1',
          fieldType: 'varchar',
        },
        {
          fieldName: 'field2',
          fieldType: 'array',
          isArray: true,
          flatten: true,
          arrayFields: [
            { fieldName: 'nested1', fieldType: 'varchar' },
            { fieldName: 'nested2', fieldType: 'integer' },
          ],
        },
      ];

      const allFields = getAllFields(fields);
      expect(allFields).toHaveLength(4);
      expect(allFields.map(f => f.fieldName)).toEqual([
        'field1',
        'field2',
        'nested1',
        'nested2',
      ]);
    });

    it('should handle deeply nested fields', () => {
      const fields: SqlField[] = [
        {
          fieldName: 'level1',
          fieldType: 'array',
          isArray: true,
          flatten: true,
          arrayFields: [
            {
              fieldName: 'level2',
              fieldType: 'array',
              isArray: true,
              flatten: true,
              arrayFields: [
                { fieldName: 'level3', fieldType: 'varchar' },
              ],
            },
          ],
        },
      ];

      const allFields = getAllFields(fields);
      expect(allFields).toHaveLength(3);
      expect(allFields.map(f => f.fieldName)).toEqual(['level1', 'level2', 'level3']);
    });

    it('should return empty array for empty input', () => {
      expect(getAllFields([])).toEqual([]);
    });
  });

  describe('checkIsExistFlatten', () => {
    it('should return true if any field has flatten enabled', () => {
      const fields: SqlField[] = [
        { fieldName: 'field1', fieldType: 'varchar' },
        { fieldName: 'field2', fieldType: 'array', flatten: true },
      ];

      expect(checkIsExistFlatten(fields)).toBe(true);
    });

    it('should return false if no fields have flatten enabled', () => {
      const fields: SqlField[] = [
        { fieldName: 'field1', fieldType: 'varchar' },
        { fieldName: 'field2', fieldType: 'array', flatten: false },
      ];

      expect(checkIsExistFlatten(fields)).toBe(false);
    });

    it('should check nested array fields', () => {
      const fields: SqlField[] = [
        {
          fieldName: 'field1',
          fieldType: 'array',
          arrayFields: [
            { fieldName: 'nested', fieldType: 'varchar', flatten: true },
          ],
        },
      ];

      expect(checkIsExistFlatten(fields)).toBe(true);
    });
  });

  describe('countHiddenFields', () => {
    it('should count hidden fields', () => {
      const fields: SqlField[] = [
        { fieldName: 'field1', fieldType: 'varchar', hidden: false },
        { fieldName: 'field2', fieldType: 'varchar', hidden: true },
        { fieldName: 'field3', fieldType: 'varchar', hidden: true },
      ];

      expect(countHiddenFields(fields)).toBe(2);
    });

    it('should count hidden fields in nested arrays', () => {
      const fields: SqlField[] = [
        { fieldName: 'field1', fieldType: 'varchar', hidden: true },
        {
          fieldName: 'field2',
          fieldType: 'array',
          arrayFields: [
            { fieldName: 'nested1', fieldType: 'varchar', hidden: true },
            { fieldName: 'nested2', fieldType: 'varchar', hidden: false },
          ],
        },
      ];

      expect(countHiddenFields(fields)).toBe(2);
    });

    it('should return 0 for no hidden fields', () => {
      const fields: SqlField[] = [
        { fieldName: 'field1', fieldType: 'varchar' },
        { fieldName: 'field2', fieldType: 'varchar' },
      ];

      expect(countHiddenFields(fields)).toBe(0);
    });
  });

  describe('countHiddenTables', () => {
    it('should count hidden tables', () => {
      const tables: SqlTable[] = [
        {
          metadataClassId: '1',
          tableName: 'table1',
          uniformedPath: 'path1',
          fields: [],
          hidden: false,
        },
        {
          metadataClassId: '2',
          tableName: 'table2',
          uniformedPath: 'path2',
          fields: [],
          hidden: true,
        },
        {
          metadataClassId: '3',
          tableName: 'table3',
          uniformedPath: 'path3',
          fields: [],
          hidden: true,
        },
      ];

      expect(countHiddenTables(tables)).toBe(2);
    });

    it('should return 0 for no hidden tables', () => {
      const tables: SqlTable[] = [
        {
          metadataClassId: '1',
          tableName: 'table1',
          uniformedPath: 'path1',
          fields: [],
        },
      ];

      expect(countHiddenTables(tables)).toBe(0);
    });
  });

  describe('filterVisible', () => {
    it('should filter visible fields', () => {
      const fields: SqlField[] = [
        { fieldName: 'field1', fieldType: 'varchar', hidden: false },
        { fieldName: 'field2', fieldType: 'varchar', hidden: true },
        { fieldName: 'field3', fieldType: 'varchar' },
      ];

      const visible = filterVisible(fields);
      expect(visible).toHaveLength(2);
      expect(visible.map(f => f.fieldName)).toEqual(['field1', 'field3']);
    });

    it('should filter visible tables', () => {
      const tables: SqlTable[] = [
        {
          metadataClassId: '1',
          tableName: 'table1',
          uniformedPath: 'path1',
          fields: [],
          hidden: false,
        },
        {
          metadataClassId: '2',
          tableName: 'table2',
          uniformedPath: 'path2',
          fields: [],
          hidden: true,
        },
      ];

      const visible = filterVisible(tables);
      expect(visible).toHaveLength(1);
      expect(visible[0].tableName).toBe('table1');
    });
  });

  describe('filterHidden', () => {
    it('should filter hidden fields', () => {
      const fields: SqlField[] = [
        { fieldName: 'field1', fieldType: 'varchar', hidden: false },
        { fieldName: 'field2', fieldType: 'varchar', hidden: true },
        { fieldName: 'field3', fieldType: 'varchar', hidden: true },
      ];

      const hidden = filterHidden(fields);
      expect(hidden).toHaveLength(2);
      expect(hidden.map(f => f.fieldName)).toEqual(['field2', 'field3']);
    });

    it('should filter hidden tables', () => {
      const tables: SqlTable[] = [
        {
          metadataClassId: '1',
          tableName: 'table1',
          uniformedPath: 'path1',
          fields: [],
          hidden: false,
        },
        {
          metadataClassId: '2',
          tableName: 'table2',
          uniformedPath: 'path2',
          fields: [],
          hidden: true,
        },
      ];

      const hidden = filterHidden(tables);
      expect(hidden).toHaveLength(1);
      expect(hidden[0].tableName).toBe('table2');
    });
  });
});

