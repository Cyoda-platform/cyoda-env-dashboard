export default class HelperCyodaChart {
  public static numberTypes = ["bigdecimal", "number"];

  public static getType(type: string) {
    if (this.numberTypes.indexOf(type) !== -1) {
      return "list-ol";
    } else if (type.toLowerCase().indexOf("date") !== -1) {
      return "calendar-alt";
    } else {
      return "heading";
    }
  }

  public static checkTrendline(type: string) {
    if (this.numberTypes.indexOf(type) !== -1) {
      return true;
    } else if (type.toLowerCase().indexOf("date") !== -1) {
      return true;
    } else {
      return false;
    }
  }
}
