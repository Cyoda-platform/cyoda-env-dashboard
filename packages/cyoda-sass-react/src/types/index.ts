/**
 * Type definitions for Cyoda SaaS - Trino SQL Schema Management
 */

/**
 * SQL Field definition
 */
export interface SqlField {
  /** Field name (must match regex: ^[a-z_][a-z0-9_]{0,127}$) */
  fieldName: string;
  /** Field type (e.g., 'varchar', 'integer', 'array', etc.) */
  fieldType: string;
  /** Field key (unique identifier) */
  fieldKey?: string;
  /** Data type (alternative to fieldType) */
  dataType?: string;
  /** Field category (e.g., DATA, METADATA) */
  fieldCategory?: string;
  /** Whether the field is an array */
  isArray?: boolean;
  /** Whether this field is flattened from an array */
  flatten?: boolean;
  /** Nested fields for array types */
  arrayFields?: SqlField[];
  /** Whether this field is hidden (soft delete) */
  hidden?: boolean;
  /** Original field name before transformation */
  originalFieldName?: string;
  /** Field description */
  description?: string;
}

/**
 * SQL Table definition
 */
export interface SqlTable {
  /** Metadata class ID (UUID) */
  metadataClassId: string;
  /** Table name (must match regex: ^[a-z_][a-z0-9_]{0,127}$) */
  tableName: string;
  /** Uniformed path for the table */
  uniformedPath: string;
  /** List of fields in the table */
  fields: SqlField[];
  /** Whether this table is hidden (soft delete) */
  hidden?: boolean;
  /** Last update timestamp for the model */
  modelUpdateDate?: number;
  /** Whether the table is currently being updated */
  isLoading?: boolean;
}

/**
 * SQL Schema definition
 */
export interface SqlSchema {
  /** Schema ID (UUID, null for new schemas) */
  id: string | null;
  /** Schema name (must match regex: ^[a-z_][a-z0-9_]{0,127}$) */
  schemaName: string;
  /** List of tables in the schema */
  tables: SqlTable[];
  /** Creation timestamp (derived from UUID) */
  timestamp?: number;
}

/**
 * Entity Model definition (from backend)
 */
export interface EntityModel {
  /** Model ID */
  id: string;
  /** Model name */
  name: string;
  /** Model name (alternative) */
  modelName?: string;
  /** Model version */
  modelVersion?: string;
  /** Current state */
  currentState?: string;
  /** Model update date */
  modelUpdateDate?: number;
  /** Model type */
  type?: string;
  /** Model description */
  description?: string;
  /** Model fields */
  fields?: any[];
}

/**
 * Generated Table from entity model
 */
export interface GeneratedTable {
  /** Metadata class ID */
  metadataClassId: string;
  /** Table name */
  tableName: string;
  /** Uniformed path */
  uniformedPath: string;
  /** Fields */
  fields: SqlField[];
}

/**
 * Form state for TrinoIndex page
 */
export interface TrinoIndexFormState {
  /** Filter text */
  filter: string;
  /** Current page number */
  currentPage: number;
  /** Page size */
  pageSize: number;
}

/**
 * Form state for TrinoEdit page
 */
export interface TrinoEditFormState {
  /** Filter text for tables */
  filter: string;
}

/**
 * Table save state (for persistence)
 */
export interface TableSaveState {
  /** Column widths */
  columnWidths?: Record<string, number>;
  /** Column order */
  columnOrder?: string[];
  /** Sort configuration */
  sort?: {
    prop: string;
    order: 'ascending' | 'descending';
  };
  /** Page size */
  pageSize?: number;
  /** Current page */
  currentPage?: number;
}

/**
 * Validation rule
 */
export interface ValidationRule {
  /** Whether the field is required */
  required?: boolean;
  /** Error message */
  message?: string;
  /** Trigger event */
  trigger?: 'blur' | 'change';
  /** Custom validator function */
  validator?: (rule: any, value: any, callback: any) => void;
}

/**
 * AI Chatbot message
 */
export interface ChatbotMessage {
  /** Message type */
  type: 'text' | 'code' | 'error';
  /** Message text */
  text: string;
  /** Message timestamp */
  timestamp?: number;
}

/**
 * AI Chatbot response
 */
export interface ChatbotResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Response message */
  message: string;
  /** Additional data */
  data?: any;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  /** Response data */
  data: T;
  /** Response status */
  status: number;
  /** Response message */
  message?: string;
}

/**
 * Error response
 */
export interface ErrorResponse {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Error details */
  details?: any;
}

/**
 * Menu item definition
 */
export interface MenuItem {
  /** Menu item link */
  link: string;
  /** Menu item name */
  name: string;
  /** Menu item icon */
  icon: string;
  /** Whether the menu item is active */
  active?: boolean;
}

/**
 * App state
 */
export interface AppState {
  /** Active menu link */
  activeMenuLink?: string;
  /** Whether the menu is toggled */
  isToggledMenu: boolean;
}

/**
 * Store actions for app state
 */
export interface AppActions {
  /** Set active menu link */
  setActiveMenuLink: (link: string) => void;
  /** Toggle menu */
  toggleMenu: () => void;
}

/**
 * Combined app store type
 */
export type AppStore = AppState & AppActions;

/**
 * Field type options
 */
export const FIELD_TYPES = [
  'varchar',
  'integer',
  'bigint',
  'double',
  'boolean',
  'date',
  'timestamp',
  'array',
  'row',
  'map',
  'json',
] as const;

export type FieldType = typeof FIELD_TYPES[number];

/**
 * Regex pattern for field/table/schema names
 */
export const FIELD_NAME_REGEX = /^[a-z_][a-z0-9_]{0,127}$/;

/**
 * Error message for field name validation
 */
export const FIELD_NAME_ERROR_MESSAGE = 
  'The value must start with a letter, followed by letters, digits, or underscores';

