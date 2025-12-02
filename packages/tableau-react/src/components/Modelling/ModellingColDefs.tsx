/**
 * ModellingColDefs Component
 * Column definitions management with table and selection
 * Migrated from: CyodaModellingColDefs.vue
 */

import React, { useRef, useState, useMemo } from 'react';
import { Button, Table, Modal, App } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { HelperFormat } from '@cyoda/ui-lib-react';
import { ModellingPopUp, ModellingPopUpRef } from './ModellingPopUp';
import type { ColDef } from '../../types/modelling';
import './ModellingColDefs.scss';

interface ModellingColDefsProps {
  configDefinition: any;
  onChange?: (updates: any) => void;
  readOnly?: boolean;
}

export const ModellingColDefs: React.FC<ModellingColDefsProps> = ({ configDefinition, onChange, readOnly = false }) => {
  const { message } = App.useApp();
  const popupRef = useRef<ModellingPopUpRef>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const tableData = useMemo(() => {
    return (
      configDefinition.colDefs?.map((el: ColDef, index: number) => ({
        key: index,
        fullPath: el.fullPath, // Keep original fullPath in data
        fullPathDisplay: HelperFormat.shortNamePath(el.fullPath), // Formatted for display
        colDef: el,
      })) || []
    );
  }, [configDefinition.colDefs]);

  const checked = useMemo(() => {
    return JSON.parse(JSON.stringify(configDefinition.colDefs || []));
  }, [configDefinition.colDefs]);

  const handleOpenDialog = () => {
    popupRef.current?.open();
  };

  const handleRemove = (index: number) => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Do you really want to remove?',
      onOk: () => {
        if (configDefinition.colDefs) {
          const newColDefs = configDefinition.colDefs.filter((_: any, i: number) => i !== index);
          if (onChange) {
            onChange({ colDefs: newColDefs });
          } else {
            configDefinition.colDefs = newColDefs;
          }
          message.success('Column removed successfully');
        }
      },
    });
  };

  const handleChange = (checkedData: ColDef[]) => {
    const newColDefs = JSON.parse(JSON.stringify(checkedData));
    if (onChange) {
      onChange({ colDefs: newColDefs });
    } else {
      configDefinition.colDefs = newColDefs;
    }
    message.success('Columns updated successfully');
  };

  const handleSelectionChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select columns to delete');
      return;
    }

    Modal.confirm({
      title: 'Confirm',
      content: `Do you really want to remove ${selectedRowKeys.length} records?`,
      onOk: () => {
        if (configDefinition.colDefs) {
          // Remove selected items
          const indicesToRemove = selectedRowKeys.map((key) => Number(key));
          const newColDefs = configDefinition.colDefs.filter(
            (_: any, index: number) => !indicesToRemove.includes(index)
          );
          if (onChange) {
            onChange({ colDefs: newColDefs });
          } else {
            configDefinition.colDefs = newColDefs;
          }
          setSelectedRowKeys([]);
          message.success(`${selectedRowKeys.length} columns removed successfully`);
        }
      },
    });
  };

  const columns = [
    {
      title: 'PATH',
      dataIndex: 'fullPathDisplay',
      key: 'fullPathDisplay',
      render: (text: string, record: any) => {
        // Render the formatted display path
        return <span style={{ color: 'var(--refine-text-primary, #e5e7eb)' }}>{text || record.fullPathDisplay || 'N/A'}</span>;
      },
    },
    {
      title: 'ACTION',
      key: 'action',
      width: 180,
      render: (_: any, record: any) => (
        <Button danger disabled={readOnly} onClick={() => handleRemove(record.key)}>
          Remove
        </Button>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectionChange,
  };

  return (
    <div className="modelling-col-defs">
      <Button
        type="primary"
        disabled={!configDefinition.requestClass || readOnly}
        onClick={handleOpenDialog}
        icon={<PlusOutlined />}
      >
        Add New Column Definition
      </Button>

      <h2>Selected Columns:</h2>
      <Table
        rowSelection={readOnly ? undefined : rowSelection}
        bordered
          columns={columns}
        dataSource={tableData}
        pagination={false}
      />

      {selectedRowKeys.length > 0 && (
        <div className="form-multiple-selection">
          <Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
            Delete Selected ({selectedRowKeys.length})
          </Button>
        </div>
      )}

      <ModellingPopUp
        ref={popupRef}
        requestClass={configDefinition.requestClass}
        checked={checked}
        onChange={handleChange}
      />
    </div>
  );
};

