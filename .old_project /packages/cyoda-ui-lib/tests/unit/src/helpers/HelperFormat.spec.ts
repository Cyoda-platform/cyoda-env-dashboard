import { describe, it, expect, vi } from 'vitest';
import moment from 'moment';
import _ from 'lodash';
import HelperFormat from '../../../../src/helpers/HelperFormat';

vi.mock('moment', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => 'mocked-date'),
  })),
}));

describe('HelperFormat', () => {
  describe('getTimeFromMomentDuration', () => {
    it('should format time from moment duration', () => {
      const mockDuration = {
        days: () => 1,
        hours: () => 2,
        minutes: () => 30,
        seconds: () => 45,
        milliseconds: () => 500,
      };

      const result = HelperFormat.getTimeFromMomentDuration(mockDuration);
      expect(result).toBe('1d 2h 30m 45s 500ms');
    });
  });

  describe('getAbColumnType', () => {
    it('should return correct column type for java types', () => {
      expect(HelperFormat.getAbColumnType('java.lang.String')).toBe('abColDefString');
      expect(HelperFormat.getAbColumnType('int')).toBe('abColDefNumber');
      expect(HelperFormat.getAbColumnType('java.time.LocalDate')).toBe('abColDefDate');
      expect(HelperFormat.getAbColumnType('boolean')).toBe('abColDefBoolean');
      expect(HelperFormat.getAbColumnType('unknown')).toBe('abColDefString');
    });
  });

  describe('getTimeZone', () => {
    it('should return the correct timezone offset', () => {
      const result = HelperFormat.getTimeZone();
      expect(result).toMatch(/^[+-]\d{2}:\d{2}$/);
    });
  });

  describe('dateFormat', () => {
    it('should return the correct date format', () => {
      expect(HelperFormat.dateFormat()).toBe('yyyy-MM-dd[T]HH:mm:ss[.000]');
    });
  });

  describe('isJson', () => {
    it('should detect JSON strings', () => {
      expect(HelperFormat.isJson('{"key": "value"}')).toBe(true);
      expect(HelperFormat.isJson('{invalid}')).toBe(false);
      expect(HelperFormat.isJson(null)).toBe(false);
    });
  });


  describe('shortNamePath', () => {
    it('should shorten name paths', () => {
      expect(HelperFormat.shortNamePath('values@org#cyoda#gs#jsondb#JsonObjectValues.strings.[#name]')).toBe('values.strings.[#name]');
      expect(HelperFormat.shortNamePath('simple.path')).toBe('simple.path');
    });
  });


  describe('getValue', () => {
    it('should return correct values for input', () => {
      expect(HelperFormat.getValue(false)).toBe('false');
      expect(HelperFormat.getValue(null)).toBe('-');
      expect(HelperFormat.getValue('test')).toBe('test');
    });
  });

  describe('number', () => {
    it('should format numbers with commas', () => {
      expect(HelperFormat.number('1234567.89')).toBe('1,234,567.89');
      expect(HelperFormat.number('0')).toBe('0');
      expect(HelperFormat.number('invalid')).toBe('invalid');
    });
  });

  describe('date', () => {
    it('should format dates using moment', () => {
      expect(HelperFormat.date('2023-01-01T12:00:00Z')).toBe('mocked-date');
    });
  });

  describe('toLowerCase', () => {
    it('should convert strings to lowercase with formatting', () => {
      expect(HelperFormat.toLowerCase('TEST_STRING')).toBe('Test string');
    });
  });

  describe('getTimeFromUuid', () => {
    it('should calculate time from UUID', () => {
      const uuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const result = HelperFormat.getTimeFromUuid(uuid);
      expect(result).toBeGreaterThan(0);
    });
  });
});
