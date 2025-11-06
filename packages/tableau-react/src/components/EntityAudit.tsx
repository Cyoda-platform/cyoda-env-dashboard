/**
 * EntityAudit Component
 * Shows entity change history with expandable details
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/PmTransitionChanges/TransitionChangesTable.vue
 */

import React, { useState, useEffect } from 'react';
import { Table, Tag, Spin } from 'antd';
import { axios } from '@cyoda/http-api-react';
import './EntityAudit.scss';

interface ChangedFieldValue {
  columnPath: string;
  prevValue: any;
  currValue: any;
}

interface EntityChange {
  transactionId: string;
  timeUUID: string;
  creationDate: string;
  user: string;
  operation: string;
  changedFieldValues: ChangedFieldValue[];
}

interface EntityAuditProps {
  entityClass: string;
  entityId: string;
}

const EntityAudit: React.FC<EntityAuditProps> = ({ entityClass, entityId }) => {
  const [changes, setChanges] = useState<EntityChange[]>([]);
  const [loading, setLoading] = useState(false);

  // Load entity changes
  useEffect(() => {
    const loadChanges = async () => {
      if (!entityClass || !entityId) return;

      setLoading(true);
      try {
        const { data } = await axios.get('/platform-processing/transactions/view/entity-changes', {
          params: { type: entityClass, id: entityId },
        });
        // Ensure data is an array
        const changesArray = Array.isArray(data) ? data : [];
        setChanges(changesArray);
      } catch (error) {
        console.error('Failed to load entity changes:', error);
        setChanges([]);
      } finally {
        setLoading(false);
      }
    };

    loadChanges();
  }, [entityClass, entityId]);

  // Get state value from changed fields
  const getStateValue = (changedFieldValues: ChangedFieldValue[], field: 'prevValue' | 'currValue') => {
    const stateField = changedFieldValues.find((f) => f.columnPath === 'state');
    return stateField ? stateField[field] : '-';
  };

  // Render value
  const renderValue = (value: any) => {
    if (value === null || value === undefined) {
      return <Tag color="default">null</Tag>;
    }
    if (typeof value === 'object') {
      return <pre style={{ margin: 0, fontSize: '12px' }}>{JSON.stringify(value, null, 2)}</pre>;
    }
    return String(value);
  };

  // Render operation tag
  const renderOperation = (operation: string) => {
    const colorMap: Record<string, string> = {
      CREATE: 'green',
      UPDATE: 'blue',
      DELETE: 'red',
    };
    return <Tag color={colorMap[operation] || 'default'}>{operation}</Tag>;
  };

  // Expanded row columns
  const expandedColumns = [
    {
      title: 'Path',
      dataIndex: 'columnPath',
      key: 'columnPath',
      width: 200,
    },
    {
      title: 'Old Value',
      dataIndex: 'prevValue',
      key: 'prevValue',
      render: renderValue,
    },
    {
      title: 'New Value',
      dataIndex: 'currValue',
      key: 'currValue',
      render: renderValue,
    },
  ];

  // Main table columns
  const columns = [
    {
      title: 'Transaction Id',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 320,
    },
    {
      title: 'Time (uuid/date)',
      key: 'time',
      width: 300,
      render: (_: any, record: EntityChange) => (
        <span>
          {record.timeUUID} / {record.creationDate}
        </span>
      ),
    },
    {
      title: 'State From',
      key: 'stateFrom',
      width: 150,
      render: (_: any, record: EntityChange) => renderValue(getStateValue(record.changedFieldValues, 'prevValue')),
    },
    {
      title: 'State To',
      key: 'stateTo',
      width: 150,
      render: (_: any, record: EntityChange) => renderValue(getStateValue(record.changedFieldValues, 'currValue')),
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 120,
    },
    {
      title: 'Change Type',
      dataIndex: 'operation',
      key: 'operation',
      width: 120,
      render: renderOperation,
    },
  ];

  return (
    <div className="entity-audit">
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={changes}
          rowKey="transactionId"
          expandable={{
            expandedRowRender: (record) => (
              <Table
                columns={expandedColumns}
                dataSource={record.changedFieldValues}
                rowKey="columnPath"
                pagination={false}
                size="small"
                bordered
              />
            ),
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} changes`,
          }}
          bordered
          size="small"
        />
      </Spin>
    </div>
  );
};

export default EntityAudit;

