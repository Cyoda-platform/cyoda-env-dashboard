import HelperReportTable from "../../../src/helpers/HelperReportTable";

describe('HelperReportTable', () => {
  describe('getHeaderHistoryGroupColumns', () => {
    it('should return empty columns when no summary is provided', () => {
      const groups:any = {
        _embedded: {
          wrappedEntityModels: [
            {
              content: {},
            },
          ],
        },
      };

      const columns = HelperReportTable.getHeaderHistoryGroupColumns(groups);

      expect(columns).toEqual([]);
    });

    it('should return columns based on the summary data', () => {
      const groups:any = {
        _embedded: {
          wrappedEntityModels: [
            {
              content: {
                summary: {
                  field1: {
                    values: {
                      sumEl1: 10,
                      sumEl2: 20,
                    },
                  },
                  field2: {
                    values: {
                      sumEl3: 30,
                      sumEl4: 40,
                    },
                  },
                },
              },
            },
          ],
        },
      };

      const columns = HelperReportTable.getHeaderHistoryGroupColumns(groups);

      const expectedColumns = [
        {
          "label": "sumel1(field1)",
          "prop": "field1"
        },
        {
          "label": "sumel2(field1)",
          "prop": "field1"
        },
        {
          "label": "sumel3(field2)",
          "prop": "field2"
        },
        {
          "label": "sumel4(field2)",
          "prop": "field2"
        }
      ];

      expect(columns).toEqual(expectedColumns);
    });
  });

  describe('getHeaderHistoryGroupSummaryData', () => {
    it('should return an empty row when no summary is provided', () => {
      const summary = {};

      const row = HelperReportTable.getHeaderHistoryGroupSummaryData(summary);

      expect(row).toEqual({});
    });

    it('should return row data based on the summary', () => {
      const summary:any = {
        field1: {
          values: {
            sumEl1: 'value1',
            sumEl2: 'value2',
          },
        },
        field2: {
          values: {
            sumEl3: 'value3',
            sumEl4: 'value4',
          },
        },
      };

      const row = HelperReportTable.getHeaderHistoryGroupSummaryData(summary);

      const expectedRow = {
        field1: 'value2',
        field2: 'value4',
      };

      expect(row).toEqual(expectedRow);
    });
  });
});
