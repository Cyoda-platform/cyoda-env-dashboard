/**
 * Format Helper
 * Utilities for formatting data
 */

/**
 * Shorten path name
 * Example: values@org#cyoda#gs#jsondb#JsonObjectValues.strings.[#name] -> values.strings.[#name]
 */
export function shortNamePath(path: string): string {
  if (!path) return path;
  
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

export default {
  shortNamePath,
};

