import _ from "lodash";
import moment from "moment";

export default class HelperFormat {
  public static getTimeFromMomentDuration(d: any) {
    const time: any[] = [];
    if (d.days()) {
      time.push(`${d.days()}d`);
    }
    if (d.hours()) {
      time.push(`${d.hours()}h`);
    }
    if (d.minutes()) {
      time.push(`${d.minutes()}m`);
    }
    if (d.seconds()) {
      time.push(`${d.seconds()}s`);
    }
    if (d.milliseconds()) {
      time.push(`${d.milliseconds()}ms`);
    }
    return time.join(" ");
  }

  public static getAbColumnType(javaType: string) {
    const types: any = {
      "java.util.UUID": "abColDefString",
      "java.lang.String": "abColDefString",
      "java.lang.Integer": "abColDefNumber",
      int: "abColDefNumber",
      "java.lang.Short": "abColDefNumber",
      short: "abColDefNumber",
      "java.lang.Long": "abColDefNumber",
      long: "abColDefNumber",
      "java.lang.Byte": "abColDefNumber",
      byte: "abColDefNumber",
      "java.lang.Character": "abColDefNumber",
      char: "abColDefNumber",
      "java.math.BigDecimal": "abColDefNumber",
      "java.math.BigInteger": "abColDefNumber",
      "java.util.Date": "abColDefDate",
      "java.time.LocalDate": "abColDefDate",
      "org.joda.time.LocalDate": "abColDefDate",
      "java.time.LocalDateTime": "abColDefDate",
      "org.joda.time.LocalDateTime": "abColDefDate",
      "java.time.ZonedDateTime": "abColDefDate",
      "java.lang.Boolean": "abColDefBoolean",
      boolean: "abColDefBoolean",
    };
    return types[javaType] || "abColDefString";
  }

  public static getTimeZone() {
    const offset = new Date().getTimezoneOffset();
    const o = Math.abs(offset);
    return (offset < 0 ? "+" : "-") + ("00" + Math.floor(o / 60)).slice(-2) + ":" + ("00" + (o % 60)).slice(-2);
  }

  public static dateFormat() {
    return `yyyy-MM-dd[T]HH:mm:ss[.000]`;
  }

  public static isXml(str: string) {
    return str && str.indexOf("?xml") !== -1 || false;
  }

  public static isJson(str: string) {
    if (!str || str.indexOf("{") === -1) {
      return false;
    }
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  public static isShortDetailTreeItem(str: string) {
    let value = str;
    if (value === null || value === undefined) {
      value = "";
    }
    value = value.toString();
    return !value || (!this.isXml(value) && !this.isJson(value) && value.length < 80);
  }

  // Example path values@org#cyoda#gs#jsondb#JsonObjectValues.strings.[#name] -> values.strings.[#name]
  public static shortNamePath(path: string) {
    if (path.includes("@")) {
      const data: string[] = [];
      const classesPaths = path.split("@");
      classesPaths.forEach((classesPath) => {
        if (classesPath.indexOf("#") > -1) {
          const strings = classesPath.split(".");
          strings.shift();
          data.push(strings.join("."));
        } else {
          data.push(classesPath);
        }
      });
      return data.join(".");
    } else {
      return path;
    }
  }

  public static flatTableRow(row: any): { [key: string]: string } {
    const toReturn: any = {};
    for (let columnName in row) {
      columnName = columnName.replace(/\.\[\*\]/g, "");
      if (!row.hasOwnProperty(columnName)) {
        continue;
      }

      if (typeof row[columnName] === "object" && row[columnName] !== null && !Array.isArray(row[columnName])) {
        const flatObject = this.flatTableRow(row[columnName]);
        // @ts-ignore
        for (const x in flatObject) {
          if (!flatObject.hasOwnProperty(x)) {
            continue;
          }
          toReturn[columnName + "_" + x] = flatObject[x];
        }
      } else if (Array.isArray(row[columnName])) {
        if (typeof row[columnName][0] === "object") {
          const data: any = [];
          let delimiter = "";
          row[columnName].forEach((el: any) => {
            if (el && Object.keys(el).length > 1) {
              delimiter = "\n";
              // tslint:disable-next-line:forin
              for (const x in el) {
                data.push(`${x}: ${el[x]}`);
              }
            } else {
              delimiter = ", ";
              // tslint:disable-next-line:forin
              for (const x in el) {
                data.push(`${el[x]}`);
              }
            }
          });
          toReturn[columnName] = data.join(delimiter);
        } else {
          toReturn[columnName] = row[columnName].join(",");
        }
      } else {
        toReturn[columnName] = row[columnName];
      }
    }
    return toReturn;
  }

  public static getValue(str: string | boolean | number) {
    if (str === false) {
      return "false";
    } else if (!str) {
      return "-";
    } else {
      return str;
    }
  }

  public static number = (num: string) => {
    if (parseFloat(num)) {
      const parts = num.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
      // @ts-ignore
    } else if (num === 0) {
      return "0";
    } else {
      return num;
    }
  };

  public static date(dateTime: string) {
    return moment(dateTime).format("DD.MM.YYYY HH:mm");
  }

  public static toLowerCase(str: string) {
    const data = (str || "").replace(/_/g, " ");
    return _.capitalize(data);
  }
}
