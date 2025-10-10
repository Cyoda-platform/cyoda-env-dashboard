import {IDefinitionContentCondition, IDefinitionContentConditionGroup} from '../../../types/types';

export default class HelperFilter {
  public static getCondition(): IDefinitionContentCondition {
    return {
      '@bean': '',
      'fieldName': '',
      'operation': '',
      'value': {
        '@type': '',
        'value': '',
      },
    };
  }

  public static getGroup(): IDefinitionContentConditionGroup {
    return {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      'operator': 'AND',
      'conditions': [this.getCondition()],
    };
  }
}
