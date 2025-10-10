import { describe, it, expect, beforeEach, vi } from 'vitest';
import HelperStorage from '../../../../src/helpers/HelperStorage';

describe('HelperStorage', () => {
  let helperStorage: HelperStorage;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    // Создаем мок для localStorage
    mockStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: vi.fn((key, value) => {
          mockStorage[key] = value;
        }),
        getItem: vi.fn((key) => mockStorage[key] || null),
        clear: vi.fn(() => {
          mockStorage = {};
        }),
      },
      writable: true,
    });

    // Создаем экземпляр HelperStorage
    helperStorage = new HelperStorage();
  });

  describe('set', () => {
    it('should store a string value', () => {
      helperStorage.set('key', 'value');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('key', 'value');
      expect(mockStorage['key']).toBe('value');
    });

    it('should store an object as a JSON string', () => {
      const obj = { test: 123 };
      helperStorage.set('key', obj);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('key', JSON.stringify(obj));
      expect(mockStorage['key']).toBe(JSON.stringify(obj));
    });
  });

  describe('get', () => {
    it('should retrieve a stored string value', () => {
      mockStorage['key'] = 'value';
      const result = helperStorage.get('key');
      expect(window.localStorage.getItem).toHaveBeenCalledWith('key');
      expect(result).toBe('value');
    });

    it('should retrieve a stored object as an object', () => {
      const obj = { test: 123 };
      mockStorage['key'] = JSON.stringify(obj);
      const result = helperStorage.get('key');
      expect(window.localStorage.getItem).toHaveBeenCalledWith('key');
      expect(result).toEqual(obj);
    });

    it('should return default value if key does not exist', () => {
      const result = helperStorage.get('nonexistent', 'default');
      expect(window.localStorage.getItem).toHaveBeenCalledWith('nonexistent');
      expect(result).toBe('default');
    });

    it('should return undefined if key does not exist and no default value is provided', () => {
      const result = helperStorage.get('nonexistent');
      expect(window.localStorage.getItem).toHaveBeenCalledWith('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all stored items', () => {
      mockStorage['key1'] = 'value1';
      mockStorage['key2'] = 'value2';
      helperStorage.clear();
      expect(window.localStorage.clear).toHaveBeenCalled();
      expect(Object.keys(mockStorage)).toHaveLength(0);
    });
  });
});
