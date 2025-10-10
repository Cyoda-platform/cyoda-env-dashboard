export default class HelperDictionary {
  public static users = [
    {
      email: 'Not assigned',
      name: 'Not assigned',
    },
  ];

  public static statuses = [
    {
      key: 'None',
      value: 'None',
    },
    {
      key: 'Unassigned',
      value: 'Unassigned',
    },
    {
      key: 'Assigned',
      value: 'Assigned',
    },
    {
      key: 'In_Progress',
      value: 'In Progress',
    },
    {
      key: 'Completed',
      value: 'Completed',
    },
    {
      key: 'Created',
      value: 'Created',
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
      key: 0,
      value: 'Red',
    },
    {
      key: 1,
      value: 'Amber',
    },
    {
      key: 2,
      value: 'Green',
    },
  ];

  public static getLabel(dictName: string, key: string | number) {
    if (dictName in this) {
      // @ts-ignore
      const row = (this[dictName] as any).find((el: any) => el.key === key);
      if (row) {
        return row.value;
      }
    }
    return '';
  }
}

