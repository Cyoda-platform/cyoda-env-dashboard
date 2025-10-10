import { describe, it, expect } from 'vitest';
import HelperTypes from '../../../../src/helpers/HelperTypes';

describe('HelperTypes', () => {
  describe('Static properties', () => {
    it('should have the correct numbersTypes', () => {
      expect(HelperTypes.numbersTypes).toEqual(['Long', 'Double', 'Integer', 'Float']);
    });

    it('should have the correct numbersTypesAsString', () => {
      expect(HelperTypes.numbersTypesAsString).toEqual(['BigDecimal', 'BigInteger']);
    });

    it('should have the correct datesTypes', () => {
      expect(HelperTypes.datesTypes).toEqual(['Date', 'LocalDate', 'LocalDateTime']);
    });

    it('should have the correct allTypes', () => {
      expect(HelperTypes.allTypes).toEqual([
        'String',
        'Date',
        'LocalDate',
        'LocalDateTime',
        'Long',
        'Double',
        'Integer',
        'Float',
        'BigDecimal',
        'BigInteger',
        'UUID',
      ]);
    });

    it('should have the correct datesNumbers', () => {
      expect(HelperTypes.datesNumbers).toEqual([
        'Date',
        'LocalDate',
        'LocalDateTime',
        'Long',
        'Double',
        'Integer',
        'Float',
        'BigDecimal',
        'BigInteger',
      ]);
    });
  });
});
