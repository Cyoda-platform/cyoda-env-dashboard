/**
 * HelperDictionary
 * Static dictionaries for common data lookups
 * 
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/helpers/HelperDictionary.ts
 */

export default class HelperDictionary {
  public static users = [
    {
      email: 'john.doe@example.com',
      name: 'john.doe@example.com',
    },
    {
      email: 'jane.smith@example.com',
      name: 'jane.smith@example.com',
    },
    {
      email: 'bob.wilson@example.com',
      name: 'bob.wilson@example.com',
    },
    {
      email: 'alice.johnson@example.com',
      name: 'alice.johnson@example.com',
    },
  ];

  public static statuses = [
    {
      key: 'ALL',
      value: 'All',
    },
    {
      key: 'OPEN',
      value: 'Open',
    },
    {
      key: 'IN_PROGRESS',
      value: 'In Progress',
    },
    {
      key: 'CLOSED',
      value: 'Closed',
    },
  ];

  public static types = [
    {
      key: 0,
      value: 'Event',
    },
    {
      key: 1,
      value: 'Reset',
    },
    {
      key: 2,
      value: 'Exception',
    },
    {
      key: 3,
      value: 'Removed',
    },
    {
      key: 4,
      value: 'Reconfigured',
    },
    {
      key: 5,
      value: 'Enabled',
    },
    {
      key: 6,
      value: 'Disabled',
    },
    {
      key: 7,
      value: 'Schedule Opened',
    },
    {
      key: 8,
      value: 'Schedule Closed',
    },
  ];

  public static priorities = [
    {
      key: '1',
      value: 'Very Low (1)',
    },
    {
      key: '2',
      value: 'Low (2)',
    },
    {
      key: '3',
      value: 'Low-Medium (3)',
    },
    {
      key: '4',
      value: 'Medium-Low (4)',
    },
    {
      key: '5',
      value: 'Medium (5)',
    },
    {
      key: '6',
      value: 'Medium-High (6)',
    },
    {
      key: '7',
      value: 'High-Medium (7)',
    },
    {
      key: '8',
      value: 'High (8)',
    },
    {
      key: '9',
      value: 'Very High (9)',
    },
    {
      key: '10',
      value: 'Critical (10)',
    },
  ];

  public static getLabel(dictName: string, key: string | number) {
    if (dictName in this) {
      // @ts-ignore
      const row = (this[dictName] as any).find((el: any) => {
        // Handle both string and number comparisons
        return el.key == key || el.key === key.toString() || el.key.toString() === key.toString();
      });
      if (row) {
        return row.value;
      }
    }
    return key?.toString() || '';
  }

  public static getOptions(dictName: string) {
    if (dictName in this) {
      // @ts-ignore
      return this[dictName] as any[];
    }
    return [];
  }
}

