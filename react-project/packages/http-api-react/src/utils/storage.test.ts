/**
 * Tests for HelperStorage
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HelperStorage } from './storage';

describe('HelperStorage', () => {
  let storage: HelperStorage;

  beforeEach(() => {
    storage = new HelperStorage('test_');
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve a string value', () => {
      storage.set('key1', 'value1');
      expect(storage.get('key1')).toBe('value1');
    });

    it('should store and retrieve an object', () => {
      const obj = { name: 'test', value: 123 };
      storage.set('obj', obj);
      expect(storage.get('obj')).toEqual(obj);
    });

    it('should store and retrieve an array', () => {
      const arr = [1, 2, 3, 4, 5];
      storage.set('arr', arr);
      expect(storage.get('arr')).toEqual(arr);
    });

    it('should return null for non-existent key', () => {
      expect(storage.get('nonexistent')).toBeNull();
    });

    it('should return default value for non-existent key', () => {
      expect(storage.get('nonexistent', 'default')).toBe('default');
    });

    it('should handle complex nested objects', () => {
      const complex = {
        user: {
          name: 'John',
          roles: ['admin', 'user'],
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
      };
      storage.set('complex', complex);
      expect(storage.get('complex')).toEqual(complex);
    });
  });

  describe('remove', () => {
    it('should remove a stored value', () => {
      storage.set('key1', 'value1');
      expect(storage.get('key1')).toBe('value1');
      
      storage.remove('key1');
      expect(storage.get('key1')).toBeNull();
    });

    it('should not throw when removing non-existent key', () => {
      expect(() => storage.remove('nonexistent')).not.toThrow();
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      storage.set('key1', 'value1');
      expect(storage.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(storage.has('nonexistent')).toBe(false);
    });

    it('should return false after removing a key', () => {
      storage.set('key1', 'value1');
      storage.remove('key1');
      expect(storage.has('key1')).toBe(false);
    });
  });

  describe('keys', () => {
    it('should return all keys with prefix', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');
      storage.set('key3', 'value3');

      const keys = storage.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
      expect(keys.length).toBe(3);
    });

    it('should return empty array when no keys exist', () => {
      expect(storage.keys()).toEqual([]);
    });

    it('should not return keys from other prefixes', () => {
      const otherStorage = new HelperStorage('other_');
      
      storage.set('key1', 'value1');
      otherStorage.set('key2', 'value2');

      const keys = storage.keys();
      expect(keys).toContain('key1');
      expect(keys).not.toContain('key2');
      expect(keys.length).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all keys with prefix', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');
      storage.set('key3', 'value3');

      storage.clear();

      expect(storage.keys()).toEqual([]);
      expect(storage.get('key1')).toBeNull();
      expect(storage.get('key2')).toBeNull();
      expect(storage.get('key3')).toBeNull();
    });

    it('should not clear keys from other prefixes', () => {
      const otherStorage = new HelperStorage('other_');
      
      storage.set('key1', 'value1');
      otherStorage.set('key2', 'value2');

      storage.clear();

      expect(storage.get('key1')).toBeNull();
      expect(otherStorage.get('key2')).toBe('value2');
    });
  });

  describe('prefix handling', () => {
    it('should use default prefix', () => {
      const defaultStorage = new HelperStorage();
      defaultStorage.set('key1', 'value1');
      
      // Check that it's stored with the default prefix
      expect(localStorage.getItem('cyoda_key1')).toBeTruthy();
    });

    it('should use custom prefix', () => {
      const customStorage = new HelperStorage('custom_');
      customStorage.set('key1', 'value1');
      
      // Check that it's stored with the custom prefix
      expect(localStorage.getItem('custom_key1')).toBeTruthy();
    });

    it('should isolate storage between different prefixes', () => {
      const storage1 = new HelperStorage('prefix1_');
      const storage2 = new HelperStorage('prefix2_');

      storage1.set('key', 'value1');
      storage2.set('key', 'value2');

      expect(storage1.get('key')).toBe('value1');
      expect(storage2.get('key')).toBe('value2');
    });
  });

  describe('error handling', () => {
    it('should handle JSON parse errors gracefully', () => {
      // Manually set invalid JSON
      localStorage.setItem('test_invalid', 'invalid json {');
      
      expect(storage.get('invalid')).toBeNull();
    });

    it('should handle null values', () => {
      storage.set('null', null);
      expect(storage.get('null')).toBeNull();
    });

    it('should handle undefined values', () => {
      storage.set('undefined', undefined);
      // undefined gets serialized to null in JSON
      expect(storage.get('undefined')).toBeNull();
    });
  });

  describe('type safety', () => {
    it('should preserve number types', () => {
      storage.set('number', 42);
      expect(storage.get('number')).toBe(42);
      expect(typeof storage.get('number')).toBe('number');
    });

    it('should preserve boolean types', () => {
      storage.set('bool', true);
      expect(storage.get('bool')).toBe(true);
      expect(typeof storage.get('bool')).toBe('boolean');
    });

    it('should preserve null type', () => {
      storage.set('null', null);
      expect(storage.get('null')).toBeNull();
    });
  });
});

