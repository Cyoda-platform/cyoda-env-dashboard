/**
 * HelperFormat
 * Formatting utilities for common data transformations
 * 
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/helpers/HelperFormat.ts
 */

export default class HelperFormat {
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
}

