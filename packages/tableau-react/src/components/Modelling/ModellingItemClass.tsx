/**
 * ModellingItemClass Component
 * Individual class item with expandable children
 * Migrated from: CyodaModellingItemClass.vue
 * Fixed: Removed Spin wrapper to prevent click event interference
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Spin } from 'antd';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import { ModellingGroup } from './ModellingGroup';
import { ModellingItemClassForm } from './ModellingItemClassForm';
import type { RequestParam, ColDef, ReportingInfoRow } from '../../types/modelling';
import { useModellingStore } from '../../stores/modellingStore';
import { getReportingInfo } from '../../api/modelling';
import HelperModelling from '../../utils/HelperModelling';
import './ModellingItemClass.scss';

interface ModellingItemClassProps {
  requestParam: RequestParam;
  type: string;
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

export const ModellingItemClass: React.FC<ModellingItemClassProps> = ({
  requestParam,
  type,
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
  const [reportingInfoRows, setReportingInfoRows] = useState<ReportingInfoRow[] | null>(null);
  const [isShowGroup, setIsShowGroup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState<string[]>([]);

  const { searchResult } = useModellingStore();

  // Computed values
  const classPath = useMemo(() => {
    const path: string[] = [];
    if (parentColDef.fullPath) {
      path.push(parentColDef.fullPath);
    }
    path.push(requestParam.columnPath + '@' + requestParam.reportClass.replace(/\./g, '#'));
    return path.join('.');
  }, [parentColDef, requestParam]);

  const getChecked = useMemo(() => {
    return checked.find((path) => {
      if (!path || !path.fullPath) return false;
      const selectedPathBySegments = path.fullPath.replace(/\.\[[^\]]*\]/g, '').split(/@|\./);
      const fullPathOfRowSegments = classPath
        .replace(/\.\[[^\]]*\]/g, '')
        .split(/@|\./)
        .filter((el) => !el.includes('java#'));

      for (let i = 0; i < fullPathOfRowSegments.length; i++) {
        if (selectedPathBySegments[i] !== fullPathOfRowSegments[i]) {
          return false;
        }
      }
      return true;
    });
  }, [checked, classPath]);

  const reportClassComputed = useMemo(() => {
    if (isCondenseThePaths) {
      const parts = requestParam.reportClass.split('.');
      return parts[parts.length - 1];
    }
    return requestParam.reportClass;
  }, [isCondenseThePaths, requestParam.reportClass]);

  const isSearchCondition = useMemo(() => {
    if (!search) {
      return true;
    }
    return searchResult.some((path: string) => {
      let result = false;
      if (path.indexOf('@') !== -1) {
        let compareString = classPath;
        if (compareString.indexOf('@') === -1) {
          compareString += '@';
        }
        result = path.indexOf(compareString) !== -1;
      } else {
        result = path === classPath;
      }
      return result;
    });
  }, [search, searchResult, classPath]);

  // Fill form from checked values
  useEffect(() => {
    if (requestParam.types && requestParam.types.length > 0 && getChecked) {
      const selectedPathBySegments = getChecked.fullPath.replace(/\[|\]/g, '').split(/@|\./);
      const fullPathOfRowSegments = requestParam.columnPath.replace(/\[|\]/g, '').split(/@|\./);
      const result = selectedPathBySegments[fullPathOfRowSegments.length - 1];

      if (result) {
        setFormValues([result]);
      }
    }
  }, [requestParam, getChecked]);

  // Handle "Open all selected" toggle
  // Use a ref to track the previous value of isOpenAllSelected
  const prevIsOpenAllSelectedRef = useRef(isOpenAllSelected);

  useEffect(() => {
    console.log('ModellingItemClass useEffect', {
      reportClassComputed,
      prevIsOpenAllSelected: prevIsOpenAllSelectedRef.current,
      isOpenAllSelected,
      getChecked: !!getChecked,
      isShowGroup,
      changed: prevIsOpenAllSelectedRef.current !== isOpenAllSelected
    });

    // Only run if isOpenAllSelected actually changed
    if (prevIsOpenAllSelectedRef.current !== isOpenAllSelected) {
      console.log('isOpenAllSelected CHANGED - running collapse/expand logic');
      prevIsOpenAllSelectedRef.current = isOpenAllSelected;

      if (isOpenAllSelected && getChecked) {
        // Open the item if it's checked
        if (!isShowGroup) {
          handleClick();
        }
      } else if (!isOpenAllSelected && getChecked && isShowGroup) {
        // Only collapse if it's currently open
        setIsShowGroup(false);
      }
    }
  }, [isOpenAllSelected, getChecked, isShowGroup]);

  // Load data with optional form values
  const loadData = async (columnPath: string) => {
    setIsLoading(true);
    try {
      const { data } = await getReportingInfo(
        requestParam.requestClass,
        requestParam.reportClass,
        columnPath,
        onlyRange
      );
      setReportingInfoRows(HelperModelling.sortData(HelperModelling.filterData(data)));
    } catch (error) {
      console.error('Failed to load class data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when clicked
  const handleClick = async (e?: React.MouseEvent) => {
    // Check if the click came from the content area (nested children)
    if (e) {
      const target = e.target as HTMLElement;
      // If the click came from within the content area, ignore it
      if (target.closest('.modelling-item-class-content')) {
        console.log('Ignoring click from content area');
        return;
      }
    }

    console.log('handleClick proceeding for', reportClassComputed);
    if (!reportingInfoRows) {
      await loadData(requestParam.columnPath);
    }
    setIsShowGroup(!isShowGroup);
  };

  // Handle form change
  const handleFormChange = async (values: string[]) => {
    let columnPath = requestParam.baseColumnPath;
    if (values && values.length > 0) {
      values.forEach((val) => {
        columnPath += `.[${val}]`;
      });
    }
    await loadData(columnPath);
  };

  if (!isSearchCondition) {
    return null;
  }

  return (
    <div className="modelling-item-class" style={{ position: 'relative' }}>
      <div onClick={handleClick} className="modelling-item-class-header" style={{ display: 'inline-block' }}>
        {(!reportingInfoRows || reportingInfoRows.length > 0) && (
          <span className={getChecked ? 'checked-path' : ''} style={{ cursor: 'pointer', display: 'inline-block' }}>
            {isShowGroup ? <CaretDownOutlined /> : <CaretRightOutlined />}
          </span>
        )}

        <span className={`name ${getChecked ? 'checked-path' : ''}`} style={{ marginLeft: 8, display: 'inline-block' }}>
          {!reportingInfoRows || reportingInfoRows.length > 0 ? (
            <a style={{ display: 'inline' }}>{reportClassComputed}</a>
          ) : (
            <span className="empty-link">{reportClassComputed}</span>
          )}
        </span>
      </div>

      {isShowGroup && (
        <div className="modelling-item-class-content">
          {/* Form for types (LIST/MAP indices) */}
          {requestParam.types && requestParam.types.length > 0 && !onlyView && (
            <ModellingItemClassForm
              types={requestParam.types}
              values={formValues}
              onChange={handleFormChange}
            />
          )}

          {reportingInfoRows && (
            <ModellingGroup
              reportInfoRows={reportingInfoRows}
              requestClass={requestParam.requestClass}
              checked={checked}
              limit={limit}
              search={search}
              isCondenseThePaths={isCondenseThePaths}
              isOpenAllSelected={isOpenAllSelected}
              onlyRange={onlyRange}
              onlyView={onlyView}
              disablePreview={disablePreview}
              parentColDef={parentColDef}
            />
          )}
        </div>
      )}

      {isLoading && (
        <Spin style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      )}
    </div>
  );
};

