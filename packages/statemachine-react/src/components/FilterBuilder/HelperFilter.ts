export interface Condition {
  '@bean': string;
  fieldName: string;
  operation: string;
  value?: {
    '@type': string;
    value: any;
  };
  from?: {
    '@type': string;
    value: any;
  };
  to?: {
    '@type': string;
    value: any;
  };
}

export interface GroupCondition {
  '@bean': string;
  operator: 'AND' | 'OR';
  conditions: (Condition | GroupCondition)[];
}

export default class HelperFilter {
  public static getCondition(): Condition {
    return {
      '@bean': '',
      fieldName: '',
      operation: '',
      value: {
        '@type': '',
        value: '',
      },
    };
  }

  public static getGroup(): GroupCondition {
    return {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [this.getCondition()],
    };
  }

  public static isGroupCondition(condition: any): condition is GroupCondition {
    return condition && condition['@bean'] === 'com.cyoda.core.conditions.GroupCondition';
  }
}

