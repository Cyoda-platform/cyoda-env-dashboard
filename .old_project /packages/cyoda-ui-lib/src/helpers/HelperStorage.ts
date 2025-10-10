export default class HelperStorage {
  private storage: any;

  constructor() {
    this.storage = window.localStorage;
  }

  public set(name: string, value: any) {
    let valueJson = value;
    if (typeof value !== 'string') {
      valueJson = JSON.stringify(value);
    }
    this.storage.setItem(name, valueJson);
  }

  // tslint:disable-next-line:no-unnecessary-initializer
  public get(name: string, defaultValue: any = undefined): any {
    let data: string = this.storage.getItem(name);
    if (data) {
      if(this.isJsonString(data)) {
        data = JSON.parse(data);
      }
      return data;
    } else {
      data = defaultValue;
    }
    return data;
  }

  public clear() {
    this.storage.clear();
  }

  private isJsonString(str:any) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
