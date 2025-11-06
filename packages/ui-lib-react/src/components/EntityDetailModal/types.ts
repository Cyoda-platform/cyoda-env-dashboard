/**
 * Type definitions for Entity Detail Modal
 */

export interface ConfigDefinition {
  id?: string;
  description?: string;
  groupingVersion?: string;
  requestClass?: string;
  columns?: Array<{
    name: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

