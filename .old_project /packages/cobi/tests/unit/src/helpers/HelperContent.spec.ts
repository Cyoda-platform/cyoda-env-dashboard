import HelperContent from "../../../../src/helpers/HelperContent";
import {ElMessage} from 'element-plus';
import type {EntityMappingConfigDto, MappingConfigDto} from "../../../../src/components/DataMapper/MappingConfigDto";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

describe('HelperContent', () => {
  describe('isJsonValid', () => {
    it('should return true for valid JSON', () => {
      const validJson = '{"key":"value"}';
      const result = HelperContent.isJsonValid(validJson);
      expect(result).toBeTruthy();
    });

    it('should return false for invalid JSON', () => {
      const invalidJson = '{"key":"value",}';
      const result = HelperContent.isJsonValid(invalidJson);
      expect(result).toBeFalsy();
    });
  });

  describe('isXmlValid', () => {
    it('should return true for valid XML', () => {
      const validXml = `<xml><tag>value</tag></xml>`;
      const result = HelperContent.isXmlValid(validXml);
      expect(result).toBeTruthy();
    });

    it('should return false for invalid XML', () => {
      const invalidXml = `<xml><tag>value</xml>`;
      const result = HelperContent.isXmlValid(invalidXml);
      expect(result).toBeFalsy();
    });
  });

  describe('isCsvValid', () => {
    it('should return true for valid CSV', () => {
      const validCSV = 'key1;key2';
      const result = HelperContent.isCsvValid(validCSV);
      expect(result).toBeTruthy();
    });
  });

  describe('compactContent', () => {
    const jsonContent = '{"key": "value"}';
    const xmlContent = `<root> <element>value</element> </root>`;
    const textContent = 'plain text';

    it('returns compacted JSON for JSON data type', () => {
      const dataMappingConfigDto = {dataType: 'JSON'};
      // @ts-ignore
      const compactedJson = HelperContent.compactContent(jsonContent, dataMappingConfigDto);
      expect(compactedJson).toBe(JSON.stringify(JSON.parse(jsonContent)));
    });

    it('returns compacted XML for XML data type', () => {
      const dataMappingConfigDto = {dataType: 'XML'};
      // @ts-ignore
      const compactedXml = HelperContent.compactContent(xmlContent, dataMappingConfigDto);
      expect(compactedXml).toBe('<root><element>value</element></root>');
    });

    it('returns original content for other data types', () => {
      const dataMappingConfigDto = {dataType: 'CSV'};
      // @ts-ignore
      const compactedText = HelperContent.compactContent(textContent, dataMappingConfigDto);
      expect(compactedText).toBe(textContent);
    });
  });

  describe('getPlaceholdersFromString', () => {
    it('should return an array of placeholders from the string', () => {
      const str = 'This is a ${placeholder} string with ${multiple} placeholders.';
      const result = HelperContent.getPlaceholdersFromString(str);
      expect(result).toEqual(['placeholder', 'multiple']);
    });

    it('should return an empty array when no placeholders are present', () => {
      const str = 'This is a normal string without placeholders.';
      const result = HelperContent.getPlaceholdersFromString(str);
      expect(result).toEqual([]);
    });
  });


  describe('prettyContent', () => {
    it('should pretty print JSON content', () => {
      const input = '{"key": "value"}';
      const result = HelperContent.prettyContent(input, 'json');
      expect(result).toEqual('{\n  "key": "value"\n}');
    });

    it('should pretty print XML content', () => {
      const input = '<root><item>content</item></root>';
      const result = HelperContent.prettyContent(input, 'xml');
      expect(result).toEqual('<root>\n  <item>content</item>\n</root>');
    });

    it('should not modify content for unknown type', () => {
      const input = 'some content';
      const result = HelperContent.prettyContent(input);
      expect(result).toEqual(input);
    });
  });

  describe('getFileType', () => {
    it('should return "json" for valid JSON content', () => {
      const input = '{"key": "value"}';
      const result = HelperContent.getFileType(input);
      expect(result).toBe('json');
    });

    it('should return "xml" for valid XML content', () => {
      const input = '<root><item>content</item></root>';
      const result = HelperContent.getFileType(input);
      expect(result).toBe('xml');
    });

    it('should return "text" for unknown content', () => {
      const input = 'some content';
      const result = HelperContent.getFileType(input);
      expect(result).toBe('text');
    });
  });

  describe('getPlaceholdersFromString', () => {
    it('should extract placeholders from a string', () => {
      const query = 'Hello ${name}, your email is ${email}';
      const result = HelperContent.getPlaceholdersFromString(query);
      expect(result).toEqual(['name', 'email']);
    });

    it('should return an empty array for an empty string', () => {
      const query = '';
      const result = HelperContent.getPlaceholdersFromString(query);
      expect(result).toEqual([]);
    });

    it('should return an empty array for no placeholders', () => {
      const query = 'This is a regular string';
      const result = HelperContent.getPlaceholdersFromString(query);
      expect(result).toEqual([]);
    });
  });

  describe('getPlaceholdersFromSqlString', () => {
    it('should extract placeholders from an SQL string', () => {
      const query = 'SELECT * FROM users WHERE username = :username AND email = :email';
      const result = HelperContent.getPlaceholdersFromSqlString(query);
      expect(result).toEqual(['username', 'email']);
    });

    it('should return an empty array for an empty string', () => {
      const query = '';
      const result = HelperContent.getPlaceholdersFromSqlString(query);
      expect(result).toEqual([]);
    });

    it('should return an empty array for no placeholders', () => {
      const query = 'SELECT * FROM users';
      const result = HelperContent.getPlaceholdersFromSqlString(query);
      expect(result).toEqual([]);
    });
  });

  describe('getSourceData', () => {

    beforeAll(() => {
      eventBus.$emit=vi.fn();
      ElMessage.error = vi.fn();
      vi.useFakeTimers();
    });

    it('getSourceData returns parsed JSON for valid JSON content', () => {
      const sampleContent = '{"key": "value"}';
      const dataMappingConfigDto: any = {dataType: 'JSON', parserParameters: {}};

      const result = HelperContent.getSourceData(sampleContent, dataMappingConfigDto);

      expect(result.key).toEqual('value');
    });

    it('getSourceData returns parsed JSON for valid BINARY_DOC content', () => {
      const sampleContent = '{"key": "value"}';
      const dataMappingConfigDto: any = {dataType: 'BINARY_DOC', parserParameters: {}};

      const result = HelperContent.getSourceData(sampleContent, dataMappingConfigDto);

      expect(result.key).toEqual('value');
    });


    it('should handle XML data type', () => {
      const sampleContent = '<root><key>value</key></root>';
      const dataMappingConfigDto: any = {dataType: 'XML', parserParameters: {}};

      const result = HelperContent.getSourceData(sampleContent, dataMappingConfigDto);

      expect(result.root).toEqual({key: 'value'});
    });

    it('should handle CSV data type', () => {
      const sampleContent = "test1,test2\nval1,val2";
      const dataMappingConfigDto: any = {
        dataType: 'CSV',
        parserParameters: {headers: []},
        sampleContent,
      };

      const result = HelperContent.getSourceData(sampleContent, dataMappingConfigDto);

      expect(result).toEqual([{'0': 'test1', '1': 'test2'}, {'0': 'val1', '1': 'val2'}]);
    });

    it('should handle empty data', () => {
      const sampleContent = "";
      const dataMappingConfigDto: any = {
        dataType: 'JSON',
        parserParameters: {headers: []},
        sampleContent,
      };

      const result = HelperContent.getSourceData(sampleContent, dataMappingConfigDto);

      expect(result).toEqual({});
    });
  });

  describe('buildXml', () => {
    it('test XML from object', () => {
      const result = HelperContent.buildXml({"key": "value"});
      expect(result).toEqual('<key>value</key>');
    });
  });

  describe('parseXml', () => {
    it('parse XML to object', () => {
      const result = HelperContent.parseXml('<key>value</key>');
      expect(result).toEqual({key: 'value'});
    });
  });

  describe('transformJsonWithAttributesToCyodaFormat', () => {
    it('should transform JSON object with attributes', () => {
      const input = {
        name: 'John',
        age: 30,
        '#text': 'Some text content',
        attributes: {
          attribute1: 'value1',
          attribute2: 'value2'
        },
        nested: {
          prop: 'value',
          '#text': 'Nested text content'
        }
      };

      const expectedOutput = {
        "#text": "Some text content",
        "age": 30,
        "attributes": {
          "attribute1": "value1",
          "attribute2": "value2"
        },
        "name": "John",
        "nested": "Nested text content"
      };

      const result = HelperContent.transformJsonWithAttributesToCyodaFormat(input);

      expect(result).toEqual(expectedOutput);
    });

    it('should transform nested JSON object with attributes', () => {
      const input = {
        parent: {
          child: {
            '#text': 'Text content',
            attributes: {
              attribute1: 'value1'
            }
          }
        }
      };

      const expectedOutput = {
        "parent": {
          "child": "Text content"
        }
      };

      const result = HelperContent.transformJsonWithAttributesToCyodaFormat(input);

      expect(result).toEqual(expectedOutput);
    });
  });

  describe('transformEnumToOption', () => {
    it('should transform enum array to options', () => {
      const input = ['apple', 'banana', 'orange'];

      const expectedOutput = [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'orange', label: 'Orange' }
      ];

      const result = HelperContent.transformEnumToOption(input);

      expect(result).toEqual(expectedOutput);
    });

    it('should transform enum array with mixed case to options', () => {
      const input = ['RED', 'Green', 'BLUE'];

      const expectedOutput = [
        { value: 'RED', label: 'Red' },
        { value: 'Green', label: 'Green' },
        { value: 'BLUE', label: 'Blue' }
      ];

      const result = HelperContent.transformEnumToOption(input);

      expect(result).toEqual(expectedOutput);
    });
  });

  describe('getAllErrorMessagesFromForm', () => {
    it('should return all error messages from form fields', () => {
      const form = {
        fields: [
          { validateState: 'error', message: 'Error 1' },
          { validateState: 'error', message: 'Error 2' },
          { validateState: 'error', message: 'Error 3' }
        ]
      };

      const expectedOutput = ['Error 1', 'Error 2', 'Error 3'];

      const result = HelperContent.getAllErrorMessagesFromForm(form);

      expect(result).toEqual(expectedOutput);
    });

    it('should return an empty array if form is falsy', () => {
      const form = null;

      const result = HelperContent.getAllErrorMessagesFromForm(form);

      expect(result).toEqual([]);
    });
  });

  describe('escapeRegExp', () => {
    it('should escape special characters in the string', () => {
      const input = '.*+?^${}()|[]\\';

      const expectedOutput = '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\';

      const result = HelperContent.escapeRegExp(input);

      expect(result).toEqual(expectedOutput);
    });

    it('should escape special characters only', () => {
      const input = 'Hello world!';

      const result = HelperContent.escapeRegExp(input);

      expect(result).toEqual('Hello world!');
    });
  });

  describe('parseCsv', () => {
    it('should parse CSV content with provided configuration', () => {
      const dataMappingConfigDto:any = {
        sampleContent: 'name,age\nJohn,30\nAlice,25\nBob,28\n',
        parserParameters: {
          withHeader: true,
          delimiter: ',',
          quoteChar: '"'
        }
      };

      const expectedOutput = [
        { name: 'John', age: '30' },
        { name: 'Alice', age: '25' },
        { name: 'Bob', age: '28' }
      ];

      const result = HelperContent.parseCsv(dataMappingConfigDto);

      expect(result).toEqual(expectedOutput);
    });

    it('should use default delimiter and quoteChar if not provided', () => {
      const dataMappingConfigDto:any = {
        sampleContent: 'name,age\nJohn,30\nAlice,25\nBob,28\n',
        parserParameters: {
          withHeader: true
        }
      };

      const expectedOutput = [
        { name: 'John', age: '30' },
        { name: 'Alice', age: '25' },
        { name: 'Bob', age: '28' }
      ];

      const result = HelperContent.parseCsv(dataMappingConfigDto);

      expect(result).toEqual(expectedOutput);
    });
  });

  describe('stringifyCsv', () => {
    it('should stringify data to CSV with provided configuration', () => {
      const dataMappingConfigDto:any = {
        parserParameters: {
          withHeader: true,
          delimiter: ',',
          quoteChar: '"'
        }
      };

      const data = [
        { name: 'John', age: '30' },
        { name: 'Alice', age: '25' },
        { name: 'Bob', age: '28' }
      ];

      const expectedOutput = 'name,age\nJohn,30\nAlice,25\nBob,28\n';

      const result = HelperContent.stringifyCsv(dataMappingConfigDto, data);

      expect(result).toEqual(expectedOutput);
    });

    it('should use default delimiter and quoteChar if not provided', () => {
      const dataMappingConfigDto:any = {
        parserParameters: {
          withHeader: true
        }
      };

      const data = [
        { name: 'John', age: '30' },
        { name: 'Alice', age: '25' },
        { name: 'Bob', age: '28' }
      ];

      const expectedOutput = 'name,age\nJohn,30\nAlice,25\nBob,28\n';

      const result = HelperContent.stringifyCsv(dataMappingConfigDto, data);

      expect(result).toEqual(expectedOutput);
    });
  });

  describe('getDataMappingDataForConfirm', () => {
    it('should return formatted data mapping configuration for confirmation', () => {
      const dataMappingConfigDto:any = {
        entityMappings: [
          {
            id: { uiId: '123' },
            functionalMappings: [
              { metaPaths: [] },
            ]
          },
        ]
      };

      const expectedOutput = JSON.stringify({
        entityMappings: [
          {
            id: {},
            functionalMappings: [
              {},
            ]
          },
        ]
      }, null, 2);

      const result = HelperContent.getDataMappingDataForConfirm(dataMappingConfigDto);

      expect(result).toEqual(expectedOutput);
    });
  });
});
