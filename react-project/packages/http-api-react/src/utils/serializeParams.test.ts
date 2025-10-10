/**
 * Tests for serializeParams
 */

import { describe, it, expect } from 'vitest';
import { serializeParams } from './serializeParams';

describe('serializeParams', () => {
  it('should serialize simple object', () => {
    const params = { name: 'John', age: 30 };
    const result = serializeParams(params);
    expect(result).toContain('name=John');
    expect(result).toContain('age=30');
  });

  it('should skip null values', () => {
    const params = { name: 'John', age: null };
    const result = serializeParams(params);
    expect(result).toContain('name=John');
    expect(result).not.toContain('age');
  });

  it('should convert empty strings to null and skip them', () => {
    const params = { name: 'John', email: '' };
    const result = serializeParams(params);
    expect(result).toContain('name=John');
    expect(result).not.toContain('email');
  });

  it('should handle arrays without indices', () => {
    const params = { tags: ['tag1', 'tag2', 'tag3'] };
    const result = serializeParams(params);
    // Should not have indices like tags[0], tags[1]
    expect(result).not.toContain('[0]');
    expect(result).not.toContain('[1]');
  });

  it('should handle nested objects', () => {
    const params = {
      user: {
        name: 'John',
        age: 30,
      },
    };
    const result = serializeParams(params);
    expect(result).toContain('user');
  });

  it('should handle boolean values', () => {
    const params = { active: true, deleted: false };
    const result = serializeParams(params);
    expect(result).toContain('active=true');
    expect(result).toContain('deleted=false');
  });

  it('should handle number values', () => {
    const params = { page: 1, size: 10, price: 99.99 };
    const result = serializeParams(params);
    expect(result).toContain('page=1');
    expect(result).toContain('size=10');
    expect(result).toContain('price=99.99');
  });

  it('should handle mixed types', () => {
    const params = {
      name: 'John',
      age: 30,
      active: true,
      tags: ['admin', 'user'],
      metadata: null,
    };
    const result = serializeParams(params);
    expect(result).toContain('name=John');
    expect(result).toContain('age=30');
    expect(result).toContain('active=true');
    expect(result).not.toContain('metadata');
  });

  it('should handle empty object', () => {
    const params = {};
    const result = serializeParams(params);
    expect(result).toBe('');
  });

  it('should handle object with all null values', () => {
    const params = { a: null, b: null, c: null };
    const result = serializeParams(params);
    expect(result).toBe('');
  });

  it('should handle special characters in values', () => {
    const params = { name: 'John Doe', email: 'john@example.com' };
    const result = serializeParams(params);
    expect(result).toBeTruthy();
  });

  it('should handle undefined values', () => {
    const params = { name: 'John', age: undefined };
    const result = serializeParams(params);
    expect(result).toContain('name=John');
    // undefined should be handled similar to null
  });
});

