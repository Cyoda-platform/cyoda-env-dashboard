/**
 * Mock HelperStorage class for tests
 * Provides in-memory storage that mimics localStorage behavior
 */
export class MockHelperStorage {
  private storage: Map<string, any> = new Map();
  private prefix = 'cyoda_';

  get(key: string, defaultValue?: any): any {
    const fullKey = `${this.prefix}${key}`;
    return this.storage.has(fullKey) ? this.storage.get(fullKey) : defaultValue;
  }

  set(key: string, value: any): void {
    const fullKey = `${this.prefix}${key}`;
    this.storage.set(fullKey, value);
  }

  remove(key: string): void {
    const fullKey = `${this.prefix}${key}`;
    this.storage.delete(fullKey);
  }

  clear(): void {
    this.storage.clear();
  }

  has(key: string): boolean {
    const fullKey = `${this.prefix}${key}`;
    return this.storage.has(fullKey);
  }
}

