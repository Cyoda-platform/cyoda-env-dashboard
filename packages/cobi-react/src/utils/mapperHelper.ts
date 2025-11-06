/**
 * Mapper Helper
 * Utilities for data mapping operations
 */

import type { EntityMappingConfigDto, ColumnMappingConfigDto } from '../types';

/**
 * Generate unique UI ID
 */
export function generateUiId(): string {
  return `ui_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Find relation by paths
 */
export function findRelationByPaths(
  relations: ColumnMappingConfigDto[],
  srcPath: string,
  dstPath: string
): ColumnMappingConfigDto | undefined {
  return relations.find((r) => r.srcColumnPath === srcPath && r.dstCyodaColumnPath === dstPath);
}

/**
 * Find relations by source path
 */
export function findRelationsBySourcePath(
  relations: ColumnMappingConfigDto[],
  path: string
): ColumnMappingConfigDto[] {
  return relations.filter((r) => r.srcColumnPath === path);
}

/**
 * Find relations by target path
 */
export function findRelationsByTargetPath(
  relations: ColumnMappingConfigDto[],
  path: string
): ColumnMappingConfigDto[] {
  return relations.filter((r) => r.dstCyodaColumnPath === path);
}

/**
 * Check if path has relations
 */
export function hasRelations(
  relations: ColumnMappingConfigDto[],
  path: string,
  type: 'source' | 'target'
): boolean {
  if (type === 'source') {
    return relations.some((r) => r.srcColumnPath?.startsWith(path));
  }
  return relations.some((r) => r.dstCyodaColumnPath?.startsWith(path));
}

/**
 * Remove relations for path
 */
export function removeRelationsForPath(
  relations: ColumnMappingConfigDto[],
  path: string,
  type: 'source' | 'target'
): ColumnMappingConfigDto[] {
  if (type === 'source') {
    return relations.filter((r) => !r.srcColumnPath?.startsWith(path));
  }
  return relations.filter((r) => !r.dstCyodaColumnPath?.startsWith(path));
}

/**
 * Get relation display name
 */
export function getRelationDisplayName(relation: ColumnMappingConfigDto): string {
  if (relation.srcColumnPath && relation.dstCyodaColumnPath) {
    return `${relation.srcColumnPath} → ${relation.dstCyodaColumnPath}`;
  }
  return 'Unnamed Relation';
}

/**
 * Validate relation
 */
export function validateRelation(relation: ColumnMappingConfigDto): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!relation.srcColumnPath) {
    errors.push('Source path is required');
  }

  if (!relation.dstCyodaColumnPath) {
    errors.push('Target path is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create default relation
 */
export function createDefaultRelation(
  srcPath?: string,
  dstPath?: string
): ColumnMappingConfigDto {
  return {
    srcColumnPath: srcPath || '',
    dstCyodaColumnPath: dstPath || '',
    transformer: {
      children: [],
      type: 'COMPOSITE',
    },
    dstCyodaColumnPathType: '',
    dstCollectionElementSetModes: [],
  };
}

/**
 * Clone relation
 */
export function cloneRelation(relation: ColumnMappingConfigDto): ColumnMappingConfigDto {
  return JSON.parse(JSON.stringify(relation));
}

/**
 * Get non-mapping fields
 */
export function getNonMappingFields(
  entityMapping: EntityMappingConfigDto,
  allFields: string[]
): string[] {
  const mappedFields = new Set(
    entityMapping.columns?.map((c) => c.dstCyodaColumnPath) || []
  );

  return allFields.filter((field) => !mappedFields.has(field));
}

/**
 * Check if field is mapped
 */
export function isFieldMapped(
  entityMapping: EntityMappingConfigDto,
  fieldPath: string
): boolean {
  return entityMapping.columns?.some((c) => c.dstCyodaColumnPath === fieldPath) || false;
}

/**
 * Get mapping statistics
 */
export function getMappingStatistics(entityMapping: EntityMappingConfigDto): {
  totalRelations: number;
  simpleRelations: number;
  transformedRelations: number;
  functionalRelations: number;
} {
  const relations = entityMapping.columns || [];
  const functionalMappings = entityMapping.functionalMappings || [];

  return {
    totalRelations: relations.length,
    simpleRelations: relations.filter((r) => !r.transformer?.children?.length).length,
    transformedRelations: relations.filter((r) => r.transformer?.children?.length).length,
    functionalRelations: functionalMappings.length,
  };
}

/**
 * Sort relations by path
 */
export function sortRelationsByPath(
  relations: ColumnMappingConfigDto[],
  type: 'source' | 'target'
): ColumnMappingConfigDto[] {
  return [...relations].sort((a, b) => {
    const pathA = type === 'source' ? a.srcColumnPath : a.dstCyodaColumnPath;
    const pathB = type === 'source' ? b.srcColumnPath : b.dstCyodaColumnPath;
    return (pathA || '').localeCompare(pathB || '');
  });
}

/**
 * Group relations by entity
 */
export function groupRelationsByEntity(
  relations: ColumnMappingConfigDto[]
): Record<string, ColumnMappingConfigDto[]> {
  const groups: Record<string, ColumnMappingConfigDto[]> = {};

  relations.forEach((relation) => {
    const entityPath = relation.dstCyodaColumnPath?.split('.')[0] || 'root';
    if (!groups[entityPath]) {
      groups[entityPath] = [];
    }
    groups[entityPath].push(relation);
  });

  return groups;
}

/**
 * Find target path in tree
 */
export function findTargetPath(tree: any, path: string): any {
  if (!tree || !path) return null;

  const parts = path.split('.');
  let current = tree;

  for (const part of parts) {
    if (!current) return null;
    if (Array.isArray(current)) {
      current = current.find((item: any) => item.name === part);
    } else if (current.children) {
      current = current.children.find((item: any) => item.name === part);
    } else if (current[part]) {
      current = current[part];
    } else {
      return null;
    }
  }

  return current;
}

/**
 * Build path from tree node
 */
export function buildPathFromNode(node: any, separator: string = '.'): string {
  const parts: string[] = [];
  let current = node;

  while (current) {
    if (current.name) {
      parts.unshift(current.name);
    }
    current = current.parent;
  }

  return parts.join(separator);
}

/**
 * Transform path to JavaScript notation
 * Converts paths like root:/users/asterisk/name to users[0].name
 */
export function transformPathToJs(path: string): string {
  return path
    .replace(/\/\//g, '/')
    .replace(/root:\//g, '')
    .replace(/(\/)?\*/g, '[0]')
    .replace(/\//g, '.')
    .replace(/\.+$/g, '');
}

/**
 * Transform path to JavaScript array notation
 */
export function transformPathToJsAsArray(path: string): string[] {
  return path
    .replace('//', '/')
    .replace('root:/', '')
    .replace(/(\/)?\*/g, '/0')
    .split('/')
    .filter((el) => el);
}

/**
 * Generate relative path options for tree select
 * Recursively builds tree structure from data object
 */
export function relativePathOptions(
  data: any,
  parentPath: string = '',
  children: any[] = [],
  isShowAll: boolean = false
): any[] {
  const isArray = Array.isArray(data);

  Object.keys(data).forEach((key, index) => {
    // For arrays, only process first element
    if (isArray && index > 0) {
      return;
    }

    // Skip non-object values unless isShowAll is true
    if (!isShowAll && typeof data[key] !== 'object' && !isArray) {
      return;
    }

    const label = isArray ? '*' : key;
    const path = `${parentPath}${label}`;
    const item: any = {
      title: path,
      value: path,
      label: path,
      labelShort: label,
    };

    // Recursively process object/array children
    if (typeof data[key] === 'object' && data[key] !== null) {
      item.children = [];
      relativePathOptions(data[key], `${path}/`, item.children, isShowAll);

      // Remove empty children array
      if (item.children && item.children.length === 0) {
        delete item.children;
      }
    }

    children.push(item);
  });

  return children;
}

/**
 * Clear auto-generated fields from statements
 * Used for Blockly validation
 */
export function clearAutoGeneratedFields(statements: any[]): any[] {
  statements.forEach((statement) => {
    if (['ASSIGN_VAR', 'RETURN'].includes(statement.type) && statement.dstPath) {
      delete statement.dstPath;
    }
  });
  return statements;
}
