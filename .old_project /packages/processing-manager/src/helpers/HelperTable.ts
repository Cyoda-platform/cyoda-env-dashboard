/* eslint-disable */
export default class HelperTable {
  public static createUniqMap(field: string, data: any[]) {
    const list = new Map();
    for (const el of data) {
      list.set(el[field], {
        value: el[field],
        label: el[field],
      });
    }
    const arr = [...list.values()];
    arr.sort((a, b) => {
      if (parseFloat(a.label) && parseFloat(b.label)) {
        return parseFloat(a.label) - parseFloat(b.label);
      }
      return a.label - b.label;
    });
    return arr;
  }
}
