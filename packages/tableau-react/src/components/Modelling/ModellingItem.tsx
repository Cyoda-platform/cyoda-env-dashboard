/**
 * ModellingItem Component
 * Individual column item with checkbox, preview, and child navigation
 * Migrated from: CyodaModellingItem.vue
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Checkbox, Tooltip } from 'antd';
import { EyeOutlined, CaretDownOutlined, CaretRightOutlined, LinkOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ModellingGroupClass } from './ModellingGroupClass';
import { ModellingGroup } from './ModellingGroup';
import { ModellingItemClassForm } from './ModellingItemClassForm';
import type { ReportingInfoRow, RelatedPath, ColDef, RequestParam } from '../../types/modelling';
import HelperModelling from '../../utils/HelperModelling';
import { HelperEntities, eventBus } from '@cyoda/http-api-react/utils';
import { useModellingStore } from '../../stores/modellingStore';
import { useEntityViewerStore } from '@cyoda/http-api-react/stores';
import { getReportingInfo, getReportingRelatedPaths } from '../../api/modelling';
import './ModellingItem.scss';

interface ModellingItemProps {
  reportInfoRow: ReportingInfoRow;
  requestClass: string;
  checked: ColDef[];
  limit?: number | null;
  onlyRange?: boolean;
  isOpenAllSelected?: boolean;
  isCondenseThePaths?: boolean;
  search?: string;
  relatedPaths?: RelatedPath[];
  parentColDef?: any;
  onlyView?: boolean;
  disablePreview?: boolean;
}

export const ModellingItem: React.FC<ModellingItemProps> = ({
  reportInfoRow,
  requestClass,
  checked,
  limit = null,
  onlyRange = false,
  isOpenAllSelected = false,
  isCondenseThePaths = false,
  search = '',
  relatedPaths = [],
  parentColDef = {},
  onlyView = false,
  disablePreview = false,
}) => {
  const [isShowGroupClass, setIsShowGroupClass] = useState(false);
  const [isShowJoin, setIsShowJoin] = useState(false);
  const [reportingInfoRows, setReportingInfoRows] = useState<ReportingInfoRow[]>([]);
  const [relatedPathsInner, setRelatedPathsInner] = useState<RelatedPath[]>([]);
  const [formValues, setFormValues] = useState<string[]>([]);

  // Track previous value of isOpenAllSelected to detect changes
  const prevIsOpenAllSelectedRef = useRef<boolean>(isOpenAllSelected);

  const { searchResult, addSearchPath, removeSearchPath } = useModellingStore();
  const { addEntity } = useEntityViewerStore();

  // Computed values
  const notPrimitiveList = ['EMBEDDED', 'LIST', 'MAP'];

  const isChildAvailable = useMemo(() => {
    let element: ReportingInfoRow | undefined;
    if (reportInfoRow.elementInfo) {
      element = reportInfoRow.elementInfo;
    }
    if (reportInfoRow.elementType) {
      element = reportInfoRow.elementType;
    }
    return notPrimitiveList.includes(reportInfoRow.type) && element?.type !== 'LEAF';
  }, [reportInfoRow]);

  const joinItem = useMemo(() => {
    return relatedPaths.find((el) => el?.columnPath?.replace('.[*]', '') === reportInfoRow.columnName);
  }, [relatedPaths, reportInfoRow.columnName]);

  const isJoinAvailable = useMemo(() => {
    return joinItem && Object.keys(joinItem).length > 0;
  }, [joinItem]);

  const canBeSelected = useMemo(() => {
    if (reportInfoRow.type === 'LEAF') {
      return true;
    }
    if (reportInfoRow.elementInfo) {
      return reportInfoRow.elementInfo.type === 'LEAF';
    }
    if (reportInfoRow.elementType) {
      return reportInfoRow.elementType.type === 'LEAF';
    }
    return false;
  }, [reportInfoRow]);

  const fullPath = useMemo(() => {
    const path: string[] = [];
    if (parentColDef.fullPath) {
      path.push(parentColDef.fullPath);
    }
    const element = reportInfoRow.elementInfo || reportInfoRow.elementType || reportInfoRow;
    path.push(element.columnPath);
    return path.join('.');
  }, [parentColDef, reportInfoRow]);

  // Get the element (unwrap LIST/MAP types to get the actual element type)
  const getElement = useMemo(() => {
    let element = reportInfoRow;
    if (element.elementType) {
      element = element.elementType;
    }
    if (element.elementInfo) {
      element = element.elementInfo;
    }
    return element;
  }, [reportInfoRow]);

  const label = useMemo(() => {
    const element = getElement;
    return {
      fullPath,
      colType: element.clazzType || reportInfoRow.type,
    };
  }, [fullPath, getElement, reportInfoRow.type]);

  const getChecked = useMemo(() => {
    return checked.find((path) => {
      if (!path || !path.fullPath) return false;
      const selectedPathBySegments = path.fullPath.replace(/\.\[[^\]]*\]/g, '').split(/@|\./);
      const fullPathOfRowSegments = fullPath.replace(/\.\[[^\]]*\]/g, '').split(/@|\./);
      for (let i = 0; i < fullPathOfRowSegments.length; i++) {
        if (selectedPathBySegments[i] !== fullPathOfRowSegments[i]) {
          return false;
        }
      }
      return true;
    });
  }, [checked, fullPath]);

  const isDisabled = useMemo(() => {
    if (limit) {
      return checked.length >= limit && !getChecked;
    }
    return false;
  }, [limit, checked, getChecked]);

  const allRequestParams = useMemo(() => {
    const params = HelperModelling.allRequestParams(reportInfoRow, requestClass);
    if (reportInfoRow.columnName === 'indexedValues') {
      console.log('[ModellingItem] allRequestParams for indexedValues:', {
        reportInfoRow,
        params,
        isChildAvailable
      });
    }
    return params;
  }, [reportInfoRow, requestClass, isChildAvailable]);

  const getTypes = useMemo(() => {
    const types: string[] = [];
    if (reportInfoRow.type === 'LIST') {
      types.push('Integer');
    }
    if (reportInfoRow.type === 'MAP' && (reportInfoRow as any).keyInfo) {
      const type = (reportInfoRow as any).keyInfo.split('.').pop();
      types.push(type!);
    }
    return types;
  }, [reportInfoRow]);

  const isAvailableForm = useMemo(() => {
    let isAvailable = false;
    if (reportInfoRow.elementType && reportInfoRow.elementType.type === 'LEAF') {
      isAvailable = true;
    }
    if (reportInfoRow.elementInfo && reportInfoRow.elementInfo.type === 'LEAF') {
      isAvailable = true;
    }
    return isAvailable;
  }, [reportInfoRow]);

  const isMap = useMemo(() => {
    return reportInfoRow.type === 'MAP';
  }, [reportInfoRow.type]);

  const isSearchCondition = useMemo(() => {
    if (!search) {
      return true;
    }
    return searchResult.some((path: string) => {
      let result = false;
      if (path.indexOf('@') !== -1) {
        let compareString = reportInfoRow.columnPath;
        if (compareString.indexOf('@') === -1) {
          compareString += '@';
        }
        result = path.indexOf(compareString) !== -1;
      } else {
        result = path.indexOf(reportInfoRow.columnPath) !== -1;
      }
      return result;
    });
  }, [search, searchResult, reportInfoRow.columnPath]);

  // Load join data when join is shown
  useEffect(() => {
    if (isShowJoin && joinItem?.targetEntityClass) {
      const loadJoinData = async () => {
        try {
          const { data } = await getReportingInfo(joinItem.targetEntityClass, '', '', onlyRange);
          setReportingInfoRows(HelperModelling.sortData(HelperModelling.filterData(data)));
          const { data: relatedData } = await getReportingRelatedPaths(joinItem.targetEntityClass);
          setRelatedPathsInner(relatedData);
        } catch (error) {
          console.error('Failed to load join data:', error);
        }
      };
      loadJoinData();
    }
  }, [isShowJoin, joinItem, onlyRange]);

  // Handle "Open all selected" toggle
  // Only run when isOpenAllSelected actually changes, not when getChecked changes
  useEffect(() => {
    // Only run if isOpenAllSelected actually changed
    if (prevIsOpenAllSelectedRef.current !== isOpenAllSelected) {
      prevIsOpenAllSelectedRef.current = isOpenAllSelected;

      if (isOpenAllSelected && getChecked) {
        // Open the item if it's checked
        setIsShowGroupClass(true);
        setIsShowJoin(true);
      } else if (!isOpenAllSelected && getChecked) {
        // Close the item if it's checked
        setIsShowGroupClass(false);
        setIsShowJoin(false);
      }
    }
  }, [isOpenAllSelected, getChecked]);

  // Handlers
  const handleClick = () => {
    setIsShowGroupClass(!isShowGroupClass);
  };

  const handleClickJoin = () => {
    if (onlyView && joinItem) {
      // In Entity Viewer mode, add a new entity box
      addEntity({
        from: requestClass,
        to: joinItem.targetEntityClass
      });
    } else {
      // In edit mode, toggle the join expansion
      setIsShowJoin(!isShowJoin);
    }
  };

  const handleClickEye = () => {
    // Only show unique values for LEAF type fields
    if (reportInfoRow.type !== 'LEAF' || disablePreview) {
      return;
    }

    // Get element and prepare parent parts
    const element = getElement;
    let parentPartsValue: any[] = [];
    if (parentColDef && Object.keys(parentColDef).length > 0) {
      parentPartsValue = parentColDef.parts.value;
    }

    // Create configDefinitionRequest matching the old Vue implementation
    const configDefinitionRequest = {
      '@bean': 'com.cyoda.core.streamdata.StreamDataRequest',
      pointTime: null,
      offset: 0,
      length: 100,
      fromPosIndex: 0,
      sdDef: {
        requestClass,
        rangeCondition: {
          '@bean': 'com.cyoda.core.conditions.queryable.GreaterThan',
          fieldName: 'creationDate',
          operation: 'GREATER_THAN',
          value: {
            '@type': 'java.util.Date',
            value: '1900-01-01T00:00:00.000+03:00',
          },
        },
        rangeOrder: 'ASC',
        condition: {
          '@bean': 'com.cyoda.core.conditions.GroupCondition',
          operator: 'AND',
          conditions: [],
        },
        columns: [
          {
            '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
            name: label.fullPath,
          },
        ],
        colDefs: [
          {
            fullPath: label.fullPath,
            parts: {
              '@meta': 'com.cyoda.core.reports.columndefs.ReportColPartDef[]',
              value: [
                ...parentPartsValue,
                {
                  rootClass: requestClass,
                  path: element.columnPath,
                  type: element.clazzType!,
                },
              ],
            },
            colType: label.colType,
          },
        ],
        aliasDefs: [],
      },
    };

    // Emit event to open StreamGrid with unique values
    eventBus.emit('streamGrid:open', {
      configDefinitionRequest,
      title: `Unique values for "${fullPath}" for 100 rows`,
    });
  };

  // Fill form from checked values
  useEffect(() => {
    if (getTypes.length > 0 && getChecked) {
      const selectedPathBySegments = getChecked.fullPath
        .replace(/\[|\]/g, '')
        .replace('..', '.$|dot|')
        .split(/@|\./)
        .filter((el) => el);
      const fullPathOfRowSegments = fullPath
        .replace(/\[|\]/g, '')
        .split(/@|\./)
        .filter((el) => el);

      const result = selectedPathBySegments[fullPathOfRowSegments.length - 1];
      if (result) {
        setFormValues([result]);
      }
    }
  }, [getTypes, getChecked, fullPath]);

  // Handle form change
  const handleFormChange = (form: string[]) => {
    const columnPath = `${reportInfoRow.columnPath}.[${form[0]}]`;
    let columnPathWithNameSpace = columnPath;
    if (parentColDef?.fullPath) {
      columnPathWithNameSpace = `${parentColDef.fullPath}.${columnPath}`;
    }
    const value = label.parts.value[label.parts.value.length - 1];
    if (value) {
      value.fullPath = columnPathWithNameSpace;
    }
  };



  if (!isSearchCondition) {
    return null;
  }

  return (
    <div className={`modelling-item ${getChecked ? 'checked-path' : ''} ${joinItem ? 'has-join' : ''}`}>
      <div className={`inner ${joinItem ? 'inner-related' : ''}`}>
        {/* Show link icon for joins, otherwise show eye icon */}
        {isJoinAvailable ? (
          <Tooltip title={`Related to ${joinItem!.targetEntityClass}`} placement="top">
            <LinkOutlined
              className={`join-link-icon ${isShowJoin ? 'active' : ''}`}
              onClick={handleClickJoin}
            />
          </Tooltip>
        ) : (
          <Tooltip title={label.fullPath} placement="top">
            <EyeOutlined className="eye" onClick={handleClickEye} />
          </Tooltip>
        )}

        {isChildAvailable && (
          <span onClick={handleClick} style={{ cursor: 'pointer', marginLeft: 8 }}>
            {isShowGroupClass ? <CaretDownOutlined /> : <CaretRightOutlined />}
          </span>
        )}

        {canBeSelected && !onlyView ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
            }}
            style={{ position: 'relative', zIndex: 10 }}
          >
            <Checkbox
              disabled={isDisabled}
              checked={!!getChecked}
              value={fullPath}
              className={!isChildAvailable ? 'no-child' : ''}
              style={{ marginLeft: 8 }}
              data-col-type={reportInfoRow.type}
              data-clazz-type={getElement.clazzType || reportInfoRow.type}
              data-column-path={getElement.columnPath}
            >
              {reportInfoRow.columnName}
              {isJoinAvailable && (
                <span className="entity-class-name">
                  {' '}({HelperEntities.getShortNameOfEntity(joinItem!.targetEntityClass)})
                </span>
              )}
              {isMap && (
                <Tooltip title="To select multiple keys for map fields, please use Aliases">
                  <InfoCircleOutlined style={{ marginLeft: 4 }} />
                </Tooltip>
              )}
            </Checkbox>
          </span>
        ) : (
          <span className="name" style={{ marginLeft: 8 }}>
            {isChildAvailable ? (
              <>
                <a onClick={handleClick}>{reportInfoRow.columnName}</a>
                {isJoinAvailable && (
                  <span className="entity-class-name">
                    {' '}({HelperEntities.getShortNameOfEntity(joinItem!.targetEntityClass)})
                  </span>
                )}
              </>
            ) : (
              <>
                {isJoinAvailable && onlyView ? (
                  <>
                    <a onClick={handleClickJoin}>{reportInfoRow.columnName}</a>
                    <span className="entity-class-name">
                      {' '}({HelperEntities.getShortNameOfEntity(joinItem!.targetEntityClass)})
                    </span>
                  </>
                ) : (
                  <>
                    {reportInfoRow.columnName}
                    {isJoinAvailable && (
                      <span className="entity-class-name">
                        {' '}({HelperEntities.getShortNameOfEntity(joinItem!.targetEntityClass)})
                      </span>
                    )}
                  </>
                )}
              </>
            )}
          </span>
        )}

        {/* Form for LIST/MAP types */}
        {isAvailableForm && getTypes.length > 0 && !onlyView && (
          <div className="wrap-form">
            <ModellingItemClassForm
              types={getTypes}
              values={formValues}
              isAvailableSubmit={false}
              onChange={handleFormChange}
            />
          </div>
        )}
      </div>

      {/* Child class groups */}
      {isChildAvailable && isShowGroupClass && (
        <ModellingGroupClass
          requestParams={allRequestParams}
          type={reportInfoRow.type}
          requestClass={requestClass}
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

      {/* Join group */}
      {isJoinAvailable && isShowJoin && (
        <ModellingGroup
          className="inner-group"
          reportInfoRows={reportingInfoRows}
          relatedPaths={relatedPathsInner}
          requestClass={joinItem!.targetEntityClass}
          checked={checked}
          limit={limit}
          search={search}
          isCondenseThePaths={isCondenseThePaths}
          isOpenAllSelected={isOpenAllSelected}
          onlyRange={onlyRange}
          onlyView={onlyView}
          disablePreview={disablePreview}
          parentColDef={joinItem && label}
        />
      )}
    </div>
  );
};

