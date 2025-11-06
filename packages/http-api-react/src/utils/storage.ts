/**
 * Helper class for localStorage operations
 * Migrated from @cyoda/ui-lib/src/helpers/HelperStorage
 */
export class HelperStorage {
  private storage: Storage;
  private prefix: string;

  constructor(prefix: string = 'cyoda_') {
    this.storage = window.localStorage;
    this.prefix = prefix;
  }

  public set(name: string, value: any): void {
    try {
      let valueJson = value;
      if (typeof value !== 'string') {
        valueJson = JSON.stringify(value);
      }
      this.storage.setItem(`${this.prefix}${name}`, valueJson);
    } catch (error) {
      console.error(`Error writing to localStorage: ${name}`, error);
    }
  }

  public get<T = any>(name: string, defaultValue?: T): T | null {
    try {
      const data = this.storage.getItem(`${this.prefix}${name}`);
      if (data) {
        if (this.isJsonString(data)) {
          return JSON.parse(data) as T;
        }
        return data as T;
      }
      return defaultValue !== undefined ? defaultValue : null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${name}`, error);
      return defaultValue !== undefined ? defaultValue : null;
    }
  }

  public remove(name: string): void {
    try {
      this.storage.removeItem(`${this.prefix}${name}`);
    } catch (error) {
      console.error(`Error removing from localStorage: ${name}`, error);
    }
  }

  public clear(): void {
    try {
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  public has(name: string): boolean {
    return this.storage.getItem(`${this.prefix}${name}`) !== null;
  }

  public keys(): string[] {
    try {
      const allKeys = Object.keys(this.storage);
      return allKeys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.substring(this.prefix.length));
    } catch (error) {
      console.error('Error getting keys from localStorage', error);
      return [];
    }
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

