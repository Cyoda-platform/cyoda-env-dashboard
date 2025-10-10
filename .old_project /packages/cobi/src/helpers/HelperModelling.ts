import type { ReportingInfoRow, RequestParam } from "../types/types.d.ts";

export default class HelperModelling {
  static REGEX_SOURCE = /\//;
  static REGEX_TARGET = /@|\./;

  static notPrimitiveList = ["EMBEDDED", "LIST", "MAP"];

  static filterData(datas: ReportingInfoRow[]) {
    return datas
      .filter((el) => {
        if ("elementType" in el && !el.elementType) {
          return false;
        }
        if ("elementInfo" in el && !el.elementInfo) {
          return false;
        }
        return true;
      });
  }

  static sortData(datas: ReportingInfoRow[]) {
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

  static applyNameSpace(rows: ReportingInfoRow[], namespace: string) {
    return rows.map((el) => {
      if (namespace) {
        if (el.columnPath) {
          el.columnPath = `${namespace}.${el.columnPath}`;
        }
        if ("elementInfo" in el && el.elementInfo.columnPath) {
          el.elementInfo.columnPath = `${namespace}.${el.elementInfo.columnPath}`;
        }

        if ("elementType" in el && el.elementType.columnPath) {
          el.elementType.columnPath = `${namespace}.${el.elementType.columnPath}`;
        }
      }
      return el;
    });
  }

  static rowCanBeSelected(reportInfoRow: any) {
    if (reportInfoRow.type === "LEAF") {
      return true;
    }
    if (reportInfoRow.elementInfo) {
      return reportInfoRow.elementInfo.type === "LEAF";
    }
    if (reportInfoRow.elementType) {
      return reportInfoRow.elementType.type === "LEAF";
    }
    return false;
  }

  static isChildAvailable(reportInfoRow: any) {
    let element: ReportingInfoRow = {} as ReportingInfoRow;
    if (reportInfoRow.elementInfo) {
      element = reportInfoRow.elementInfo;
    }
    if (reportInfoRow.elementType) {
      element = reportInfoRow.elementType;
    }
    return HelperModelling.notPrimitiveList.includes(reportInfoRow.type) && element.type !== "LEAF";
  }

  static allRequestParams(reportInfoRow: any, requestClass: string) {
    let allRequestParams: RequestParam[] = [];
    if (HelperModelling.isChildAvailable(reportInfoRow)) {
      if (HelperModelling.notPrimitiveList.includes(reportInfoRow.type)) {
        allRequestParams = HelperModelling.getClasses(requestClass, reportInfoRow, reportInfoRow.columnPath);
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

  static getClasses(requestClass: string, row: ReportingInfoRow, baseColumnPath: string, types: string[] = []) {
    const allRequestParams: RequestParam[] = [];

    if (row.declaredClass) {
      if (!row.declaredClass.abstract) {
        allRequestParams.push({
          reportClass: row.declaredClass.class,
          columnPath: row.columnPath + "@" + row.declaredClass.class.replace(/\./g, "#"),
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
            columnPath: row.columnPath + "@" + el.class.replace(/\./g, "#"),
            requestClass: requestClass,
            types,
            baseColumnPath,
          });
        });
    }

    if (row.elementType) {
      if (row.keyInfo) {
        const type = row.keyInfo.split(".").pop();
        types.push(type);
      }
      // @ts-ignore
      allRequestParams.push(...this.getClasses(requestClass, row.elementType, baseColumnPath, types));
    }

    if (row.elementInfo) {
      types.push("Integer");
      // @ts-ignore
      allRequestParams.push(...this.getClasses(requestClass, row.elementInfo, baseColumnPath, types));
    }
    if (allRequestParams.length > 0) {
      HelperModelling.addReportClassShort(allRequestParams);
    }
    return allRequestParams;
  }

  static addReportClassShort(allRequestParams: RequestParam[]) {
    const exampleArr = allRequestParams[0].reportClass.split(".");
    const length = allRequestParams.length;
    let strForSearch = "";
    for (const curr of exampleArr) {
      let foundNum = 0;
      allRequestParams.forEach((el) => {
        if (el.reportClass.includes(`${curr}.`)) {
          foundNum += 1;
        }
      });
      if (foundNum === length) {
        strForSearch += `${curr}.`;
      } else {
        break;
      }
    }
    allRequestParams.forEach((el) => {
      el.reportClassShort = el.reportClass.replace(strForSearch, "");
    });
  }

  static isElementIsSelected(selectedPath: string = "", fullPathOfRow: string = "", delimiter: any) {
    const selectedPathBySegments = selectedPath.split(delimiter);
    const fullPathOfRowSegments = fullPathOfRow.split(delimiter);
    for (let i = 0; i < fullPathOfRowSegments.length; i++) {
      if (selectedPathBySegments[i] !== fullPathOfRowSegments[i]) {
        return false;
      }
    }
    return true;
  }
}
