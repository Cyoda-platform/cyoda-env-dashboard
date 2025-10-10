import { describe, it, expect } from 'vitest';
import HelperDictionary from '../../../../src/helpers/HelperDictionary';

describe('HelperDictionary', () => {
  describe('Static properties', () => {
    it('should have predefined users', () => {
      expect(HelperDictionary.users).toEqual([
        {
          email: 'Not assigned',
          name: 'Not assigned',
        },
      ]);
    });

    it('should have predefined statuses', () => {
      expect(HelperDictionary.statuses).toEqual([
        { key: 'None', value: 'None' },
        { key: 'Unassigned', value: 'Unassigned' },
        { key: 'Assigned', value: 'Assigned' },
        { key: 'In_Progress', value: 'In Progress' },
        { key: 'Completed', value: 'Completed' },
        { key: 'Created', value: 'Created' },
      ]);
    });

    it('should have predefined types', () => {
      expect(HelperDictionary.types).toEqual([
        { key: 0, value: 'Event' },
        { key: 1, value: 'Reset' },
        { key: 2, value: 'Exception' },
        { key: 3, value: 'Removed' },
        { key: 4, value: 'Reconfigured' },
        { key: 5, value: 'Enabled' },
        { key: 6, value: 'Disabled' },
        { key: 7, value: 'Schedule Opened' },
        { key: 8, value: 'Schedule Closed' },
      ]);
    });

    it('should have predefined priorities', () => {
      expect(HelperDictionary.priorities).toEqual([
        { key: 0, value: 'Red' },
        { key: 1, value: 'Amber' },
        { key: 2, value: 'Green' },
      ]);
    });
  });

  describe('getLabel', () => {
    it('should return the correct label for a valid key in statuses', () => {
      const result = HelperDictionary.getLabel('statuses', 'Assigned');
      expect(result).toBe('Assigned');
    });

    it('should return the correct label for a valid key in types', () => {
      const result = HelperDictionary.getLabel('types', 3);
      expect(result).toBe('Removed');
    });

    it('should return the correct label for a valid key in priorities', () => {
      const result = HelperDictionary.getLabel('priorities', 2);
      expect(result).toBe('Green');
    });

    it('should return an empty string for an invalid key', () => {
      const result = HelperDictionary.getLabel('statuses', 'InvalidKey');
      expect(result).toBe('');
    });

    it('should return an empty string for an invalid dictionary name', () => {
      const result = HelperDictionary.getLabel('invalidDict', 'Assigned');
      expect(result).toBe('');
    });

    it('should return an empty string for a valid dictionary but no matching key', () => {
      const result = HelperDictionary.getLabel('types', 999);
      expect(result).toBe('');
    });
  });
});
