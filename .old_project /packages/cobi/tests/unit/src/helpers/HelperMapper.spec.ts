import HelperMapper from "../../../../src/helpers/HelperMapper";

describe('HelperMapper', () => {
  describe('isColumnHaveTransformError', () => {
    it('should return false if finalType is [B', () => {
      const column = {
        dstCyodaColumnPathType: '[B',
        srcColumnPath: 'source',
        transformer: null,
      };
      const listAllTransformers = [];
      const result = HelperMapper.isColumnHaveTransformError(column, listAllTransformers);
      expect(result).toBe(false);
    });

    it('should return false if finalType is null and srcColumnPath is "content"', () => {
      const column = {
        dstCyodaColumnPathType: null,
        srcColumnPath: 'content',
        transformer: null,
      };
      const listAllTransformers = [];
      const result = HelperMapper.isColumnHaveTransformError(column, listAllTransformers);
      expect(result).toBe(false);
    });

    it('should return true if transformer children are empty', () => {
      const column = {
        dstCyodaColumnPathType: 'someType',
        srcColumnPath: 'source',
        transformer: {children: []},
      };
      const listAllTransformers = [];
      const result = HelperMapper.isColumnHaveTransformError(column, listAllTransformers);
      expect(result).toBe(true);
    });

    it('should return true if transformer output type does not match finalType', () => {
      const column = {
        dstCyodaColumnPathType: 'finalType',
        srcColumnPath: 'source',
        transformer: {
          children: [{transformerKey: 'someKey'}],
        },
      };
      const listAllTransformers = [
        {
          transformerKey: 'someKey',
          outType: 'differentType',
        },
      ];
      const result = HelperMapper.isColumnHaveTransformError(column, listAllTransformers);
      expect(result).toBe(true);
    });

    it('should return false if transformer output type matches finalType', () => {
      const column = {
        dstCyodaColumnPathType: 'finalType',
        srcColumnPath: 'source',
        transformer: {
          children: [{transformerKey: 'someKey'}],
        },
      };
      const listAllTransformers = [
        {
          transformerKey: 'someKey',
          outType: 'finalType',
        },
      ];
      const result = HelperMapper.isColumnHaveTransformError(column, listAllTransformers);
      expect(result).toBe(false);
    });

    it('should return false if no error conditions are met', () => {
      const column = {
        dstCyodaColumnPathType: 'finalType',
        srcColumnPath: 'source',
        transformer: {
          children: [{transformerKey: 'someKey'}],
        },
      };
      const listAllTransformers = [
        {
          transformerKey: 'someKey',
          outType: 'finalType',
        },
      ];
      const result = HelperMapper.isColumnHaveTransformError(column, listAllTransformers);
      expect(result).toBe(false);
    });

    it('Should return false if error conditions are not met.', () => {
      const column = {
        dstCyodaColumnPathType: 'finalType',
        srcColumnPath: 'исходный',
        transformer: {
          children: [{transformerKey: 'someKey'}],
        },
      };
      const listAllTransformers = [
        {
          transformerKey: 'someKey',
          outType: 'finalType',
        },
      ];
      const result = HelperMapper.isColumnHaveTransformError(column, listAllTransformers);
      expect(result).toBe(false);
    });

    it('Should return false if there is no transformer and finalType is not equal to [B.', () => {
      const column = {
        dstCyodaColumnPathType: 'finalType',
        srcColumnPath: 'исходный',
        transformer: null,
      };
      const listAllTransformers = [];
      const result = HelperMapper.isColumnHaveTransformError(column, listAllTransformers);
      expect(result).toBe(false);
    });
  });

  describe('isFunctionalMappingRelationHaveError', () => {
    it('should return true for empty functional mapping', () => {
      const functionalMappingConfig: any = {
        statements: []
      };
      const result = HelperMapper.isFunctionalMappingRelationHaveError(functionalMappingConfig);
      expect(result).toBe(true);
    });

    it('should return false for non-empty functional mapping', () => {
      const functionalMappingConfig: any = {
        statements: [{type: 'SET_DST_VALUE'}]
      };
      const result = HelperMapper.isFunctionalMappingRelationHaveError(functionalMappingConfig);
      expect(result).toBe(false);
    });
  });

  describe('transformPathToJs function', () => {
    it('transforms the path correctly', () => {
      const inputPath = 'root:/some/path/*/to/transform/';
      const expectedOutput = 'some.path[0].to.transform';

      const transformedPath = HelperMapper.transformPathToJs(inputPath);

      expect(transformedPath).toEqual(expectedOutput);
    });

    it('transforms the path with extra slashes and asterisks', () => {
      const inputPath = 'root://some/path/*/to/transform';
      const expectedOutput = 'some.path[0].to.transform';

      const transformedPath = HelperMapper.transformPathToJs(inputPath);

      expect(transformedPath).toEqual(expectedOutput);
    });

    it('transforms the path with trailing dots', () => {
      const inputPath = 'root:/some/path/*/to/transform....';
      const expectedOutput = 'some.path[0].to.transform';

      const transformedPath = HelperMapper.transformPathToJs(inputPath);

      expect(transformedPath).toEqual(expectedOutput);
    });
  });

  describe('transformPathToJsAsArray function', () => {
    it('transforms the path correctly', () => {
      const inputPath = 'root:/some/path/*/to/transform/';
      const expectedOutput = ['some', 'path', '0', 'to', 'transform'];

      const transformedPathArray = HelperMapper.transformPathToJsAsArray(inputPath);

      expect(transformedPathArray).toEqual(expectedOutput);
    });

    it('transforms the path with extra slashes and asterisks', () => {
      const inputPath = 'root:///some//path/*/to//transform//';
      const expectedOutput = ['some', 'path', '0', 'to', 'transform'];

      const transformedPathArray = HelperMapper.transformPathToJsAsArray(inputPath);

      expect(transformedPathArray).toEqual(expectedOutput);
    });

    it('transforms the path with trailing dots and converts to array', () => {
      const inputPath = 'root:/some/path/*/to/transform';
      const expectedOutput = ['some', 'path', '0', 'to', 'transform'];

      const transformedPathArray = HelperMapper.transformPathToJsAsArray(inputPath);

      expect(transformedPathArray).toEqual(expectedOutput);
    });
  });

  describe('getValueFromSourceData function', () => {
    it('returns the value from sourceData for XML dataType', () => {
      const sourceData = {
        some: {
          path: {
            '#text': 'XML Value'
          }
        }
      };
      const srcColumnPath = 'root:/some/path';
      const dataType = 'XML';

      const result = HelperMapper.getValueFromSourceData(sourceData, srcColumnPath, dataType);

      expect(result).toBe('XML Value');
    });

    it('returns the value from sourceData for other dataType', () => {
      const sourceData = {
        some: {
          path: 'Other Value'
        }
      };
      const srcColumnPath = 'root:/some/path';
      const dataType = 'Other';

      const result = HelperMapper.getValueFromSourceData(sourceData, srcColumnPath, dataType);

      expect(result).toBe('Other Value');
    });

    it('returns undefined for non-existent path in sourceData', () => {
      const sourceData = {
        another: {
          path: 'Value'
        }
      };
      const srcColumnPath = 'root:/some/path';
      const dataType = 'Other';

      const result = HelperMapper.getValueFromSourceData(sourceData, srcColumnPath, dataType);

      expect(result).toBeUndefined();
    });
  });

  describe('curvedHorizontal function', () => {
    it('generates the correct path for a curved horizontal line', () => {
      const startX = 10;
      const startY = 20;
      const endX = 100;
      const endY = 20;

      const result = HelperMapper.curvedHorizontal(startX, startY, endX, endY);

      const expectedPath =
        'M10,20 L14.5,20 C69.4,20 39.7,20 95.5,20 L100,20';

      expect(result).toBe(expectedPath);
    });

    it('generates the correct path for a curved horizontal line with different points', () => {
      const startX = 50;
      const startY = 30;
      const endX = 200;
      const endY = 30;

      const result = HelperMapper.curvedHorizontal(startX, startY, endX, endY);

      const expectedPath =
        'M50,30 L57.5,30 C149,30 99.5,30 192.5,30 L200,30';

      expect(result).toBe(expectedPath);
    });
  });

  describe('curvedHorizontalSmall function', () => {
    it('generates the correct path for a curved small horizontal line', () => {
      const startX = 10;
      const startY = 20;
      const endX = 100;
      const endY = 20;

      const result = HelperMapper.curvedHorizontalSmall(startX, startY, endX, endY);

      const expectedPath =
        'M10,20 L0,20 C0,20 0,20 104.5,20 L100,20';

      expect(result).toBe(expectedPath);
    });

    it('generates the correct path for a curved small horizontal line with different points', () => {
      const startX = 50;
      const startY = 30;
      const endX = 200;
      const endY = 30;

      const result = HelperMapper.curvedHorizontalSmall(startX, startY, endX, endY);

      const expectedPath =
        'M50,30 L40,30 C40,30 100,30 207.5,30 L200,30';

      expect(result).toBe(expectedPath);
    });
  });

  describe('getFullPathForEntity function', () => {
    it('returns the correct path for an entity with no parent', () => {
      const entityMapping: any = {
        entityRelationConfigs: [
          {
            srcRelativeRootPath: 'entity1'
          }
        ]
      };
      const dataMappingConfigDto: any = {
        entityMappings: []
      };

      const result = HelperMapper.getFullPathForEntity(entityMapping, dataMappingConfigDto);

      expect(result).toBe('entity1');
    });

    it('returns the correct path for an entity with a parent', () => {
      const parentEntityMapping = {
        id: {
          id: 'parentId'
        },
        entityRelationConfigs: [
          {
            srcRelativeRootPath: 'parentEntity'
          }
        ]
      };
      const entityMapping: any = {
        id: {
          id: 'entityId'
        },
        entityRelationConfigs: [
          {
            srcRelativeRootPath: 'entity1',
            parentId: {
              id: 'parentId'
            }
          }
        ]
      };
      const dataMappingConfigDto: any = {
        entityMappings: [parentEntityMapping, entityMapping]
      };

      const result = HelperMapper.getFullPathForEntity(entityMapping, dataMappingConfigDto);

      expect(result).toBe('parentEntity/entity1');
    });
  });

  describe('getTypeOfData function', () => {
    it('returns "binary" type for content key with dataType BINARY_DOC', () => {
      const dataType = 'BINARY_DOC';
      const rowKey = 'content';

      const result = HelperMapper.getTypeOfData(null, rowKey, dataType);

      expect(result).toBe('binary');
    });

    it('returns "number" type for content-size key with dataType BINARY_DOC', () => {
      const dataType = 'BINARY_DOC';
      const rowKey = 'content-size';

      const result = HelperMapper.getTypeOfData(null, rowKey, dataType);

      expect(result).toBe('number');
    });

    it('returns "array" type for an array value', () => {
      const value = [1, 2, 3];

      const result = HelperMapper.getTypeOfData(value);

      expect(result).toBe('array');
    });

    it('returns "null" type for a null value', () => {
      const value = null;

      const result = HelperMapper.getTypeOfData(value);

      expect(result).toBe('null');
    });

    it('returns the correct type for other values', () => {
      const values = [1, 'string', true, false, {}, undefined];

      values.forEach(value => {
        const result = HelperMapper.getTypeOfData(value);
        const expectedResult = typeof value;

        expect(result).toBe(expectedResult);
      });
    });
  });

  describe('isCanBeUploadedFile function', () => {
    it('returns true for valid data types', () => {
      const validDataTypes = ['JSON', 'XML', 'CSV'];

      validDataTypes.forEach(dataType => {
        const result = HelperMapper.isCanBeUploadedFile(dataType);
        expect(result).toBe(true);
      });
    });

    it('returns false for invalid data types', () => {
      const invalidDataTypes = ['TXT', 'XLS', 'PDF'];

      invalidDataTypes.forEach(dataType => {
        const result = HelperMapper.isCanBeUploadedFile(dataType);
        expect(result).toBe(false);
      });
    });
  });

  describe('checkNoneMappingFields function', () => {
    const entityMapping = {
      columns: [
        {dstCyodaColumnPath: 'column1'},
        {dstCyodaColumnPath: 'column2'},
      ],
      functionalMappings: [
        {dstPath: 'path1'},
        {dstPath: 'path2'},
      ],
    };

    it('returns true when entity mapping has columns and functional mappings with none mapping fields', () => {
      const noneMappingFields = ['column1', 'path1'];
      const result = HelperMapper.checkNoneMappingFields(entityMapping, noneMappingFields);
      expect(result).toBe(true);
    });

    it('returns false when entity mapping has no columns or functional mappings with none mapping fields', () => {
      const noneMappingFields = ['column3', 'path3'];
      const result = HelperMapper.checkNoneMappingFields(entityMapping, noneMappingFields);
      expect(result).toBe(false);
    });

    it('returns false when none mapping fields array is empty', () => {
      const noneMappingFields = [];
      const result = HelperMapper.checkNoneMappingFields(entityMapping, noneMappingFields);
      expect(result).toBe(false);
    });

    it('returns false when entity mapping has columns with none mapping fields but no functional mappings', () => {
      const noneMappingFields = ['column10'];
      const result = HelperMapper.checkNoneMappingFields(entityMapping, noneMappingFields);
      expect(result).toBe(false);
    });

    it('returns false when entity mapping has functional mappings with none mapping fields but no columns', () => {
      const noneMappingFields = ['path10'];
      const result = HelperMapper.checkNoneMappingFields(entityMapping, noneMappingFields);
      expect(result).toBe(false);
    });
  });

  describe('getScrollParent function', () => {
    it('returns the scroll parent when the node has scrollable content', () => {
      const nodeWithScroll = {
        scrollHeight: 200,
        clientHeight: 100,
        parentNode: {
          scrollHeight: 300,
          clientHeight: 150,
        },
      };

      const result = HelperMapper.getScrollParent(nodeWithScroll);
      expect(result).toEqual(nodeWithScroll);
    });

    it('returns the scroll parent when the node itself is scrollable', () => {
      const nodeWithSelfScroll = {
        scrollHeight: 100,
        clientHeight: 200,
        parentNode: {
          scrollHeight: 300,
          clientHeight: 150,
        },
      };

      const result = HelperMapper.getScrollParent(nodeWithSelfScroll);
      expect(result).toEqual(nodeWithSelfScroll.parentNode);
    });

    it('returns null when the node is null', () => {
      const result = HelperMapper.getScrollParent(null);
      expect(result).toBeNull();
    });
  });

  describe('addMissingFieldsToAllObjects function', () => {
    it('adds missing fields to all objects in an array', () => {
      const content = [
        {id: 1, name: 'John'},
        {id: 2, age: 30},
        {id: 3, name: 'Alice', age: 25},
      ];

      const result = HelperMapper.addMissingFieldsToAllObjects(content);

      const expected = [
        {
          "age": 25,
          "id": 3,
          "name": "Alice"
        },
        {
          "age": 30,
          "id": 2
        },
        {
          "age": 25,
          "id": 3,
          "name": "Alice"
        }
      ];

      expect(result).toEqual(expected);
    });

    it('adds missing fields to nested objects', () => {
      const content = {
        person1: {id: 1, name: 'John'},
        person2: {age: 30},
        person3: {name: 'Alice', age: 25},
      };

      const result = HelperMapper.addMissingFieldsToAllObjects(content);

      const expected = {
        person1: {id: 1, name: 'John', age: undefined},
        person2: {name: undefined, age: 30},
        person3: {name: 'Alice', age: 25},
      };

      expect(result).toEqual(expected);
    });

    it('handles nested arrays of objects', () => {
      const content = {
        data: [
          {id: 1, name: 'John'},
          {id: 2, age: 30},
        ],
      };

      const result = HelperMapper.addMissingFieldsToAllObjects(content);

      const expected = {
        "data": [
          {
            "age": 30,
            "id": 2,
            "name": "John"
          },
          {
            "age": 30,
            "id": 2
          }
        ]
      };

      expect(result).toEqual(expected);
    });

    it('handles arrays of primitive values', () => {
      const content = [1, 2, 3];

      const result = HelperMapper.addMissingFieldsToAllObjects(content);

      const expected = [1, 2, 3];
      expect(result).toEqual(expected);
    });

    it('returns the same content for non-object values', () => {
      const content = 'test';

      const result = HelperMapper.addMissingFieldsToAllObjects(content);

      expect(result).toEqual(content);
    });

    it('handles an empty array', () => {
      const content = [
        {}
      ];

      const result = HelperMapper.addMissingFieldsToAllObjects(content);

      expect(result).toEqual([
        {}
      ]);
    });

    it('handles an empty object', () => {
      const content = {};

      const result = HelperMapper.addMissingFieldsToAllObjects(content);

      expect(result).toEqual(content);
    });
  });

  describe('relativePathOptions function', () => {
    it('generates relative path options for an object', () => {
      const data = {
        key1: {
          subKey1: 'value1',
          subKey2: {
            subSubKey: 'value2',
          },
        },
        key2: 'value3',
      };

      const result = HelperMapper.relativePathOptions(data);

      const expected = [
        {
          "children": [
            {
              "label": "key1/subKey2",
              "labelShort": "subKey2",
              "value": "key1/subKey2",
            }
          ],
          "labelShort": "key1",
          "value": "key1",
          "label": "key1"
        }
      ];

      expect(result).toEqual(expected);
    });

    it('generates relative path options for an array', () => {
      const data = [
        {
          subKey1: 'value1',
        },
        {
          subKey2: {
            subSubKey: 'value2',
          },
        },
      ];

      const result = HelperMapper.relativePathOptions(data);

      const expected = [
        {
          "label": "*",
          "labelShort": "*",
          "value": "*",
        }
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('transformDataForSeveralSrcRelativeRootPath function', () => {
    it('does not transform content if entity has only one entityRelationConfig', () => {
      const entityMapping:any = {
        entityRelationConfigs: [{ srcRelativeRootPath: 'path1' }],
      };
      const dataMappingConfigDto:any = {};
      const content = { path1: { key1: 'value1' } };

      const result = HelperMapper.transformDataForSeveralSrcRelativeRootPath(entityMapping, dataMappingConfigDto, content);

      expect(result).toEqual(content);
    });

    it('transforms content for multiple entityRelationConfigs', () => {
      const entityMapping:any = {
        entityRelationConfigs: [
          { srcRelativeRootPath: 'path1' },
          { srcRelativeRootPath: 'path2' },
        ],
      };
      const dataMappingConfigDto:any = {};
      const content = { path1: { key1: 'value1' }, path2: { key2: 'value2' } };

      const result = HelperMapper.transformDataForSeveralSrcRelativeRootPath(entityMapping, dataMappingConfigDto, content);

      const expected = {
        "path1": {
          "key1": "value1",
          "path1": {},
          "path2": {}
        },
        "path2": {
          "key2": "value2"
        }
      };
      expect(result).toEqual(expected);
    });
  });

  describe('updateOldToNewFieldsInObj function', () => {
    it('recursively updates nested objects', () => {
      const obj = {
        key1: 'oldValue1',
        nested: {
          key2: 'oldValue2',
          key3: 'oldValue3',
        },
      };
      const oldValues = ['oldValue1', 'oldValue2', 'oldValue3'];
      const newValues = ['newValue1', 'newValue2', 'newValue3'];

      HelperMapper.updateOldToNewFieldsInObj(obj, oldValues, newValues);

      const expected = {
        key1: 'newValue1',
        nested: {
          key2: 'newValue2',
          key3: 'newValue3',
        },
      };
      expect(obj).toEqual(expected);
    });

    it('recursively updates nested objects with ignoreFields', () => {
      const obj = {
        key1: 'oldValue1',
        nested: {
          key2: 'oldValue2',
          key3: 'oldValue3',
          jsonPath: 'oldValue4',
        },
      };
      const oldValues = ['oldValue1', 'oldValue2', 'oldValue3', 'oldValue4'];
      const newValues = ['newValue1', 'newValue2', 'newValue3', 'newValue4'];

      HelperMapper.updateOldToNewFieldsInObj(obj, oldValues, newValues, ['jsonPath']);

      const expected = {
        key1: 'newValue1',
        nested: {
          key2: 'newValue2',
          key3: 'newValue3',
          jsonPath: 'oldValue4',
        },
      };
      expect(obj).toEqual(expected);
    });
  });

  describe('updateOldJsonPathsToNewFieldsInObj function', () => {
    it('recursively updates nested objects with specified fields ignored', () => {
      const obj = {
        key1: 'oldValue1',
        nested: {
          key2: 'oldValue2',
          key3: 'oldValue3',
          dstColumnPath: 'oldValue4',
        },
      };
      const oldValues = ['oldValue1', 'oldValue2', 'oldValue3', 'oldValue4'];
      const newValues = ['newValue1', 'newValue2', 'newValue3', 'newValue4'];

      HelperMapper.updateOldJsonPathsToNewFieldsInObj(obj, oldValues, newValues);

      const expected = {
        key1: 'newValue1',
        nested: {
          key2: 'newValue2',
          key3: 'newValue3',
          dstColumnPath: 'oldValue4',
        },
      };
      expect(obj).toEqual(expected);
    });
  });

  describe('clearEntityMapping', () => {
    it('should clear entity mapping', () => {
      const entityMapping: any = {
        columns: [{}, {}],
        functionalMappings: [{}, {}],
        columnPathsForUniqueCheck: ['path1', 'path2']
      };
      HelperMapper.clearEntityMapping(entityMapping);
      expect(entityMapping.columns.length).toBe(0);
      expect(entityMapping.functionalMappings.length).toBe(0);
      expect(entityMapping.columnPathsForUniqueCheck.length).toBe(0);
    });
  });

  describe('checkIfPathNotExist function', () => {
    it('returns false if notExistRelations is empty', () => {
      const allSelectedRelations = [
        { column: { jsonPath: 'path1' } },
        { column: { jsonPath: 'path2' } },
      ];
      const notExistRelations = [];

      const result = HelperMapper.checkIfPathNotExist(allSelectedRelations, notExistRelations);

      expect(result).toBe(false);
    });

    it('returns true if any notExistRelations path matches an existing path', () => {
      const allSelectedRelations = [
        { column: { jsonPath: 'path1' } },
        { column: { jsonPath: 'path2' } },
      ];
      const notExistRelations = [
        { column: { jsonPath: 'path1' } },
        { column: { jsonPath: 'path3' } },
      ];

      const result = HelperMapper.checkIfPathNotExist(allSelectedRelations, notExistRelations);

      expect(result).toBe(true);
    });

    it('returns false if none of the notExistRelations paths match any existing path', () => {
      const allSelectedRelations = [
        { column: { jsonPath: 'path1' } },
        { column: { jsonPath: 'path2' } },
      ];
      const notExistRelations = [
        { column: { jsonPath: 'path3' } },
        { column: { jsonPath: 'path4' } },
      ];

      const result = HelperMapper.checkIfPathNotExist(allSelectedRelations, notExistRelations);

      expect(result).toBe(false);
    });
  });

  describe('getJsonPathForEntityMapping function', () => {
    it('returns the jsonPath when a matching relation is found', () => {
      const entityMapping:any = {
        cobiPathsRelations: [
          { srcColumnPath: 'srcPath1', dstColumnPath: 'dstPath1', jsonPath: 'jsonPath1' },
          { srcColumnPath: 'srcPath2', dstColumnPath: 'dstPath2', jsonPath: 'jsonPath2' },
        ],
      };
      const srcColumnPath:any = 'srcPath1';
      const dstColumnPath:any = 'dstPath1';
      const result = HelperMapper.getJsonPathForEntityMapping(entityMapping, srcColumnPath, dstColumnPath);
      expect(result).toBe('jsonPath1');
    });
  });

  describe('getAllDataRelationsForSelectedEntity function', () => {
    const allDataRelations = [
      { id: { uiId: 1 } },
      { id: { uiId: 2 } },
      { id: { uiId: 1 } },
    ];

    const selectedEntityMapping = { id: { uiId: 1 } };

    it('returns an array of data relations for the selected entity', () => {
      const result = HelperMapper.getAllDataRelationsForSelectedEntity(allDataRelations, selectedEntityMapping);
      const expectedDataRelations = [
        { id: { uiId: 1 } },
        { id: { uiId: 1 } },
      ];
      expect(result).toEqual(expectedDataRelations);
    });

    it('returns an empty array when no data relations match the selected entity', () => {
      const result = HelperMapper.getAllDataRelationsForSelectedEntity(allDataRelations, { id: { uiId: 3 } });
      expect(result).toEqual([]);
    });
  });

  describe('computePathByKey function', () => {
    it('returns the computed path with the key', () => {
      const key = 'data';
      const path = 'root';
      const parentTypeOfData = 'object';
      const dataType = 'JSON';

      const result = HelperMapper.computePathByKey(key, path, parentTypeOfData, dataType);
      expect(result).toEqual('root/data');
    });

    it('returns the computed path with the key when dataType is XML', () => {
      const key = '#text';
      const path = 'root/element';
      const parentTypeOfData = 'object';
      const dataType = 'XML';

      const result = HelperMapper.computePathByKey(key, path, parentTypeOfData, dataType);
      expect(result).toEqual('root/element');
    });

    it('returns the computed path without the key when dataType is XML and key is #text', () => {
      const key = '#text';
      const path = 'root/element/';
      const parentTypeOfData = 'object';
      const dataType = 'XML';

      const result = HelperMapper.computePathByKey(key, path, parentTypeOfData, dataType);
      expect(result).toEqual('root/element/');
    });

    it('returns the computed path without the key when dataType is XML and key is #text without trailing slash', () => {
      const key = '#text';
      const path = 'root/element';
      const parentTypeOfData = 'object';
      const dataType = 'XML';

      const result = HelperMapper.computePathByKey(key, path, parentTypeOfData, dataType);
      expect(result).toEqual('root/element');
    });
  });

});
