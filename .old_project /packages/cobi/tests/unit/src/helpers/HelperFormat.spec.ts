import HelperFormat from "../../../../src/helpers/HelperFormat";
import moment from 'moment';
import _ from "lodash";

describe('HelperFormat', () => {
  it('should format moment duration to time string', () => {
    const duration = moment.duration({
      days: 2,
      hours: 5,
      minutes: 30,
      seconds: 15,
      milliseconds: 500,
    });
    const expectedTime = '2d 5h 30m 15s 500ms';

    const result = HelperFormat.getTimeFromMomentDuration(duration);

    expect(result).toEqual(expectedTime);
  });

  it('should get appropriate ab column type for java type', () => {
    const javaType = 'java.util.Date';
    const expectedAbColumnType = 'abColDefDate';

    const result = HelperFormat.getAbColumnType(javaType);

    expect(result).toEqual(expectedAbColumnType);
  });

  it('should get current time zone in +/-hh:mm format', () => {
    const offset = new Date().getTimezoneOffset();
    const o = Math.abs(offset);
    const expectedTimeZone = `${offset < 0 ? '+' : '-'}${('00' + Math.floor(o / 60)).slice(-2)}:${('00' + (o % 60)).slice(-2)}`;

    const result = HelperFormat.getTimeZone();

    expect(result).toEqual(expectedTimeZone);
  });

  it('should return date format string', () => {
    const expectedDateFormat = 'yyyy-MM-dd[T]HH:mm:ss[.000]';

    const result = HelperFormat.dateFormat();

    expect(result).toEqual(expectedDateFormat);
  });

  describe('isXml', () => {
    it('should return true for a valid XML string', () => {
      const xmlString = '<?xml version="1.0" encoding="UTF-8"?><root></root>';

      const result = HelperFormat.isXml(xmlString);

      expect(result).toBe(true);
    });

    it('should return false for an invalid XML string', () => {
      const nonXmlString = 'This is not an XML string.';

      const result = HelperFormat.isXml(nonXmlString);

      expect(result).toBe(false);
    });

    it('should return false for an empty string', () => {
      const emptyString = '';

      const result = HelperFormat.isXml(emptyString);

      expect(result).toBe(false);
    });

    it('should return false for a null input', () => {
      const nullInput = null;

      const result = HelperFormat.isXml(nullInput);

      expect(result).toBe(false);
    });
  });

  describe('isJson', () => {
    it('should return true for a valid JSON string', () => {
      const jsonString = '{"key": "value"}';

      const result = HelperFormat.isJson(jsonString);

      expect(result).toBe(true);
    });

    it('should return false for a non-JSON string', () => {
      const nonJsonString = 'This is not a JSON string.';

      const result = HelperFormat.isJson(nonJsonString);

      expect(result).toBe(false);
    });

    it('should return false for an empty string', () => {
      const emptyString = '';

      const result = HelperFormat.isJson(emptyString);

      expect(result).toBe(false);
    });

    it('should return false for an invalid JSON', () => {
      const invalidJson = '{"key":"value",}';

      const result = HelperFormat.isJson(invalidJson);

      expect(result).toBe(false);
    });

    it('should return false for a null input', () => {
      const nullInput = null;

      const result = HelperFormat.isJson(nullInput);

      expect(result).toBe(false);
    });
  });

  describe('isShortDetailTreeItem', () => {
    it('should return true for a short non-XML and non-JSON string', () => {
      const shortString = 'Short description';

      const result = HelperFormat.isShortDetailTreeItem(shortString);

      expect(result).toBe(true);
    });

    it('should return false for a long non-XML and non-JSON string', () => {
      const longString = 'This is a very long description that exceeds 80 characters. This is a very long description that exceeds 80 characters.';

      const result = HelperFormat.isShortDetailTreeItem(longString);

      expect(result).toBe(false);
    });

    it('should return false for a valid JSON string', () => {
      const jsonString = '{"key": "value"}';

      const result = HelperFormat.isShortDetailTreeItem(jsonString);

      expect(result).toBe(false);
    });

    it('should return false for a valid XML string', () => {
      const xmlString = '<?xml version="1.0" encoding="UTF-8"?><root></root>';

      const result = HelperFormat.isShortDetailTreeItem(xmlString);

      expect(result).toBe(false);
    });

    it('should return true for a null input', () => {
      const nullInput = null;

      const result = HelperFormat.isShortDetailTreeItem(nullInput);

      expect(result).toBe(true);
    });

    it('should return true for an undefined input', () => {
      const undefinedInput = undefined;

      const result = HelperFormat.isShortDetailTreeItem(undefinedInput);

      expect(result).toBe(true);
    });
  });

  describe('shortNamePath', () => {
    it('should return a path without "@" and "#" separators', () => {
      const path = 'values@org#cyoda#gs#jsondb#JsonObjectValues.strings.[#name]';

      const result = HelperFormat.shortNamePath(path);

      expect(result).toBe('values.strings.[#name]');
    });

    it('should return the same path if it does not contain "@" and "#" separators', () => {
      const path = 'values.strings.[#name]';

      const result = HelperFormat.shortNamePath(path);

      expect(result).toBe('values.strings.[#name]');
    });
  });

  describe('flatTableRow', () => {
    it('should flatten a row with nested objects and arrays', () => {
      const row = {
        name: 'John',
        age: 30,
        address: {
          city: 'New York',
          state: 'NY',
        },
        hobbies: ['Reading', 'Traveling'],
      };

      const result = HelperFormat.flatTableRow(row);

      expect(result).toEqual({
        "address_city": "New York",
        "address_state": "NY",
        "age": 30,
        "hobbies": "Reading,Traveling",
        "name": "John"
      });
    });

    it('should flatten a row with deeply nested objects and arrays', () => {
      const row = {
        name: 'Alice',
        age: 25,
        contact: {
          email: 'alice@example.com',
          phone: {
            home: '123-456-7890',
            work: '987-654-3210',
          },
        },
        hobbies: [{ name: 'Gardening' }, { name: 'Painting' }],
      };

      const result = HelperFormat.flatTableRow(row);

      expect(result).toEqual({
        "age": 25,
        "contact_email": "alice@example.com",
        "contact_phone_home": "123-456-7890",
        "contact_phone_work": "987-654-3210",
        "hobbies": "Gardening, Painting",
        "name": "Alice"
      });
    });
  });

  describe('getValue', () => {
    it('should return "false" for false boolean value', () => {
      const result = HelperFormat.getValue(false);
      expect(result).toBe('false');
    });

    it('should return "-" for falsy values', () => {
      const emptyValue = HelperFormat.getValue('');
      const nullValue = HelperFormat.getValue(null);
      const undefinedValue = HelperFormat.getValue(undefined);
      const zeroValue = HelperFormat.getValue(0);
      const negativeValue = HelperFormat.getValue(-5);

      expect(emptyValue).toBe('-');
      expect(nullValue).toBe('-');
      expect(undefinedValue).toBe('-');
      expect(zeroValue).toBe('-');
      expect(negativeValue).toBe(-5);
    });

    it('should return the original value for other cases', () => {
      const stringValue = HelperFormat.getValue('Hello');
      const trueValue = HelperFormat.getValue(true);
      const numberValue = HelperFormat.getValue(42);

      expect(stringValue).toBe('Hello');
      expect(trueValue).toBe(true);
      expect(numberValue).toBe(42);
    });
  });

  describe('number', () => {
    it('should format a positive number with commas', () => {
      const result = HelperFormat.number('1234567.89');
      expect(result).toBe('1,234,567.89');
    });

    it('should format a negative number with commas', () => {
      const result = HelperFormat.number('-9876543.21');
      expect(result).toBe('-9,876,543.21');
    });

    it('should format zero as "0"', () => {
      const zeroResultString = HelperFormat.number('0');
      // @ts-ignore
      const zeroResult = HelperFormat.number(0);
      const negativeZeroResult = HelperFormat.number('-0');
      expect(zeroResultString).toBe('0');
      expect(zeroResult).toBe('0');
      expect(negativeZeroResult).toBe('-0');
    });

    it('should return the original string if not a valid number', () => {
      const invalidNumber = HelperFormat.number('abc');
      const emptyString = HelperFormat.number('');
      const undefinedValue = HelperFormat.number(undefined);
      const nullValue = HelperFormat.number(null);

      expect(invalidNumber).toBe('abc');
      expect(emptyString).toBe('');
      expect(undefinedValue).toBeUndefined();
      expect(nullValue).toBeNull();
    });
  });

  describe('date', () => {
    it('should format date and time in DD.MM.YYYY HH:mm format', () => {
      const inputDateTime = '2023-08-21T15:30:00';
      const formattedDateTime = HelperFormat.date(inputDateTime);

      const expectedFormattedDateTime = moment(inputDateTime).format('DD.MM.YYYY HH:mm');
      expect(formattedDateTime).toBe(expectedFormattedDateTime);
    });
  });

  describe('toLowerCase', () => {
    it('should replace underscores with spaces and capitalize the first letter', () => {
      const inputString = 'example_string_for_testing';
      const formattedString = HelperFormat.toLowerCase(inputString);

      const expectedFormattedString = _.capitalize(inputString.replace(/_/g, ' '));
      expect(formattedString).toBe(expectedFormattedString);
    });

    it('should handle empty string', () => {
      const emptyString = '';
      const formattedEmptyString = HelperFormat.toLowerCase(emptyString);

      expect(formattedEmptyString).toBe('');
    });

    it('should handle null and undefined', () => {
      const formattedNull = HelperFormat.toLowerCase(null);
      const formattedUndefined = HelperFormat.toLowerCase(undefined);

      expect(formattedNull).toBe('');
      expect(formattedUndefined).toBe('');
    });
  });

});
