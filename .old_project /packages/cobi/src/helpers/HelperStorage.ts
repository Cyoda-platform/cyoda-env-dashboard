export default class HelperStorage {
  private storage: any;

  constructor() {
    this.storage = window.localStorage;
  }

  static ints() {
    return new HelperStorage();
  }

  public set(name: string, value: any) {
    let valueJson = value;
    if (typeof value !== "string") {
      valueJson = JSON.stringify(value);
    }
    this.storage.setItem(name, valueJson);
  }

  public get(name: string, defaultValue: any = undefined): any {
    let data: string = this.storage.getItem(name);
    if (data) {
      try {
        data = JSON.parse(data);
        // eslint-disable-next-line no-empty
      } catch (e) {}
    } else {
      data = defaultValue;
    }
    return data;
  }

  public clear() {
    this.storage.clear();
  }

  public deleteByKey(key: string) {
    this.storage.removeItem(key);
  }
}
