/**
 * HelperFormat
 * Formatting utilities for common data transformations
 * 
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/helpers/HelperFormat.ts
 */

export class HelperFormat {
  /**
   * Convert string to lowercase
   */
  public static toLowerCase(str: string | null | undefined): string {
    if (!str) return '';
    return str.toLowerCase();
  }

  /**
   * Convert string to uppercase
   */
  public static toUpperCase(str: string | null | undefined): string {
    if (!str) return '';
    return str.toUpperCase();
  }

  /**
   * Format date to readable string
   */
  public static date(dateString: string | null | undefined): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Format datetime to readable string
   */
  public static datetime(dateString: string | null | undefined): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Format number with thousand separators
   */
  public static number(num: number | null | undefined): string {
    if (num === null || num === undefined) return '';
    return num.toLocaleString('en-US');
  }

  /**
   * Format currency
   */
  public static currency(num: number | null | undefined, currency = 'USD'): string {
    if (num === null || num === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(num);
  }

  /**
   * Truncate string to specified length
   */
  public static truncate(str: string | null | undefined, length = 50): string {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  }

  /**
   * Shorten path name by removing @class#name parts
   * Example: values@org#cyoda#gs#jsondb#JsonObjectValues.strings.[#name] -> values.strings.[#name]
   * Example: changeLog.[*]@com#cyoda#tdb#model#metadata#ModelChangeLogEntry.changes.[*] -> changeLog.[*].changes.[*]
   */
  public static shortNamePath(path: string | null | undefined): string {
    if (!path) return '';

    if (path.includes('@')) {
      const data: string[] = [];
      const classesPaths = path.split('@');
      classesPaths.forEach((classesPath) => {
        if (classesPath.indexOf('#') > -1) {
          const strings = classesPath.split('.');
          strings.shift();
          data.push(strings.join('.'));
        } else {
          data.push(classesPath);
        }
      });
      return data.join('.');
    } else {
      return path;
    }
  }

  /**
   * Check if value is XML
   */
  public static isXml(value: any): boolean {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    return trimmed.startsWith('<') && trimmed.endsWith('>');
  }

  /**
   * Check if value is JSON (object or array)
   */
  public static isJson(value: any): boolean {
    if (typeof value !== 'string') return false;
    if (!value || value.indexOf('{') === -1) return false;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if value should be displayed inline (short value)
   * Returns true if value is short, not XML, and not JSON
   */
  public static isShortDetailTreeItem(value: any): boolean {
    if (value === null || value === undefined) return true;

    const str = String(value);
    if (!str || str === '') return true;

    // Check if it's XML or JSON
    if (this.isXml(str) || this.isJson(str)) return false;

    // Check length
    return str.length < 80;
  }

  /**
   * Get formatted value for display
   */
  public static getValue(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }
}

