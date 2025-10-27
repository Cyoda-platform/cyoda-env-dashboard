/**
 * ModellingPopUp Component
 * Modal dialog for selecting columns from entity model
 * Migrated from: CyodaModellingPopUp.vue
 */

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Modal, Button, Alert, Checkbox } from 'antd';
import { ModellingPopUpToggles } from './ModellingPopUpToggles';
import { ModellingPopUpSearch } from './ModellingPopUpSearch';
import { ModellingGroup } from './ModellingGroup';
import type { ColDef, ReportingInfoRow, RelatedPath } from '../../types/modelling';
import { getReportingInfo, getReportingRelatedPaths } from '../../api/modelling';
import HelperModelling from '../../utils/HelperModelling';
import './ModellingPopUp.scss';

interface ModellingPopUpProps {
  requestClass: string;
  checked?: ColDef[];
  onlyRange?: boolean;
  limit?: number | null;
  disablePreview?: boolean;
  onChange?: (selected: ColDef[]) => void;
}

export interface ModellingPopUpRef {
  open: () => void;
  close: () => void;
}

export const ModellingPopUp = forwardRef<ModellingPopUpRef, ModellingPopUpProps>(
  ({ requestClass, checked = [], onlyRange = false, limit = null, disablePreview = false, onChange }, ref) => {
    const [visible, setVisible] = useState(false);
    const [reportingInfoRows, setReportingInfoRows] = useState<ReportingInfoRow[]>([]);
    const [relatedPaths, setRelatedPaths] = useState<RelatedPath[]>([]);
    const [selected, setSelected] = useState<ColDef[]>([]);
    const [isVisibleGroup, setIsVisibleGroup] = useState(false);
    const [isOpenAllSelected, setIsOpenAllSelected] = useState(false);
    const [isCondenseThePaths, setIsCondenseThePaths] = useState(false);
    const [search, setSearch] = useState('');

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    // Load data when requestClass changes
    useEffect(() => {
      if (requestClass) {
        const loadData = async () => {
          try {
            const { data } = await getReportingInfo(requestClass, '', '', onlyRange);
            setReportingInfoRows(HelperModelling.sortData(HelperModelling.filterData(data)));
            const { data: relatedData } = await getReportingRelatedPaths(requestClass);
            setRelatedPaths(relatedData);
          } catch (error) {
            console.error('Failed to load reporting info:', error);
          }
        };
        loadData();
      }
    }, [requestClass, onlyRange]);

    // Update selected when checked prop changes
    useEffect(() => {
      setSelected(checked);
    }, [checked]);

    // Reset group visibility when dialog opens/closes
    useEffect(() => {
      if (visible) {
        setIsVisibleGroup(false);
        setTimeout(() => setIsVisibleGroup(true), 0);
      }
    }, [visible]);

    const handleAdd = () => {
      setVisible(false);
      onChange?.(JSON.parse(JSON.stringify(selected)));
      setSelected([]);
    };

    const handleCancel = () => {
      setVisible(false);
    };

    const handleTogglesChange = ({
      isOpenAllSelected: openAll,
      isCondenseThePaths: condense,
    }: {
      isOpenAllSelected: boolean;
      isCondenseThePaths: boolean;
    }) => {
      setIsOpenAllSelected(openAll);
      setIsCondenseThePaths(condense);
    };

    const handleSearchChange = ({ input }: { input: string }) => {
      setSearch(input);
    };

    return (
      <Modal
        title={
          <div className="modelling-popup-header">
            <h2>Columns</h2>
            <div className="actions-settings">
              <ModellingPopUpToggles onChange={handleTogglesChange} />
              <ModellingPopUpSearch onChange={handleSearchChange} />
            </div>
          </div>
        }
        open={visible}
        onCancel={handleCancel}
        width="90%"
        className="modelling-popup"
        footer={
          reportingInfoRows.length > 0 ? (
            <>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" onClick={handleAdd}>
                Add
              </Button>
            </>
          ) : (
            <Button onClick={handleCancel}>Close</Button>
          )
        }
        maskClosable={false}
      >
        {limit !== null && limit >= 0 && (
          <div className="limit-desc">You can select only {limit} option</div>
        )}

        {reportingInfoRows.length > 0 ? (
          <Checkbox.Group
            value={selected.map(col => col.fullPath)}
            onChange={(checkedPaths) => {
              // Convert fullPaths back to ColDef objects
              const newColumns: ColDef[] = (checkedPaths as string[]).map(fullPath => {
                // Try to find existing column to preserve all properties
                const existing = selected.find(col => col.fullPath === fullPath);
                if (existing) {
                  return existing;
                }

                // For new selections, try to find the colType from the checkbox element
                const checkbox = document.querySelector(`input[type="checkbox"][value="${fullPath}"]`);
                const colType = checkbox?.getAttribute('data-col-type') || 'LEAF';

                return {
                  '@bean': 'com.cyoda.core.reporting.model.ColDef',
                  fullPath,
                  alias: fullPath,
                  colType,
                } as ColDef;
              });
              setSelected(newColumns);
            }}
          >
            {isVisibleGroup && (
              <ModellingGroup
                reportInfoRows={reportingInfoRows}
                relatedPaths={relatedPaths}
                requestClass={requestClass}
                checked={selected}
                limit={limit}
                onlyRange={onlyRange}
                isOpenAllSelected={isOpenAllSelected}
                isCondenseThePaths={isCondenseThePaths}
                search={search}
                disablePreview={disablePreview}
              />
            )}
          </Checkbox.Group>
        ) : (
          <Alert message="No data" type="error" showIcon />
        )}
      </Modal>
    );
  }
);

ModellingPopUp.displayName = 'ModellingPopUp';

