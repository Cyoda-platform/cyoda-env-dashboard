/**
 * Helper class for localStorage operations
 * Migrated from @cyoda/ui-lib/src/helpers/HelperStorage
 */
export class HelperStorage {
  private storage: Storage;

  constructor() {
    this.storage = window.localStorage;
  }

  public set(name: string, value: any): void {
    let valueJson = value;
    if (typeof value !== 'string') {
      valueJson = JSON.stringify(value);
    }
    this.storage.setItem(name, valueJson);
  }

  public get<T = any>(name: string, defaultValue?: T): T {
    const data = this.storage.getItem(name);
    if (data) {
      if (this.isJsonString(data)) {
        return JSON.parse(data) as T;
      }
      return data as T;
    }
    return defaultValue as T;
  }

  public clear(): void {
    this.storage.clear();
  }

  private isJsonString(str: string): boolean {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}

export default HelperStorage;

