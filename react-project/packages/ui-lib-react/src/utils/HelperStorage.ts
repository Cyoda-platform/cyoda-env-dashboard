/**
 * HelperStorage
 * Local storage helper with namespacing
 * 
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/helpers/HelperStorage.ts
 */

export default class HelperStorage {
  private prefix = 'cyoda_';

  /**
   * Get value from localStorage with optional default
   */
  public get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(`${this.prefix}${key}`);
      if (item === null) {
        return defaultValue !== undefined ? defaultValue : null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return defaultValue !== undefined ? defaultValue : null;
    }
  }

  /**
   * Set value in localStorage
   */
  public set(key: string, value: any): void {
    try {
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
    }
  }

  /**
   * Remove value from localStorage
   */
  public remove(key: string): void {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
    }
  }

  /**
   * Clear all values with the prefix
   */
  public clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  /**
   * Check if key exists
   */
  public has(key: string): boolean {
    return localStorage.getItem(`${this.prefix}${key}`) !== null;
  }
}

