import {ReportingInfoRow} from '../types/types';

export default class HelperModelling {
  public static filterData(datas: ReportingInfoRow[]) {
    return datas
      .filter((el) => {
        if ('elementType' in el && !el.elementType) {
          return false;
        }
        if ('elementInfo' in el && !el.elementInfo) {
          return false;
        }
        return true;
      });
  }

  public static sortData(datas: ReportingInfoRow[]) {
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

  public static applyNameSpace(rows: ReportingInfoRow[], namespace: string) {
    return rows.map((el) => {
      if (namespace) {
        if (el.columnPath) {
          el.columnPath = `${namespace}.${el.columnPath}`;
        }
        if ('elementInfo' in el && el.elementInfo!.columnPath) {
          el.elementInfo!.columnPath = `${namespace}.${el.elementInfo!.columnPath}`;
        }

        if ('elementType' in el && el.elementType!.columnPath) {
          el.elementType!.columnPath = `${namespace}.${el.elementType!.columnPath}`;
        }
      }
      return el;
    });
  }
}
