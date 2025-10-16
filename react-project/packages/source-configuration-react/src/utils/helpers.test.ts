/**
 * Tests for helper utilities
 */

import { describe, it, expect } from 'vitest';
import {
  formatDate,
  setColumnProp,
  getMapperDisplayName,
  isValidXPath,
  isValidJdbcUrl,
  validateConfig,
} from './helpers';

describe('Helper utilities', () => {
  describe('formatDate', () => {
    it('should format date string', () => {
      const date = '2024-01-15T10:30:00Z';
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should return original string for invalid date', () => {
      const invalidDate = 'invalid-date';
      const formatted = formatDate(invalidDate);
      expect(formatted).toBe(invalidDate);
    });
  });

  describe('setColumnProp', () => {
    it('should convert column name to valid property', () => {
      expect(setColumnProp('First Name')).toBe('first_name');
      expect(setColumnProp('Email-Address')).toBe('email_address');
      expect(setColumnProp('User.ID')).toBe('user_id');
      expect(setColumnProp('Column123')).toBe('column123');
    });

    it('should handle special characters', () => {
      expect(setColumnProp('Column@#$%')).toBe('column____');
      expect(setColumnProp('Test (Value)')).toBe('test__value_');
    });
  });

  describe('getMapperDisplayName', () => {
    it('should extract mapper class name', () => {
      expect(getMapperDisplayName('com.cyoda.mapper$DateMapper')).toBe('DateMapper');
      expect(getMapperDisplayName('com.cyoda.mapper$StringMapper')).toBe('StringMapper');
    });

    it('should return full name if no $ separator', () => {
      expect(getMapperDisplayName('SimpleMapper')).toBe('SimpleMapper');
    });

    it('should return empty string for empty input', () => {
      expect(getMapperDisplayName('')).toBe('');
    });
  });

  describe('isValidXPath', () => {
    it('should validate XPath expressions', () => {
      expect(isValidXPath('/root/element')).toBe(true);
      expect(isValidXPath('//element')).toBe(true);
      expect(isValidXPath('/root/element[@id="1"]')).toBe(true);
    });

    it('should reject invalid XPath', () => {
      expect(isValidXPath('root/element')).toBe(false);
      expect(isValidXPath('element')).toBe(false);
      expect(isValidXPath('')).toBe(false);
    });
  });

  describe('isValidJdbcUrl', () => {
    it('should validate JDBC URLs', () => {
      expect(isValidJdbcUrl('jdbc:mysql://localhost:3306/db')).toBe(true);
      expect(isValidJdbcUrl('jdbc:postgresql://localhost/db')).toBe(true);
      expect(isValidJdbcUrl('jdbc:oracle:thin:@localhost:1521:db')).toBe(true);
    });

    it('should reject invalid JDBC URLs', () => {
      expect(isValidJdbcUrl('mysql://localhost:3306/db')).toBe(false);
      expect(isValidJdbcUrl('http://localhost')).toBe(false);
      expect(isValidJdbcUrl('')).toBe(false);
    });
  });

  describe('validateConfig', () => {
    it('should validate CSV config', () => {
      const config = {
        name: 'Test Config',
        fileType: 'CSV',
        columnMappingConfigs: [
          {
            csvColumnName: 'Name',
            dstAliasName: 'name',
          },
        ],
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject config without name', () => {
      const config = {
        name: '',
        fileType: 'CSV',
        columnMappingConfigs: [],
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Configuration name is required');
    });

    it('should reject config without column mappings', () => {
      const config = {
        name: 'Test',
        fileType: 'CSV',
        columnMappingConfigs: [],
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one column mapping is required');
    });

    it('should reject XML config without base XPath', () => {
      const config = {
        name: 'Test',
        fileType: 'XML',
        columnMappingConfigs: [
          {
            xmlColumnName: 'Name',
            xmlColumnXPath: '/name',
          },
        ],
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Base XPath is required for XML configurations');
    });

    it('should reject JDBC config without SQL', () => {
      const config = {
        name: 'Test',
        srcSql: '',
        columnMappingConfigs: [
          {
            srcColumnName: 'id',
            srcColumnType: 'INTEGER',
          },
        ],
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('SQL query is required for JDBC configurations');
    });
  });
});

