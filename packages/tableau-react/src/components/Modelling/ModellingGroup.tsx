/**
 * ModellingGroup Component
 * Renders a list of modelling items
 * Migrated from: CyodaModellingGroup.vue
 */

import React from 'react';
import { ModellingItem } from './ModellingItem';
import type { ReportingInfoRow, RelatedPath, ColDef } from '../../types/modelling';
import './ModellingGroup.scss';

interface ModellingGroupProps {
  reportInfoRows: ReportingInfoRow[];
  relatedPaths?: RelatedPath[];
  requestClass: string;
  checked: ColDef[];
  limit?: number | null;
  onlyRange?: boolean;
  isOpenAllSelected?: boolean;
  isCondenseThePaths?: boolean;
  search?: string;
  parentColDef?: any;
  onlyView?: boolean;
  disablePreview?: boolean;
  className?: string;
}

export const ModellingGroup: React.FC<ModellingGroupProps> = ({
  reportInfoRows,
  relatedPaths = [],
  requestClass,
  checked,
  limit = null,
  onlyRange = false,
  isOpenAllSelected = false,
  isCondenseThePaths = false,
  search = '',
  parentColDef = {},
  onlyView = false,
  disablePreview = false,
  className = '',
}) => {
  return (
    <ul className={`modelling-group ${className}`}>
      {reportInfoRows.map((reportInfoRow) => (
        <li key={reportInfoRow.columnPath}>
          <ModellingItem
            reportInfoRow={reportInfoRow}
            relatedPaths={relatedPaths}
            requestClass={requestClass}
            checked={checked}
            limit={limit}
            onlyRange={onlyRange}
            isOpenAllSelected={isOpenAllSelected}
            isCondenseThePaths={isCondenseThePaths}
            search={search}
            parentColDef={parentColDef}
            onlyView={onlyView}
            disablePreview={disablePreview}
          />
        </li>
      ))}
    </ul>
  );
};

