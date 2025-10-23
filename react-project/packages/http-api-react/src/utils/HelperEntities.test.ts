/**
 * HelperEntities Tests
 */

import { describe, it, expect } from 'vitest';
import HelperEntities from './HelperEntities';

describe('HelperEntities', () => {
  describe('entityTypeMapper', () => {
    it('should map BUSINESS to Business', () => {
      expect(HelperEntities.entityTypeMapper('BUSINESS')).toBe('Business');
    });

    it('should map PERSISTENCE to Technical', () => {
      expect(HelperEntities.entityTypeMapper('PERSISTENCE')).toBe('Technical');
    });
  });

  describe('getShortNameOfEntity', () => {
    it('should extract short name from com.cyoda path', () => {
      expect(HelperEntities.getShortNameOfEntity('com.cyoda.core.Entity')).toBe('Entity');
    });

    it('should extract short name from net.cyoda path', () => {
      expect(HelperEntities.getShortNameOfEntity('net.cyoda.saas.model.User')).toBe('User');
    });

    it('should extract short name from path containing .cyoda.', () => {
      expect(HelperEntities.getShortNameOfEntity('org.cyoda.custom.Transaction')).toBe('Transaction');
    });

    it('should return full name for non-cyoda paths', () => {
      expect(HelperEntities.getShortNameOfEntity('org.example.MyClass')).toBe('org.example.MyClass');
    });

    it('should handle empty string', () => {
      expect(HelperEntities.getShortNameOfEntity('')).toBe('');
    });
  });

  describe('getOptionsFromData', () => {
    it('should convert string array to options', () => {
      const data = ['com.cyoda.core.Entity', 'com.cyoda.core.User'];
      const options = HelperEntities.getOptionsFromData(data);
      
      expect(options).toHaveLength(2);
      expect(options[0]).toEqual({
        value: 'com.cyoda.core.Entity',
        label: 'com.cyoda.core.Entity',
      });
    });

    it('should convert object array to options', () => {
      const data = [
        { name: 'com.cyoda.core.Entity', type: 'BUSINESS' as const },
        { name: 'com.cyoda.core.User', type: 'PERSISTENCE' as const },
      ];
      const options = HelperEntities.getOptionsFromData(data);
      
      expect(options).toHaveLength(2);
      expect(options[0]).toEqual({
        value: 'com.cyoda.core.Entity',
        label: 'com.cyoda.core.Entity (Business)',
      });
      expect(options[1]).toEqual({
        value: 'com.cyoda.core.User',
        label: 'com.cyoda.core.User (Technical)',
      });
    });

    it('should filter by type', () => {
      const data = [
        { name: 'com.cyoda.core.Entity', type: 'BUSINESS' as const },
        { name: 'com.cyoda.core.User', type: 'PERSISTENCE' as const },
      ];
      const options = HelperEntities.getOptionsFromData(data, 'BUSINESS');
      
      expect(options).toHaveLength(1);
      expect(options[0].value).toBe('com.cyoda.core.Entity');
    });

    it('should handle empty array', () => {
      const options = HelperEntities.getOptionsFromData([]);
      expect(options).toEqual([]);
    });
  });

  describe('getLabel', () => {
    it('should format label for BUSINESS type', () => {
      const entity = { name: 'Entity', type: 'BUSINESS' as const };
      expect(HelperEntities.getLabel(entity)).toBe('Entity (Business)');
    });

    it('should format label for PERSISTENCE type', () => {
      const entity = { name: 'User', type: 'PERSISTENCE' as const };
      expect(HelperEntities.getLabel(entity)).toBe('User (Technical)');
    });

    it('should format label for missing type', () => {
      const entity = { name: 'Transaction' };
      expect(HelperEntities.getLabel(entity)).toBe('Transaction (Missing)');
    });
  });
});

