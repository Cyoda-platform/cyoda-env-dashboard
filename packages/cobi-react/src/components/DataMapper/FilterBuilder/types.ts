// FilterBuilder types

export interface FilterConditionValue {
  '@type': string;
  value: string | number | boolean;
}

export interface FilterCondition {
  '@bean': string;
  fieldName?: string;
  operation?: string;
  value?: FilterConditionValue;
  from?: FilterConditionValue;
  to?: FilterConditionValue;
  lookback?: string;
  rangeField?: string;
  queryable?: boolean;
}

export interface FilterGroup {
  '@bean': string;
  operator: 'AND' | 'OR';
  conditions: (FilterCondition | FilterGroup)[];
}

export interface ColumnInfo {
  alias: string;
  type: string;
  typeShort: string;
  label?: string;
}

export interface ConditionType {
  '@bean': string;
  key: string;
  label: string;
  types?: string[];
  isRange?: boolean;
  disableValueField?: boolean;
}

export const CONDITION_TYPES: ConditionType[] = [
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.IEquals',
    key: 'IEQUALS',
    label: 'equals (disregard case)',
    types: ['String', 'UUID'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.INotEquals',
    key: 'INOT_EQUAL',
    label: 'not equal (disregard case)',
    types: ['String', 'UUID'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.Between',
    key: 'BETWEEN',
    label: 'between',
    types: ['String', 'Integer', 'Long', 'Double', 'Float', 'LocalDate', 'LocalDateTime', 'Date'],
    isRange: true,
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.BetweenInclusive',
    key: 'BETWEEN_INCLUSIVE',
    label: 'between (inclusive)',
    types: ['String', 'Integer', 'Long', 'Double', 'Float', 'LocalDate', 'LocalDateTime', 'Date'],
    isRange: true,
  },
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.IContains',
    key: 'CONTAINS',
    label: 'contains',
    types: ['String', 'UUID'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.IStartsWith',
    key: 'ISTARTS_WITH',
    label: 'starts with',
    types: ['String'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.IEndsWith',
    key: 'IENDS_WITH',
    label: 'ends with',
    types: ['String'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.INotContains',
    key: 'INOT_CONTAINS',
    label: 'does not contain',
    types: ['String'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.INotStartsWith',
    key: 'INOT_STARTS_WITH',
    label: 'does not start with',
    types: ['String'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.NotEndsWith',
    key: 'NOT_ENDS_WITH',
    label: 'does not end with',
    types: ['String'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.INotEndsWith',
    key: 'INOT_ENDS_WITH',
    label: 'does not end with (case insensitive)',
    types: ['String'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.Equals',
    key: 'EQUALS',
    label: 'equals',
    types: ['String', 'Integer', 'Long', 'Double', 'Float', 'LocalDate', 'LocalDateTime', 'Date', 'ByteBuffer', 'Boolean', 'UUID'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.NotEquals',
    key: 'NOT_EQUAL',
    label: 'not equal',
    types: ['String', 'Integer', 'Long', 'Double', 'Float', 'LocalDate', 'LocalDateTime', 'Date', 'Boolean', 'UUID'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.LessThan',
    key: 'LESS_THAN',
    label: 'less than',
    types: ['Integer', 'Long', 'Double', 'Float', 'LocalDate', 'LocalDateTime', 'Date'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.GreaterThan',
    key: 'GREATER_THAN',
    label: 'greater than',
    types: ['Integer', 'Long', 'Double', 'Float', 'LocalDate', 'LocalDateTime', 'Date'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.LessThanEquals',
    key: 'LESS_OR_EQUAL',
    label: 'less than or equal to',
    types: ['Integer', 'Long', 'Double', 'Float', 'LocalDate', 'LocalDateTime', 'Date'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.GreaterThanEquals',
    key: 'GREATER_OR_EQUAL',
    label: 'greater than or equal to',
    types: ['Integer', 'Long', 'Double', 'Float', 'LocalDate', 'LocalDateTime', 'Date'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.IsNull',
    key: 'IS_NULL',
    label: 'is null',
    types: ['String', 'Integer', 'Long', 'Double', 'Float', 'LocalDate', 'LocalDateTime', 'Date', 'Boolean', 'UUID'],
    disableValueField: true,
  },
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.NotNull',
    key: 'NOT_NULL',
    label: 'is not null',
    types: ['String', 'Integer', 'Long', 'Double', 'Float', 'LocalDate', 'LocalDateTime', 'Date', 'Boolean', 'UUID'],
    disableValueField: true,
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.Like',
    key: 'LIKE',
    label: 'like',
    types: ['String'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.IsUnchanged',
    key: 'IS_UNCHANGED',
    label: 'IsUnchanged',
    types: ['String', 'Integer', 'Long', 'Double', 'Float', 'LocalDate', 'LocalDateTime', 'Date', 'ByteBuffer', 'Boolean', 'UUID'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.IsChanged',
    key: 'IS_CHANGED',
    label: 'IsChanged',
    types: ['String', 'Integer', 'Long', 'Double', 'Float', 'LocalDate', 'LocalDateTime', 'Date', 'ByteBuffer', 'Boolean', 'UUID'],
  },
];

export const GROUP_CONDITION_TYPES = [
  {
    '@bean': 'com.cyoda.core.conditions.GroupCondition',
    key: 'AND',
    label: 'Match All',
  },
  {
    '@bean': 'com.cyoda.core.conditions.GroupCondition',
    key: 'OR',
    label: 'Match Any',
  },
];

