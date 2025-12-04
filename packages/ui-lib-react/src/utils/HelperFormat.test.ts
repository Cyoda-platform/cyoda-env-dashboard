/**
 * HelperFormat Tests
 */

import { describe, it, expect } from 'vitest';
import { HelperFormat } from './HelperFormat';

describe('HelperFormat', () => {
  describe('shortNamePath', () => {
    it('should shorten path with @ and # separators', () => {
      const path = 'values@org#cyoda#gs#jsondb#JsonObjectValues.strings.[#name]';
      const result = HelperFormat.shortNamePath(path);
      expect(result).toBe('values.strings.[#name]');
    });

    it('should handle nested array paths with class names', () => {
      const path = 'changeLog.[*]@com#cyoda#tdb#model#metadata#ModelChangeLogEntry.changes.[*]';
      const result = HelperFormat.shortNamePath(path);
      expect(result).toBe('changeLog.[*].changes.[*]');
    });

    it('should return the same path if it does not contain @ separator', () => {
      const path = 'values.strings.[#name]';
      const result = HelperFormat.shortNamePath(path);
      expect(result).toBe('values.strings.[#name]');
    });

    it('should handle simple paths without special characters', () => {
      const path = 'changeLog.[*].changes.[*]';
      const result = HelperFormat.shortNamePath(path);
      expect(result).toBe('changeLog.[*].changes.[*]');
    });

    it('should handle null and undefined', () => {
      expect(HelperFormat.shortNamePath(null)).toBe('');
      expect(HelperFormat.shortNamePath(undefined)).toBe('');
    });

    it('should handle empty string', () => {
      expect(HelperFormat.shortNamePath('')).toBe('');
    });

    it('should handle multiple @ separators', () => {
      const path = 'root@com#example#Class1.field1@com#example#Class2.field2';
      const result = HelperFormat.shortNamePath(path);
      expect(result).toBe('root.field1.field2');
    });
  });

  describe('toLowerCase', () => {
    it('should convert string to lowercase', () => {
      expect(HelperFormat.toLowerCase('HELLO')).toBe('hello');
      expect(HelperFormat.toLowerCase('Hello World')).toBe('hello world');
    });

    it('should handle null and undefined', () => {
      expect(HelperFormat.toLowerCase(null)).toBe('');
      expect(HelperFormat.toLowerCase(undefined)).toBe('');
    });
  });

  describe('toUpperCase', () => {
    it('should convert string to uppercase', () => {
      expect(HelperFormat.toUpperCase('hello')).toBe('HELLO');
      expect(HelperFormat.toUpperCase('Hello World')).toBe('HELLO WORLD');
    });

    it('should handle null and undefined', () => {
      expect(HelperFormat.toUpperCase(null)).toBe('');
      expect(HelperFormat.toUpperCase(undefined)).toBe('');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const longString = 'This is a very long string that should be truncated';
      expect(HelperFormat.truncate(longString, 20)).toBe('This is a very long ...');
    });

    it('should not truncate short strings', () => {
      expect(HelperFormat.truncate('Short', 20)).toBe('Short');
    });

    it('should handle null and undefined', () => {
      expect(HelperFormat.truncate(null)).toBe('');
      expect(HelperFormat.truncate(undefined)).toBe('');
    });
  });
});

