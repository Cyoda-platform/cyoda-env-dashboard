import HelperModelling from "../../../../src/helpers/HelperModelling";

describe('HelperModelling class', () => {
  describe('filterData method', () => {
    it('should filter out rows with clazzType "java.lang.Class"', () => {
      const input: any = [
        {clazzType: 'example'},
        {clazzType: 'java.lang.Class'},
        {clazzType: 'another example'}
      ];

      const result = HelperModelling.filterData(input);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        {clazzType: 'example'},
        {clazzType: "java.lang.Class"},
        {clazzType: "another example"}
      ]);
    });

    it('should filter out rows with falsy elementType or elementInfo', () => {
      const input: any = [
        {elementType: null},
        {elementInfo: null},
        {elementType: {type: 'example'}},
        {elementInfo: {type: 'example'}}
      ];

      const result = HelperModelling.filterData(input);

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        {elementType: {type: 'example'}},
        {elementInfo: {type: 'example'}}
      ]);
    });

    it('should return the same array if no filtering conditions match', () => {
      const input: any = [
        {clazzType: 'example', elementType: {type: 'example'}}
      ];

      const result = HelperModelling.filterData(input);

      expect(result).toHaveLength(1);
      expect(result).toEqual([
        {clazzType: 'example', elementType: {type: 'example'}}
      ]);
    });
  });

  describe('sortData method', () => {
    it('should sort rows based on the columnName property', () => {
      const input: any = [
        {columnName: 'C'},
        {columnName: 'A'},
        {columnName: 'B'}
      ];

      const result = HelperModelling.sortData(input);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        {columnName: 'A'},
        {columnName: 'B'},
        {columnName: 'C'}
      ]);
    });

    it('should maintain the order if rows have the same columnName', () => {
      const input: any = [
        {columnName: 'B'},
        {columnName: 'A'},
        {columnName: 'B'}
      ];

      const result = HelperModelling.sortData(input);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        {columnName: 'A'},
        {columnName: 'B'},
        {columnName: 'B'}
      ]);
    });

    it('should return the same array if it is already sorted', () => {
      const input: any = [
        {columnName: 'A'},
        {columnName: 'B'},
        {columnName: 'C'}
      ];

      const result = HelperModelling.sortData(input);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        {columnName: 'A'},
        {columnName: 'B'},
        {columnName: 'C'}
      ]);
    });
  });

  describe('applyNameSpace method', () => {
    it('should apply the namespace to each row and its related properties', () => {
      const namespace = 'myNamespace';
      const rows: any = [
        {columnPath: 'path1', elementInfo: {columnPath: 'path2'}, elementType: {columnPath: 'path3'}},
        {columnPath: 'path4', elementType: {columnPath: 'path5'}},
      ];

      const result = HelperModelling.applyNameSpace(rows, namespace);

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        {
          columnPath: 'myNamespace.path1',
          elementInfo: {columnPath: 'myNamespace.path2'},
          elementType: {columnPath: 'myNamespace.path3'}
        },
        {columnPath: 'myNamespace.path4', elementType: {columnPath: 'myNamespace.path5'}},
      ]);
    });

    it('should not modify rows if namespace is not provided', () => {
      const rows: any = [
        {columnPath: 'path1', elementInfo: {columnPath: 'path2'}, elementType: {columnPath: 'path3'}},
        {columnPath: 'path4', elementType: {columnPath: 'path5'}},
      ];

      const result = HelperModelling.applyNameSpace(rows, '');

      expect(result).toEqual(rows);
    });

    it('should handle rows without related properties', () => {
      const namespace = 'myNamespace';
      const rows: any = [
        {columnPath: 'path1'},
        {columnPath: 'path2'},
      ];

      const result = HelperModelling.applyNameSpace(rows, namespace);

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        {columnPath: 'myNamespace.path1'},
        {columnPath: 'myNamespace.path2'},
      ]);
    });
  });

  describe('rowCanBeSelected method', () => {
    it('should return true if reportInfoRow type is "LEAF"', () => {
      const reportInfoRow = {type: 'LEAF'};

      const result = HelperModelling.rowCanBeSelected(reportInfoRow);

      expect(result).toBe(true);
    });

    it('should return true if elementInfo type is "LEAF"', () => {
      const reportInfoRow = {
        type: 'SOME_TYPE',
        elementInfo: {type: 'LEAF'},
      };

      const result = HelperModelling.rowCanBeSelected(reportInfoRow);

      expect(result).toBe(true);
    });

    it('should return true if elementType type is "LEAF"', () => {
      const reportInfoRow = {
        type: 'SOME_TYPE',
        elementType: {type: 'LEAF'},
      };

      const result = HelperModelling.rowCanBeSelected(reportInfoRow);

      expect(result).toBe(true);
    });

    it('should return false if none of the conditions are met', () => {
      const reportInfoRow = {type: 'SOME_TYPE'};

      const result = HelperModelling.rowCanBeSelected(reportInfoRow);

      expect(result).toBe(false);
    });
  });

  describe('isChildAvailable method', () => {
    it('should return true if reportInfoRow type is in notPrimitiveList and element type is not "LEAF"', () => {
      const reportInfoRow = {
        type: 'EMBEDDED',
        elementInfo: {type: 'SOME_TYPE'},
      };

      const result = HelperModelling.isChildAvailable(reportInfoRow);

      expect(result).toBe(true);
    });

    it('should return false if reportInfoRow type is not in notPrimitiveList', () => {
      const reportInfoRow = {
        type: 'SOME_TYPE',
        elementInfo: {type: 'SOME_TYPE'},
      };

      const result = HelperModelling.isChildAvailable(reportInfoRow);

      expect(result).toBe(false);
    });

    it('should return false if element type is "LEAF"', () => {
      const reportInfoRow = {
        type: 'EMBEDDED',
        elementInfo: {type: 'LEAF'},
      };

      const result = HelperModelling.isChildAvailable(reportInfoRow);

      expect(result).toBe(false);
    });

    it('should return false if neither condition is met', () => {
      const reportInfoRow = {
        type: 'SOME_TYPE',
        elementInfo: {type: 'LEAF'},
      };

      const result = HelperModelling.isChildAvailable(reportInfoRow);

      expect(result).toBe(false);
    });

    it('should return false if elementType is in notPrimitiveList and element type is not "LEAF"', () => {
      const reportInfoRow = {
        type: 'SOME_TYPE',
        elementType: {type: 'EMBEDDED'},
      };

      const result = HelperModelling.isChildAvailable(reportInfoRow);

      expect(result).toBe(false);
    });

  });

  describe('allRequestParams method', () => {
    it('should return an empty array when isChildAvailable is false', () => {
      const reportInfoRow = {
        type: 'LEAF',
        columnPath: 'exampleColumnPath'
      };
      const requestClass = 'MyRequestClass';

      const result = HelperModelling.allRequestParams(reportInfoRow, requestClass);

      expect(result).toEqual([]);
    });
  });

  describe('getClasses method', () => {
    it('should return an array of RequestParam objects when applicable', () => {
      const requestClass = 'MyRequestClass';
      const row: any = {
        declaredClass: {
          class: 'DeclaredClass',
          abstract: false
        },
        columnPath: 'exampleColumnPath',
        subClasses: [
          {
            class: 'SubClass1',
            abstract: false
          },
          {
            class: 'SubClass2',
            abstract: false
          }
        ],
        elementType: {
          keyInfo: 'keyInfoExample',
        },
        elementInfo: {}
      };

      const result = HelperModelling.getClasses(requestClass, row, row.columnPath);

      expect(result).toEqual(expect.any(Array));
      expect(result.length).toBeGreaterThan(0);
      for (const param of result) {
        expect(param).toHaveProperty('reportClass', expect.any(String));
        expect(param).toHaveProperty('columnPath', expect.any(String));
        expect(param).toHaveProperty('requestClass', requestClass);
      }
    });

    it('should return an empty array when not applicable', () => {
      const requestClass = 'MyRequestClass';
      const row: any = {
        declaredClass: {
          class: 'DeclaredClass',
          abstract: true
        },
      };

      const result = HelperModelling.getClasses(requestClass, row, row.columnPath);

      expect(result).toEqual([]);
    });
  });

  describe('isElementIsSelected method', () => {
    it('should return true when selectedPath matches fullPathOfRow', () => {
      const selectedPath = 'path.to.selected';
      const fullPathOfRow = 'path.to.selected';
      const delimiter = '.';
      const result = HelperModelling.isElementIsSelected(
        selectedPath,
        fullPathOfRow,
        delimiter
      );
      expect(result).toBe(true);
    });

    it('should return false when selectedPath does not match fullPathOfRow', () => {
      const selectedPath = 'path.to.selected';
      const fullPathOfRow = 'different.path';
      const delimiter = '.';
      const result = HelperModelling.isElementIsSelected(
        selectedPath,
        fullPathOfRow,
        delimiter
      );
      expect(result).toBe(false);
    });

    it('should return false when selectedPath matches a subset of fullPathOfRow', () => {
      const selectedPath = 'path.to';
      const fullPathOfRow = 'path.to.selected';
      const delimiter = '.';
      const result = HelperModelling.isElementIsSelected(
        selectedPath,
        fullPathOfRow,
        delimiter
      );
      expect(result).toBe(false);
    });

    it('should return false when selectedPath is empty', () => {
      const selectedPath = '';
      const fullPathOfRow = 'path.to.selected';
      const delimiter = '.';
      const result = HelperModelling.isElementIsSelected(
        selectedPath,
        fullPathOfRow,
        delimiter
      );
      expect(result).toBe(false);
    });

    it('should return false when selectedPath is equal to fullPathOfRow segment', () => {
      const selectedPath = 'selected';
      const fullPathOfRow = 'path.to.selected';
      const delimiter = '.';
      const result = HelperModelling.isElementIsSelected(
        selectedPath,
        fullPathOfRow,
        delimiter
      );
      expect(result).toBe(false);
    });
  });
});
