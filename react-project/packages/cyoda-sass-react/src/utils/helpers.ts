import type { SqlField } from '../types';

/**
 * Get all fields from a table, including nested array fields
 * @param fields - List of fields
 * @returns Flattened list of all fields
 */
export const getAllFields = (fields: SqlField[]): SqlField[] => {
  let allValues: SqlField[] = [];
  const isExistFlatten = checkIsExistFlatten(fields);
  
  if (!isExistFlatten) {
    return fields;
  }

  fields.forEach((el) => {
    if (!el.flatten) allValues.push(el);
    if (el.arrayFields) {
      if (allValues.indexOf(el) === -1) allValues.push(el);
      allValues = [...allValues, ...getAllFields(el.arrayFields)];
    }
  });
  
  return allValues;
};

/**
 * Check if any field has flatten property
 * @param fields - List of fields
 * @returns True if any field is flattened
 */
export const checkIsExistFlatten = (fields: SqlField[]): boolean => {
  for (const field of fields) {
    if (field.flatten) return true;
    if (field.arrayFields && checkIsExistFlatten(field.arrayFields)) {
      return true;
    }
  }
  return false;
};

/**
 * Count hidden fields
 * @param fields - List of fields
 * @returns Number of hidden fields
 */
export const countHiddenFields = (fields: SqlField[]): number => {
  let count = 0;
  for (const field of fields) {
    if (field.hidden) count++;
    if (field.arrayFields) {
      count += countHiddenFields(field.arrayFields);
    }
  }
  return count;
};

/**
 * Count hidden tables
 * @param tables - List of tables
 * @returns Number of hidden tables
 */
export const countHiddenTables = (tables: any[]): number => {
  return tables.filter((el) => el.hidden).length;
};

/**
 * Filter visible items (not hidden)
 * @param items - List of items
 * @returns Filtered list of visible items
 */
export const filterVisible = <T extends { hidden?: boolean }>(items: T[]): T[] => {
  return items.filter((el) => !el.hidden);
};

/**
 * Filter hidden items
 * @param items - List of items
 * @returns Filtered list of hidden items
 */
export const filterHidden = <T extends { hidden?: boolean }>(items: T[]): T[] => {
  return items.filter((el) => el.hidden);
};

