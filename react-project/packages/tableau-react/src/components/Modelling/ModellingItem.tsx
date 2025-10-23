/**
 * ModellingItem Component
 * Individual column item with checkbox, preview, and child navigation
 * Migrated from: CyodaModellingItem.vue
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Checkbox, Tooltip } from 'antd';
import { EyeOutlined, CaretDownOutlined, CaretRightOutlined, LinkOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ModellingGroupClass } from './ModellingGroupClass';
import { ModellingGroup } from './ModellingGroup';
import { UniqueValuesModal } from '../UniqueValuesModal/UniqueValuesModal';
import type { ReportingInfoRow, RelatedPath, ColDef, RequestParam } from '../../types/modelling';
import HelperModelling from '../../utils/HelperModelling';
import { HelperEntities } from '@cyoda/http-api-react/utils';
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
  const [values, setValues] = useState<any>({});
  const [uniqueValuesVisible, setUniqueValuesVisible] = useState(false);

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
    return relatedPaths.find((el) => el.path.replace('.[*]', '') === reportInfoRow.columnName);
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

  const label = useMemo(() => {
    return {
      fullPath,
      colType: reportInfoRow.type,
    };
  }, [fullPath, reportInfoRow.type]);

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
    return HelperModelling.allRequestParams(reportInfoRow, requestClass);
  }, [reportInfoRow, requestClass]);

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
  useEffect(() => {
    if (isOpenAllSelected && getChecked) {
      setIsShowGroupClass(true);
    }
    if (!isOpenAllSelected && getChecked) {
      setIsShowGroupClass(false);
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

    setUniqueValuesVisible(true);
  };

  const handleCloseUniqueValues = () => {
    setUniqueValuesVisible(false);
  };



  if (!isSearchCondition) {
    return null;
  }

  return (
    <div className={`modelling-item ${getChecked ? 'checked-path' : ''} ${joinItem ? 'has-join' : ''}`}>
      <div className={`inner ${joinItem ? 'inner-related' : ''}`}>
        <Tooltip title={label.fullPath} placement="top">
          <EyeOutlined className="eye" onClick={handleClickEye} />
        </Tooltip>

        {isChildAvailable && (
          <span onClick={handleClick} style={{ cursor: 'pointer', marginLeft: 8 }}>
            {isShowGroupClass ? <CaretDownOutlined /> : <CaretRightOutlined />}
          </span>
        )}

        {isJoinAvailable && (
          <LinkOutlined
            className={`join-link ${isShowJoin ? 'active' : ''}`}
            onClick={handleClickJoin}
            style={{ marginLeft: 8, cursor: 'pointer' }}
          />
        )}

        {canBeSelected && !onlyView ? (
          <Checkbox
            disabled={isDisabled}
            checked={!!getChecked}
            value={label}
            className={!isChildAvailable ? 'no-child' : ''}
            style={{ marginLeft: 8 }}
          >
            {reportInfoRow.columnName}
            {isMap && (
              <Tooltip title="To select multiple keys for map fields, please use Aliases">
                <InfoCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            )}
            {isJoinAvailable && (
              <span className="entity-class-name">
                {' '}({HelperEntities.getShortNameOfEntity(joinItem!.targetEntityClass)})
              </span>
            )}
          </Checkbox>
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
                  <a onClick={handleClickJoin}>
                    {reportInfoRow.columnName}{' '}
                    ({HelperEntities.getShortNameOfEntity(joinItem!.targetEntityClass)})
                  </a>
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

        {/* Form for LIST/MAP types - simplified for now */}
        {isAvailableForm && getTypes.length > 0 && !onlyView && (
          <div className="wrap-form" style={{ marginLeft: 16 }}>
            {/* Form component can be added here */}
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
        <div className="inner-group">
          <ModellingGroup
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
        </div>
      )}

      {/* Unique Values Modal */}
      <UniqueValuesModal
        visible={uniqueValuesVisible}
        fieldName={reportInfoRow.columnName}
        fieldPath={fullPath}
        entityClass={requestClass}
        onClose={handleCloseUniqueValues}
      />
    </div>
  );
};

