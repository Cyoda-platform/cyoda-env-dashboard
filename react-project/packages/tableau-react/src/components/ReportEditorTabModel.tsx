/**
 * ReportEditorTabModel Component
 * Tab for selecting entity class and configuring column definitions
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/ConfigEditorReportsTabModelling.vue
 * 
 * Note: This is a simplified version. Full CyodaModelling components migration is complex
 * and would require migrating multiple sub-components.
 */

import React, { useMemo } from 'react';
import { Table, Button, Modal, message, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ReportDefinition } from '../types';
import './ReportEditorTabModel.scss';

interface ReportEditorTabModelProps {
  configDefinition: ReportDefinition;
  onChange: (config: Partial<ReportDefinition>) => void;
}

const ReportEditorTabModel: React.FC<ReportEditorTabModelProps> = ({
  configDefinition,
  onChange,
}) => {
  // Format column definitions for display
  const tableData = useMemo(() => {
    if (!configDefinition.colDefs) return [];
    
    return configDefinition.colDefs.map((colDef: any, index: number) => ({
      key: index,
      fullPath: colDef.fullPath || '',
      alias: colDef.alias || '',
      type: colDef.type || '',
    }));
  }, [configDefinition.colDefs]);

  const handleRemove = (index: number) => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Do you really want to remove this column definition?',
      onOk: () => {
        const newColDefs = [...(configDefinition.colDefs || [])];
        newColDefs.splice(index, 1);
        onChange({ colDefs: newColDefs });
        message.success('Column definition removed');
      },
    });
  };

  const handleAddNew = () => {
    message.info('Column definition editor not yet implemented. Please use JSON tab to add columns manually.');
  };

  const columns = [
    {
      title: 'Path',
      dataIndex: 'fullPath',
      key: 'fullPath',
      ellipsis: true,
    },
    {
      title: 'Alias',
      dataIndex: 'alias',
      key: 'alias',
      width: 200,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 150,
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemove(record.key)}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="report-editor-tab-model">
      <Alert
        message="Simplified Model Editor"
        description="This is a simplified version of the model editor. For advanced column definition editing, please use the JSON tab. Full CyodaModelling component migration is planned for a future update."
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
      />

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddNew}
        disabled={!configDefinition.requestClass}
        style={{ marginBottom: 16 }}
      >
        Add New Column Definition
      </Button>

      <h2>Selected Columns:</h2>
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        size="small"
        bordered
      />

      {!configDefinition.requestClass && (
        <Alert
          message="No Entity Class Selected"
          description="Please select an entity class (requestClass) in the JSON tab before adding column definitions."
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default ReportEditorTabModel;

