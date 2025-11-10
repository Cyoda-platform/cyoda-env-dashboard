/**
 * Tests for HelperReportTable Utility
 */

import { describe, it, expect } from 'vitest';
import HelperReportTable, { type ReportGroup, type WrappedEntityModel, type GroupHeaderSummary } from './HelperReportTable';

describe('HelperReportTable', () => {
  describe('getHeaderHistoryGroupColumns', () => {
    it('should return empty array for empty groups', () => {
      const groups: ReportGroup = {
        _embedded: {
          wrappedEntityModels: [],
        },
        page: {
          size: 0,
          totalElements: 0,
          totalPages: 0,
          number: 0,
        },
      };

      const result = HelperReportTable.getHeaderHistoryGroupColumns(groups);

      expect(result).toEqual([]);
    });

    it('should extract columns from group summary', () => {
      const groups: ReportGroup = {
        _embedded: {
          wrappedEntityModels: [
            {
              content: {
                columnNames: ['amount', 'quantity'],
                commonGroupValues: {},
                groupLevel: 0,
                groupValues: [],
                groupValuesJson: '',
                groupValuesJsonBase64: '',
                isNext: false,
                leaf: false,
                parentGroupValuesJson: null,
                summary: {
                  'amount': {
                    values: {
                      COUNT: 10,
                      SUM: 1000,
                    },
                  },
                  'quantity': {
                    values: {
                      COUNT: 10,
                    },
                  },
                },
              },
              _links: {
                '/report/{id}/group_rows/{group_json_base64}': {
                  href: '/api/report/123/rows',
                  title: 'Rows',
                  type: 'GET',
                },
              },
            },
          ],
        },
        page: {
          size: 1,
          totalElements: 1,
          totalPages: 1,
          number: 0,
        },
      };

      const result = HelperReportTable.getHeaderHistoryGroupColumns(groups);

      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ label: 'count(amount)', prop: 'amount' });
      expect(result).toContainEqual({ label: 'sum(amount)', prop: 'amount' });
      expect(result).toContainEqual({ label: 'count(quantity)', prop: 'quantity' });
    });

    it('should replace dots with underscores in prop names', () => {
      const groups: ReportGroup = {
        _embedded: {
          wrappedEntityModels: [
            {
              content: {
                columnNames: [],
                commonGroupValues: {},
                groupLevel: 0,
                groupValues: [],
                groupValuesJson: '',
                groupValuesJsonBase64: '',
                isNext: false,
                leaf: false,
                parentGroupValuesJson: null,
                summary: {
                  'user.name': {
                    values: {
                      COUNT: 5,
                    },
                  },
                },
              },
              _links: {
                '/report/{id}/group_rows/{group_json_base64}': {
                  href: '/api/report/123/rows',
                  title: 'Rows',
                  type: 'GET',
                },
              },
            },
          ],
        },
        page: {
          size: 1,
          totalElements: 1,
          totalPages: 1,
          number: 0,
        },
      };

      const result = HelperReportTable.getHeaderHistoryGroupColumns(groups);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ label: 'count(user.name)', prop: 'user_name' });
    });

    it('should handle missing summary', () => {
      const groups: ReportGroup = {
        _embedded: {
          wrappedEntityModels: [
            {
              content: {
                columnNames: [],
                commonGroupValues: {},
                groupLevel: 0,
                groupValues: [],
                groupValuesJson: '',
                groupValuesJsonBase64: '',
                isNext: false,
                leaf: false,
                parentGroupValuesJson: null,
                summary: {} as GroupHeaderSummary,
              },
              _links: {
                '/report/{id}/group_rows/{group_json_base64}': {
                  href: '/api/report/123/rows',
                  title: 'Rows',
                  type: 'GET',
                },
              },
            },
          ],
        },
        page: {
          size: 1,
          totalElements: 1,
          totalPages: 1,
          number: 0,
        },
      };

      const result = HelperReportTable.getHeaderHistoryGroupColumns(groups);

      expect(result).toEqual([]);
    });
  });

  describe('getHeaderHistoryGroupSummaryData', () => {
    it('should return empty object for null summary', () => {
      const result = HelperReportTable.getHeaderHistoryGroupSummaryData(null as any);

      expect(result).toEqual({});
    });

    it('should return empty object for undefined summary', () => {
      const result = HelperReportTable.getHeaderHistoryGroupSummaryData(undefined as any);

      expect(result).toEqual({});
    });

    it('should extract summary data', () => {
      const summary: GroupHeaderSummary = {
        'amount': {
          values: {
            COUNT: 10,
            SUM: 1000,
          },
        },
        'quantity': {
          values: {
            COUNT: 10,
            AVG: 5,
          },
        },
      };

      const result = HelperReportTable.getHeaderHistoryGroupSummaryData(summary);

      expect(result).toHaveProperty('amount');
      expect(result).toHaveProperty('quantity');
      // Note: The function overwrites values, so only the last value for each field is kept
      expect(result.amount).toBe(1000); // SUM overwrites COUNT
      expect(result.quantity).toBe(5); // AVG overwrites COUNT
    });

    it('should replace dots with underscores in field names', () => {
      const summary: GroupHeaderSummary = {
        'user.name': {
          values: {
            COUNT: 5,
          },
        },
      };

      const result = HelperReportTable.getHeaderHistoryGroupSummaryData(summary);

      expect(result).toHaveProperty('user_name', 5);
      expect(result).not.toHaveProperty('user.name');
    });

    it('should handle empty summary object', () => {
      const summary: GroupHeaderSummary = {};

      const result = HelperReportTable.getHeaderHistoryGroupSummaryData(summary);

      expect(result).toEqual({});
    });
  });

  describe('formatGroupRow', () => {
    it('should format group row with all data', () => {
      const model: WrappedEntityModel = {
        content: {
          columnNames: ['amount'],
          commonGroupValues: {},
          groupLevel: 0,
          groupValues: ['Group1', 'SubGroup1'],
          groupValuesJson: '{}',
          groupValuesJsonBase64: 'e30=',
          isNext: true,
          leaf: false,
          parentGroupValuesJson: null,
          summary: {
            'amount': {
              values: {
                COUNT: 10,
                SUM: 1000,
              },
            },
          },
        },
        _links: {
          '/report/{id}/group_rows/{group_json_base64}': {
            href: '/api/report/123/rows',
            title: 'Rows',
            type: 'GET',
          },
          '/report/{id}/{grouping_version}/groups/{parent_group_json_base64}': {
            href: '/api/report/123/groups',
            title: 'Groups',
            type: 'GET',
          },
        },
      };

      const result = HelperReportTable.formatGroupRow(model);

      expect(result).toHaveProperty('group', 'Group - Group1 | SubGroup1');
      expect(result).toHaveProperty('_link_rows', '/api/report/123/rows');
      expect(result).toHaveProperty('_link_groups', '/api/report/123/groups');
      expect(result).toHaveProperty('isNext', true);
      expect(result).toHaveProperty('amount', 1000); // SUM value
    });

    it('should handle missing groups link', () => {
      const model: WrappedEntityModel = {
        content: {
          columnNames: ['amount'],
          commonGroupValues: {},
          groupLevel: 0,
          groupValues: ['Group1'],
          groupValuesJson: '{}',
          groupValuesJsonBase64: 'e30=',
          isNext: false,
          leaf: true,
          parentGroupValuesJson: null,
          summary: {
            'amount': {
              values: {
                COUNT: 5,
              },
            },
          },
        },
        _links: {
          '/report/{id}/group_rows/{group_json_base64}': {
            href: '/api/report/123/rows',
            title: 'Rows',
            type: 'GET',
          },
        },
      };

      const result = HelperReportTable.formatGroupRow(model);

      expect(result).toHaveProperty('_link_groups', null);
    });

    it('should format group name with multiple values', () => {
      const model: WrappedEntityModel = {
        content: {
          columnNames: [],
          commonGroupValues: {},
          groupLevel: 0,
          groupValues: ['A', 'B', 'C'],
          groupValuesJson: '{}',
          groupValuesJsonBase64: 'e30=',
          isNext: false,
          leaf: false,
          parentGroupValuesJson: null,
          summary: {},
        },
        _links: {
          '/report/{id}/group_rows/{group_json_base64}': {
            href: '/api/report/123/rows',
            title: 'Rows',
            type: 'GET',
          },
        },
      };

      const result = HelperReportTable.formatGroupRow(model);

      expect(result.group).toBe('Group - A | B | C');
    });

    it('should handle empty group values', () => {
      const model: WrappedEntityModel = {
        content: {
          columnNames: [],
          commonGroupValues: {},
          groupLevel: 0,
          groupValues: [],
          groupValuesJson: '{}',
          groupValuesJsonBase64: 'e30=',
          isNext: false,
          leaf: false,
          parentGroupValuesJson: null,
          summary: {},
        },
        _links: {
          '/report/{id}/group_rows/{group_json_base64}': {
            href: '/api/report/123/rows',
            title: 'Rows',
            type: 'GET',
          },
        },
      };

      const result = HelperReportTable.formatGroupRow(model);

      expect(result.group).toBe('Group - ');
    });
  });
});

