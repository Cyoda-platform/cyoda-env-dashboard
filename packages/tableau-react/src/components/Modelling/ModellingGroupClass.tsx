/**
 * ModellingGroupClass Component
 * Renders a list of class-based modelling items
 * Migrated from: CyodaModellingGroupClass.vue
 */

import React from 'react';
import { ModellingItemClass } from './ModellingItemClass';
import type { RequestParam, ColDef } from '../../types/modelling';
import './ModellingGroupClass.scss';

interface ModellingGroupClassProps {
  requestParams: RequestParam[];
  type: string;
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
}

export const ModellingGroupClass: React.FC<ModellingGroupClassProps> = ({
  requestParams,
  type,
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
}) => {
  return (
    <ul className="modelling-group-class">
      {requestParams.map((requestParam, index) => (
        <li key={`${requestParam.columnPath}-${index}`}>
          <ModellingItemClass
            requestParam={requestParam}
            type={type}
            checked={checked}
            limit={limit}
            onlyRange={onlyRange}
            isOpenAllSelected={isOpenAllSelected}
            isCondenseThePaths={isCondenseThePaths}
            search={search}
            parentColDef={parentColDef}
            onlyView={onlyView}
            disablePreview={disablePreview}
            autoExpand={true}
          />
        </li>
      ))}
    </ul>
  );
};

