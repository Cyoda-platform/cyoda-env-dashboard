/**
 * Tests for HelperReportDefinition Utility
 */

import { describe, it, expect } from 'vitest';
import HelperReportDefinition from './HelperReportDefinition';

describe('HelperReportDefinition', () => {
  describe('Constants', () => {
    it('should have correct column type constants', () => {
      expect(HelperReportDefinition.SIMPLE_COLUMN).toBe('com.cyoda.core.reports.columns.ReportSimpleColumn');
      expect(HelperReportDefinition.SIMPLE_COLUMN_SHORT).toBe('ReportSimpleColumn');
      expect(HelperReportDefinition.ALIAS_COLUMN).toBe('com.cyoda.core.reports.columns.ReportAliasColumn');
      expect(HelperReportDefinition.ALIAS_COLUMN_SHORT).toBe('ReportAliasColumn');
    });
  });

  describe('reportDefinition', () => {
    it('should return default report definition structure', () => {
      const result = HelperReportDefinition.reportDefinition();

      expect(result).toHaveProperty('@bean', '');
      expect(result).toHaveProperty('description', '');
      expect(result).toHaveProperty('requestClass', '');
      expect(result).toHaveProperty('condition');
      expect(result.condition).toHaveProperty('@bean', '');
      expect(result.condition).toHaveProperty('operator', '');
      expect(result.condition).toHaveProperty('conditions', []);
      expect(result).toHaveProperty('sorting', []);
      expect(result).toHaveProperty('grouping', []);
      expect(result).toHaveProperty('summary', []);
      expect(result).toHaveProperty('columns', []);
      expect(result).toHaveProperty('pointTime', '2200-01-01T00:00:00.000+03:00');
      expect(result).toHaveProperty('colDefs', []);
      expect(result).toHaveProperty('aliasDefs', []);
      expect(result).toHaveProperty('valuationPointTime', '2020-01-27T14:09:28.778+03:00');
      expect(result).toHaveProperty('singletonReport', false);
    });

    it('should return a new object each time', () => {
      const result1 = HelperReportDefinition.reportDefinition();
      const result2 = HelperReportDefinition.reportDefinition();

      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  describe('reportStreamDefinition', () => {
    it('should return default stream report definition structure', () => {
      const result = HelperReportDefinition.reportStreamDefinition();

      expect(result).toHaveProperty('@bean', 'com.cyoda.core.streamdata.StreamDataConfigDef');
      expect(result).toHaveProperty('streamDataDef');
      expect(result.streamDataDef).toHaveProperty('requestClass', '');
      expect(result.streamDataDef).toHaveProperty('rangeOrder', 'ASC');
      expect(result.streamDataDef).toHaveProperty('rangeCondition');
      expect(result.streamDataDef).toHaveProperty('condition');
      expect(result.streamDataDef.condition).toHaveProperty('@bean', 'com.cyoda.core.conditions.GroupCondition');
      expect(result.streamDataDef.condition).toHaveProperty('operator', 'OR');
      expect(result.streamDataDef.condition).toHaveProperty('conditions', []);
      expect(result).toHaveProperty('name', '');
      expect(result).toHaveProperty('id', '');
    });
  });

  describe('expandColumnNames', () => {
    it('should expand short column names to full bean names', () => {
      const config = {
        columns: [
          { '@bean': 'ReportSimpleColumn', name: 'col1' },
          { '@bean': 'ReportAliasColumn', name: 'alias1' },
        ],
      };

      const result = HelperReportDefinition.expandColumnNames(config);

      expect(result.columns[0]['@bean']).toBe('com.cyoda.core.reports.columns.ReportSimpleColumn');
      expect(result.columns[1]['@bean']).toBe('com.cyoda.core.reports.columns.ReportAliasColumn');
    });

    it('should handle nested objects', () => {
      const config = {
        nested: {
          columns: [
            { '@bean': 'ReportSimpleColumn', name: 'col1' },
          ],
        },
      };

      const result = HelperReportDefinition.expandColumnNames(config);

      expect(result.nested.columns[0]['@bean']).toBe('com.cyoda.core.reports.columns.ReportSimpleColumn');
    });

    it('should not modify already expanded names', () => {
      const config = {
        columns: [
          { '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn', name: 'col1' },
        ],
      };

      const result = HelperReportDefinition.expandColumnNames(config);

      expect(result.columns[0]['@bean']).toBe('com.cyoda.core.reports.columns.ReportSimpleColumn');
    });
  });

  describe('validateConfigDefinition', () => {
    it('should return true for empty array', () => {
      expect(HelperReportDefinition.validateConfigDefinition([])).toBe(true);
    });

    it('should return true for null or undefined', () => {
      expect(HelperReportDefinition.validateConfigDefinition(null as any)).toBe(true);
      expect(HelperReportDefinition.validateConfigDefinition(undefined as any)).toBe(true);
    });

    it('should return true for valid conditions with @bean', () => {
      const conditions = [
        { '@bean': 'com.cyoda.core.conditions.SimpleCondition', field: 'name' },
        { '@bean': 'com.cyoda.core.conditions.GroupCondition', operator: 'AND', conditions: [] },
      ];

      expect(HelperReportDefinition.validateConfigDefinition(conditions)).toBe(true);
    });

    it('should return false for conditions without @bean', () => {
      const conditions = [
        { field: 'name' }, // Missing @bean
      ];

      expect(HelperReportDefinition.validateConfigDefinition(conditions)).toBe(false);
    });

    it('should validate nested conditions recursively', () => {
      const conditions = [
        {
          '@bean': 'com.cyoda.core.conditions.GroupCondition',
          operator: 'AND',
          conditions: [
            { '@bean': 'com.cyoda.core.conditions.SimpleCondition', field: 'name' },
            { '@bean': 'com.cyoda.core.conditions.SimpleCondition', field: 'age' },
          ],
        },
      ];

      expect(HelperReportDefinition.validateConfigDefinition(conditions)).toBe(true);
    });

    it('should return false for invalid nested conditions', () => {
      const conditions = [
        {
          '@bean': 'com.cyoda.core.conditions.GroupCondition',
          operator: 'AND',
          conditions: [
            { field: 'name' }, // Missing @bean in nested condition
          ],
        },
      ];

      expect(HelperReportDefinition.validateConfigDefinition(conditions)).toBe(false);
    });
  });

  describe('reportHistoryDefaultFilter', () => {
    it('should return default filter form', () => {
      const result = HelperReportDefinition.reportHistoryDefaultFilter();

      expect(result).toHaveProperty('authors', []);
      expect(result).toHaveProperty('states', []);
      expect(result).toHaveProperty('types', []);
      expect(result).toHaveProperty('entities', []);
      expect(result).toHaveProperty('time_custom', null);
      expect(result).toHaveProperty('search', '');
      expect(result).toHaveProperty('entityType', 'BUSINESS');
      expect(result).toHaveProperty('status', []);
      expect(result).toHaveProperty('times', []);
    });
  });

  describe('buildCols', () => {
    it('should return empty array for empty config', () => {
      const config = { colDefs: [], aliasDefs: [] };
      const result = HelperReportDefinition.buildCols(config);

      expect(result).toEqual([]);
    });

    it('should build columns from colDefs', () => {
      const config = {
        colDefs: [
          { fullPath: 'user.name', colType: 'LEAF' },
          { fullPath: 'user.email', colType: 'com.cyoda.tdb.model.types.String' },
        ],
        aliasDefs: [],
      };

      const result = HelperReportDefinition.buildCols(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        colType: 'colDef',
        alias: 'user.name',
        name: 'user.name',
        typeShort: 'LEAF',
        type: 'LEAF',
        '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
      });
      expect(result[1]).toMatchObject({
        colType: 'colDef',
        alias: 'user.email',
        name: 'user.email',
        typeShort: 'String',
        type: 'com.cyoda.tdb.model.types.String',
        '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
      });
    });

    it('should build columns from aliasDefs', () => {
      const config = {
        colDefs: [],
        aliasDefs: [
          { name: 'totalAmount', aliasType: 'com.cyoda.tdb.model.types.BigDecimal' },
          { name: 'count', aliasType: '' },
        ],
      };

      const result = HelperReportDefinition.buildCols(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        colType: 'aliasDef',
        alias: 'totalAmount',
        name: 'totalAmount',
        typeShort: 'BigDecimal',
        type: 'com.cyoda.tdb.model.types.BigDecimal',
        '@bean': 'com.cyoda.core.reports.columns.ReportAliasColumn',
      });
      expect(result[1]).toMatchObject({
        colType: 'aliasDef',
        alias: 'count',
        name: 'count',
        typeShort: '',
        type: '',
        '@bean': 'com.cyoda.core.reports.columns.ReportAliasColumn',
      });
    });

    it('should combine colDefs and aliasDefs', () => {
      const config = {
        colDefs: [
          { fullPath: 'user.name', colType: 'LEAF' },
        ],
        aliasDefs: [
          { name: 'totalAmount', aliasType: 'com.cyoda.tdb.model.types.BigDecimal' },
        ],
      };

      const result = HelperReportDefinition.buildCols(config);

      expect(result).toHaveLength(2);
      expect(result[0].colType).toBe('colDef');
      expect(result[1].colType).toBe('aliasDef');
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('should capitalize first letter', () => {
      expect(HelperReportDefinition.capitalizeFirstLetter('hello')).toBe('Hello');
      expect(HelperReportDefinition.capitalizeFirstLetter('WORLD')).toBe('World');
      expect(HelperReportDefinition.capitalizeFirstLetter('test')).toBe('Test');
    });

    it('should handle empty string', () => {
      expect(HelperReportDefinition.capitalizeFirstLetter('')).toBe('');
    });

    it('should handle single character', () => {
      expect(HelperReportDefinition.capitalizeFirstLetter('a')).toBe('A');
      expect(HelperReportDefinition.capitalizeFirstLetter('Z')).toBe('Z');
    });
  });

  describe('applyFiltersForReportTables', () => {
    const mockData = [
      { name: 'Report 1', description: 'Test report', username: 'user1', entity: 'Entity1' },
      { name: 'Report 2', description: 'Another test', username: 'user2', entity: 'Entity2' },
      { name: 'Config 1', description: 'Configuration', user: 'user1', entity: 'Entity1' },
    ];

    it('should return all data when no filters applied', () => {
      const result = HelperReportDefinition.applyFiltersForReportTables(mockData, {});

      expect(result).toHaveLength(3);
    });

    it('should filter by search term in name', () => {
      const result = HelperReportDefinition.applyFiltersForReportTables(mockData, {
        search: 'Report',
      });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Report 1');
      expect(result[1].name).toBe('Report 2');
    });

    it('should filter by search term in description', () => {
      const result = HelperReportDefinition.applyFiltersForReportTables(mockData, {
        search: 'Configuration',
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Config 1');
    });

    it('should filter by authors (username)', () => {
      const result = HelperReportDefinition.applyFiltersForReportTables(mockData, {
        authors: ['user1'],
      });

      expect(result).toHaveLength(2);
      expect(result[0].username).toBe('user1');
      expect(result[1].user).toBe('user1');
    });

    it('should filter by entities', () => {
      const result = HelperReportDefinition.applyFiltersForReportTables(mockData, {
        entities: ['Entity1'],
      });

      expect(result).toHaveLength(2);
      expect(result.every(item => item.entity === 'Entity1')).toBe(true);
    });

    it('should apply multiple filters', () => {
      const result = HelperReportDefinition.applyFiltersForReportTables(mockData, {
        search: 'Report',
        authors: ['user1'],
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Report 1');
    });

    it('should be case insensitive for search', () => {
      const result = HelperReportDefinition.applyFiltersForReportTables(mockData, {
        search: 'REPORT',
      });

      expect(result).toHaveLength(2);
    });
  });
});

