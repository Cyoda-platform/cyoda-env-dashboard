/**
 * ModellingRangeDefs Component
 * Range column definitions for stream reports
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/CyodaModelling/CyodaModellingRangeDefs.vue
 */

import React, { useRef, useMemo } from 'react';
import { Button, Table, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ModellingPopUp, ModellingPopUpRef } from './ModellingPopUp';
import type { ColDef, ReportDefinition } from '../../types';
import './ModellingRangeDefs.scss';

export interface ModellingRangeDefsProps {
  configDefinition: ReportDefinition;
  configDefinitionColRanges: ColDef[];
  onChange: (ranges: ColDef[]) => void;
  readOnly?: boolean;
}

export const ModellingRangeDefs: React.FC<ModellingRangeDefsProps> = ({
  configDefinition,
  configDefinitionColRanges,
  onChange,
  readOnly = false,
}) => {
  const popupRef = useRef<ModellingPopUpRef>(null);

  const tableData = useMemo(() => {
    return configDefinitionColRanges || [];
  }, [configDefinitionColRanges]);

  const checked = useMemo(() => {
    return configDefinitionColRanges || [];
  }, [configDefinitionColRanges]);

  const handleOpenDialog = () => {
    popupRef.current?.open();
  };

  const handleRemove = () => {
    Modal.confirm({
      title: 'Confirm!',
      content: 'Do you really want to remove?',
      onOk: () => {
        onChange([]);
      },
    });
  };

  const handleChangeModellingPopUp = (checkedData: ColDef[]) => {
    onChange(checkedData);
  };

  const columns = [
    {
      title: 'Path',
      dataIndex: 'fullPath',
      key: 'fullPath',
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      render: (_: any, record: ColDef, index: number) => (
        <Button type="primary" danger onClick={handleRemove} disabled={readOnly}>
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="modelling-range-defs">
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleOpenDialog}
        disabled={!configDefinition.requestClass || readOnly}
      >
        Add New Range Column Definition
      </Button>

      <h2>Selected Range Column:</h2>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="fullPath"
        pagination={false}
        size="small"
      />

      <ModellingPopUp
        ref={popupRef}
        requestClass={configDefinition.requestClass || ''}
        checked={checked}
        onChange={handleChangeModellingPopUp}
        onlyRange={true}
        limit={1}
      />
    </div>
  );
};

export default ModellingRangeDefs;

