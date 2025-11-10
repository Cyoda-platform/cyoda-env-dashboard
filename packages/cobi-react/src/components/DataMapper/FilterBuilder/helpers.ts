import { FilterCondition, FilterGroup } from './types';

export const HelperFilter = {
  getGroup(): FilterGroup {
    return {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [this.getCondition()], // Automatically add one empty condition
    };
  },

  getCondition(): FilterCondition {
    return {
      '@bean': '',
      fieldName: '',
      operation: '',
    };
  },

  isGroup(condition: FilterCondition | FilterGroup): condition is FilterGroup {
    return condition['@bean'].indexOf('GroupCondition') !== -1;
  },
};

export const shortLabel = (str: string): string => {
  if (!str) return '';
  const parts = str.split('.');
  return parts[parts.length - 1] || str;
};

