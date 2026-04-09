/**
 * EntityDetailTree Component
 * Displays entity fields in a tree structure with expandable nested fields
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterEntity/DetailTree.vue
 */

import React from 'react';
import type { Entity } from '@cyoda/http-api-react/types';
import EntityDetailTreeItem from './EntityDetailTreeItem';
import { HelperFormat } from '@cyoda/ui-lib-react';
import './EntityDetailTree.scss';

interface EntityDetailTreeProps {
  entity: Entity[];
  showEmpty: boolean;
  entityId?: string;
  entityClass?: string;
}

const EntityDetailTree: React.FC<EntityDetailTreeProps> = ({ entity, showEmpty, entityId, entityClass }) => {
  // Filter fields based on showEmpty setting
  const visibleFields = entity.filter((field: Entity) => {
    // Only filter LEAF type fields when showEmpty is false
    if (field.type === 'LEAF') {
      const value = HelperFormat.getValue(field.value);
      return value !== '-' || showEmpty;
    }

    // Always show non-LEAF types (LIST, EMBEDDED, MAP)
    return true;
  });

  return (
    <div className="entity-detail-tree">
      {visibleFields.map((field, index) => (
        <EntityDetailTreeItem
          key={index}
          column={field}
          showEmpty={showEmpty}
          entityId={entityId}
          entityClass={entityClass}
        />
      ))}
    </div>
  );
};

export default EntityDetailTree;

