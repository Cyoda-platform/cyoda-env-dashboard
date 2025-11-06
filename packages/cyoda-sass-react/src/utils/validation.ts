import { FIELD_NAME_REGEX, FIELD_NAME_ERROR_MESSAGE } from '../types';

/**
 * Validate field name against regex pattern
 * @param value - Field name to validate
 * @returns Error message if invalid, false if valid
 */
export const validateFieldName = (value: string): string | false => {
  if (!value) return false;
  const isMatch = value.match(FIELD_NAME_REGEX);
  if (!isMatch) {
    return FIELD_NAME_ERROR_MESSAGE;
  }
  return false;
};

/**
 * Validate schema name
 * @param value - Schema name to validate
 * @returns Error message if invalid, undefined if valid
 */
export const validateSchemaName = (value: string): string | undefined => {
  const error = validateFieldName(value);
  return error || undefined;
};

/**
 * Validate table name uniqueness
 * @param value - Table name to validate
 * @param tables - List of all tables
 * @returns Error message if invalid, undefined if valid
 */
export const validateTableName = (value: string, tables: any[]): string | undefined => {
  // Check uniqueness
  const fieldNames = tables.filter((el) => !el.hidden).filter((el) => el.tableName === value);
  if (fieldNames.length > 1) {
    return 'The "Table Name" field must be unique';
  }

  // Check regex
  const error = validateFieldName(value);
  return error || undefined;
};

/**
 * Convert field value to lowercase
 * @param value - Value to convert
 * @returns Lowercase value
 */
export const toLowerCaseField = (value: string): string => {
  return value.toString().toLowerCase();
};

/**
 * Get time from UUID v1
 * @param uuid - UUID string
 * @returns Timestamp in milliseconds
 */
export const getTimeFromUuid = (uuid: string): number => {
  try {
    // UUID v1 format: xxxxxxxx-xxxx-1xxx-xxxx-xxxxxxxxxxxx
    // Time is in the first 3 groups
    const parts = uuid.split('-');
    if (parts.length !== 5) return Date.now();
    
    const timeLow = parts[0];
    const timeMid = parts[1];
    const timeHi = parts[2].substring(1); // Remove version digit
    
    // Combine time parts
    const timeHex = timeHi + timeMid + timeLow;
    const time = parseInt(timeHex, 16);
    
    // UUID v1 time is in 100-nanosecond intervals since Oct 15, 1582
    // Convert to milliseconds since Unix epoch
    const UUID_EPOCH_OFFSET = 122192928000000000n; // Offset in 100-nanosecond intervals
    const timeInMs = Number((BigInt(time) - UUID_EPOCH_OFFSET) / 10000n);
    
    return timeInMs;
  } catch (error) {
    console.error('Failed to extract time from UUID:', error);
    return Date.now();
  }
};

