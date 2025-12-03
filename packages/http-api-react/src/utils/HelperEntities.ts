/**
 * HelperEntities
 * Helper functions for entity operations
 * 
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/helpers/HelperEntities.ts
 */

export interface EntityOption {
  value: string;
  label: string;
}

export interface EntityTypeData {
  name: string;
  type?: 'BUSINESS' | 'PERSISTENCE';
}

export default class HelperEntities {
  /**
   * Map entity type to display name
   */
  static entityTypeMapper(value: 'BUSINESS' | 'PERSISTENCE'): string {
    const map: Record<string, string> = {
      BUSINESS: 'Business',
      PERSISTENCE: 'Technical',
    };
    return map[value] || value;
  }

  /**
   * Convert entity data to select options
   */
  static getOptionsFromData(
    data: (string | EntityTypeData)[],
    type: 'BUSINESS' | 'PERSISTENCE' | null = null
  ): EntityOption[] {
    return data
      .map((el) => {
        // Handle both string and object formats
        if (typeof el === 'string') {
          return {
            value: el,
            label: el,
          };
        }

        // Object format with type filtering
        if (type && el.type !== type) {
          return null;
        }

        return {
          value: el.name,
          label: HelperEntities.getLabel(el),
        };
      })
      .filter((el): el is EntityOption => el !== null);
  }

  /**
   * Get label for entity (type is shown via toggle)
   */
  static getLabel(el: EntityTypeData): string {
    return el.name;
  }

  /**
   * Get short name of entity (last part after dot)
   */
  static getShortNameOfEntity(entityClass: string): string {
    if (!entityClass) return '';
    
    if (
      entityClass.startsWith('com.cyoda.') ||
      entityClass.startsWith('net.cyoda.') ||
      entityClass.includes('.cyoda.')
    ) {
      const parts = entityClass.split('.');
      return parts[parts.length - 1] || entityClass;
    }
    
    return entityClass;
  }
}

