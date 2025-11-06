/**
 * HelperModelling
 * Helper functions for modelling/reporting data manipulation
 * 
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/helpers/HelperModelling.ts
 */

import type { ReportingInfoRow } from '../types';

export default class HelperModelling {
  /**
   * Filter out rows with empty elementType or elementInfo
   */
  public static filterData(datas: ReportingInfoRow[]): ReportingInfoRow[] {
    return datas.filter((el) => {
      if ('elementType' in el && !el.elementType) {
        return false;
      }
      if ('elementInfo' in el && !el.elementInfo) {
        return false;
      }
      return true;
    });
  }

  /**
   * Sort data by columnName alphabetically
   */
  public static sortData(datas: ReportingInfoRow[]): ReportingInfoRow[] {
    datas.sort((a, b) => {
      if (a.columnName > b.columnName) {
        return 1;
      }
      if (a.columnName < b.columnName) {
        return -1;
      }
      return 0;
    });
    return datas;
  }
}

