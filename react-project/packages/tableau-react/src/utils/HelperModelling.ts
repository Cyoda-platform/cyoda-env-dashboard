/**
 * HelperModelling Utility
 * Helper functions for CyodaModelling components
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/helpers/HelperModelling.ts
 */

import type { ReportingInfoRow, RequestParam } from '../types/modelling';

export default class HelperModelling {
  static REGEX_SOURCE = /\//;
  static REGEX_TARGET = /@|\./;
  static notPrimitiveList = ['EMBEDDED', 'LIST', 'MAP'];

  /**
   * Filter out rows with empty elementType or elementInfo
   */
  public static filterData(datas: ReportingInfoRow[] | any): ReportingInfoRow[] {
    // Safety check: ensure datas is an array
    if (!Array.isArray(datas)) {
      console.warn('HelperModelling.filterData: data is not an array, returning empty array', datas);
      return [];
    }

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
  public static sortData(datas: ReportingInfoRow[] | any): ReportingInfoRow[] {
    // Safety check: ensure datas is an array
    if (!Array.isArray(datas)) {
      console.warn('HelperModelling.sortData: data is not an array, returning empty array', datas);
      return [];
    }

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

  /**
   * Apply namespace prefix to column paths
   */
  public static applyNameSpace(rows: ReportingInfoRow[], namespace: string): ReportingInfoRow[] {
    return rows.map((el) => {
      if (namespace) {
        if (el.columnPath) {
          el.columnPath = `${namespace}.${el.columnPath}`;
        }
        if ('elementInfo' in el && el.elementInfo?.columnPath) {
          el.elementInfo.columnPath = `${namespace}.${el.elementInfo.columnPath}`;
        }
        if ('elementType' in el && el.elementType?.columnPath) {
          el.elementType.columnPath = `${namespace}.${el.elementType.columnPath}`;
        }
      }
      return el;
    });
  }

  /**
   * Check if a row can be selected (is a leaf node)
   */
  public static rowCanBeSelected(reportInfoRow: ReportingInfoRow): boolean {
    if (reportInfoRow.type === 'LEAF') {
      return true;
    }
    if (reportInfoRow.elementInfo) {
      return reportInfoRow.elementInfo.type === 'LEAF';
    }
    if (reportInfoRow.elementType) {
      return reportInfoRow.elementType.type === 'LEAF';
    }
    return false;
  }

  /**
   * Check if child nodes are available
   */
  public static isChildAvailable(reportInfoRow: ReportingInfoRow): boolean {
    return this.notPrimitiveList.includes(reportInfoRow.type);
  }

  /**
   * Get all request parameters for a row
   */
  public static allRequestParams(reportInfoRow: ReportingInfoRow, requestClass: string): RequestParam[] {
    let allRequestParams: RequestParam[] = [];
    if (this.isChildAvailable(reportInfoRow)) {
      if (this.notPrimitiveList.includes(reportInfoRow.type)) {
        allRequestParams = this.getClasses(requestClass, reportInfoRow, reportInfoRow.columnPath);
        allRequestParams.sort((a, b) => {
          if (a.columnPath > b.columnPath) {
            return 1;
          }
          if (a.columnPath < b.columnPath) {
            return -1;
          }
          return 0;
        });
      }
    }
    return allRequestParams;
  }

  /**
   * Get classes from a row (declared class and subclasses)
   */
  public static getClasses(
    requestClass: string,
    row: ReportingInfoRow,
    baseColumnPath: string,
    types: string[] = []
  ): RequestParam[] {
    const allRequestParams: RequestParam[] = [];

    if (row.declaredClass) {
      if (!row.declaredClass.abstract) {
        allRequestParams.push({
          reportClass: row.declaredClass.class,
          columnPath: row.columnPath + '@' + row.declaredClass.class.replace(/\./g, '#'),
          requestClass: requestClass,
          types,
          baseColumnPath,
          key: null,
        });
      }
    }

    if (row.subClasses) {
      row.subClasses
        .filter((el) => !el.abstract)
        .forEach((el) => {
          allRequestParams.push({
            reportClass: el.class,
            columnPath: row.columnPath + '@' + el.class.replace(/\./g, '#'),
            requestClass: requestClass,
            types,
            baseColumnPath,
            key: null,
          });
        });
    }

    return allRequestParams;
  }

  /**
   * Check if join is available for a row
   */
  public static isJoinAvailable(reportInfoRow: ReportingInfoRow): boolean {
    return !!reportInfoRow.joinInfo;
  }

  /**
   * Get label for a row
   */
  public static getLabel(reportInfoRow: ReportingInfoRow, parentColDef?: any): string {
    let label = reportInfoRow.columnName;
    if (parentColDef) {
      label = `${parentColDef}.${label}`;
    }
    return label;
  }

  /**
   * Get full path for a row
   */
  public static getFullPath(reportInfoRow: ReportingInfoRow): string {
    return reportInfoRow.columnPath;
  }

  /**
   * Check if a path is checked
   */
  public static isChecked(checked: any[], fullPath: string): boolean {
    return checked.some((el) => el.fullPath === fullPath);
  }

  /**
   * Get types for a row (for form selection)
   */
  public static getTypes(reportInfoRow: ReportingInfoRow): string[] {
    const types: string[] = [];
    
    if (reportInfoRow.declaredClass && !reportInfoRow.declaredClass.abstract) {
      types.push(reportInfoRow.declaredClass.class);
    }
    
    if (reportInfoRow.subClasses) {
      reportInfoRow.subClasses
        .filter((el) => !el.abstract)
        .forEach((el) => {
          types.push(el.class);
        });
    }
    
    return types;
  }

  /**
   * Format class name (get short name)
   */
  public static formatClassName(className: string): string {
    const parts = className.split('.');
    return parts[parts.length - 1];
  }

  /**
   * Check if search matches a path
   */
  public static matchesSearch(path: string, search: string): boolean {
    if (!search) return true;
    return path.toLowerCase().includes(search.toLowerCase());
  }
}

