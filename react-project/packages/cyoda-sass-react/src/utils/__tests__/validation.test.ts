import { describe, it, expect } from 'vitest';
import {
  validateFieldName,
  validateSchemaName,
  validateTableName,
  toLowerCaseField,
  getTimeFromUuid,
} from '../validation';

describe('validation utilities', () => {
  describe('validateFieldName', () => {
    it('should return false for valid field names', () => {
      expect(validateFieldName('valid_field')).toBe(false);
      expect(validateFieldName('field123')).toBe(false);
      expect(validateFieldName('_field')).toBe(false);
      expect(validateFieldName('a')).toBe(false);
    });

    it('should return error message for invalid field names', () => {
      expect(validateFieldName('123field')).toBeTruthy();
      expect(validateFieldName('Field-Name')).toBeTruthy();
      expect(validateFieldName('field name')).toBeTruthy();
      expect(validateFieldName('FIELD')).toBeTruthy();
      expect(validateFieldName('field-name')).toBeTruthy();
    });

    it('should return false for empty string', () => {
      expect(validateFieldName('')).toBe(false);
    });

    it('should validate field names with maximum length', () => {
      const validLongName = 'a' + '_'.repeat(127);
      expect(validateFieldName(validLongName)).toBe(false);
      
      const tooLongName = 'a' + '_'.repeat(128);
      expect(validateFieldName(tooLongName)).toBeTruthy();
    });
  });

  describe('validateSchemaName', () => {
    it('should return undefined for valid schema names', () => {
      expect(validateSchemaName('valid_schema')).toBeUndefined();
      expect(validateSchemaName('schema123')).toBeUndefined();
    });

    it('should return error message for invalid schema names', () => {
      expect(validateSchemaName('123schema')).toBeTruthy();
      expect(validateSchemaName('Schema-Name')).toBeTruthy();
    });
  });

  describe('validateTableName', () => {
    it('should return undefined for unique table names', () => {
      const tables = [
        { tableName: 'table1', hidden: false },
        { tableName: 'table2', hidden: false },
      ];
      expect(validateTableName('table1', tables)).toBeUndefined();
    });

    it('should return error for duplicate table names', () => {
      const tables = [
        { tableName: 'table1', hidden: false },
        { tableName: 'table1', hidden: false },
      ];
      expect(validateTableName('table1', tables)).toBe('The "Table Name" field must be unique');
    });

    it('should ignore hidden tables in uniqueness check', () => {
      const tables = [
        { tableName: 'table1', hidden: false },
        { tableName: 'table1', hidden: true },
      ];
      expect(validateTableName('table1', tables)).toBeUndefined();
    });

    it('should validate regex for table names', () => {
      const tables = [{ tableName: 'Table1', hidden: false }];
      expect(validateTableName('Table1', tables)).toBeTruthy();
    });
  });

  describe('toLowerCaseField', () => {
    it('should convert string to lowercase', () => {
      expect(toLowerCaseField('FIELD')).toBe('field');
      expect(toLowerCaseField('Field')).toBe('field');
      expect(toLowerCaseField('field')).toBe('field');
    });

    it('should handle numbers', () => {
      expect(toLowerCaseField('123')).toBe('123');
    });

    it('should handle mixed case', () => {
      expect(toLowerCaseField('FieldName123')).toBe('fieldname123');
    });
  });

  describe('getTimeFromUuid', () => {
    it('should extract timestamp from UUID v1', () => {
      // UUID v1 example: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
      const uuid = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      const timestamp = getTimeFromUuid(uuid);
      expect(timestamp).toBeGreaterThan(0);
      expect(typeof timestamp).toBe('number');
    });

    it('should return current time for invalid UUID', () => {
      const beforeTime = Date.now();
      const timestamp = getTimeFromUuid('invalid-uuid');
      const afterTime = Date.now();
      
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should handle UUID with wrong format', () => {
      const timestamp = getTimeFromUuid('not-a-uuid');
      expect(timestamp).toBeGreaterThan(0);
    });
  });
});

