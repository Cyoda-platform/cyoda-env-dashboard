/**
 * EntityAudit Component
 * Shows entity change history with expandable details
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/PmTransitionChanges/TransitionChangesTable.vue
 */

import React, { useState, useEffect } from 'react';
import { Table, Tag, Spin, Modal, Button, Space, Tooltip } from 'antd';
import { RightOutlined, SearchOutlined, BranchesOutlined, ThunderboltOutlined, DiffOutlined } from '@ant-design/icons';
import { axios, getCyodaCloudEntity, HelperFeatureFlags } from '@cyoda/http-api-react';
import type { AuditEventType } from '@cyoda/http-api-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import { AuditEventViewer } from '@cyoda/ui-lib-react';
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

  // Cyoda Cloud mode state for viewing entity at transaction
  const isCyodaCloud = HelperFeatureFlags.isCyodaCloud();
  const [jsonModalVisible, setJsonModalVisible] = useState(false);
  const [jsonModalData, setJsonModalData] = useState<Record<string, unknown> | null>(null);
  const [jsonModalLoading, setJsonModalLoading] = useState(false);
  const [jsonModalTransactionId, setJsonModalTransactionId] = useState<string>('');

  // Audit event viewer state
  const [auditViewerVisible, setAuditViewerVisible] = useState(false);
  const [auditViewerEventType, setAuditViewerEventType] = useState<AuditEventType>('StateMachine');
  const [auditViewerTransactionId, setAuditViewerTransactionId] = useState<string>('');

  // Handler for opening audit event viewer
  const handleOpenAuditViewer = (transactionId: string, eventType: AuditEventType) => {
    setAuditViewerTransactionId(transactionId);
    setAuditViewerEventType(eventType);
    setAuditViewerVisible(true);
  };

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

  // Handle viewing entity at a specific transaction (Cyoda Cloud mode)
  const handleViewEntityAtTransaction = async (transactionId: string) => {
    setJsonModalTransactionId(transactionId);
    setJsonModalVisible(true);
    setJsonModalLoading(true);
    setJsonModalData(null);

    try {
      const { data } = await getCyodaCloudEntity(entityId, transactionId);
      setJsonModalData(data);
    } catch (error) {
      console.error('Failed to load entity at transaction:', error);
      setJsonModalData(null);
    } finally {
      setJsonModalLoading(false);
    }
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
      render: (operation: string) => renderOperation(operation),
    },
    // Details column - only shown when Cyoda Cloud is enabled
    ...(isCyodaCloud ? [{
      title: 'Details',
      key: 'details',
      width: 180,
      render: (_: unknown, record: EntityChange) => (
        <Space size="small">
          <Tooltip title="View entity at this transaction">
            <Button
              type="text"
              size="small"
              icon={<SearchOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleViewEntityAtTransaction(record.transactionId);
              }}
            />
          </Tooltip>
          <Tooltip title="State Machine Audit">
            <Button
              type="text"
              size="small"
              icon={<BranchesOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAuditViewer(record.transactionId, 'StateMachine');
              }}
            />
          </Tooltip>
          <Tooltip title="Entity Change Audit">
            <Button
              type="text"
              size="small"
              icon={<DiffOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAuditViewer(record.transactionId, 'EntityChange');
              }}
            />
          </Tooltip>
          <Tooltip title="System Events">
            <Button
              type="text"
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAuditViewer(record.transactionId, 'System');
              }}
            />
          </Tooltip>
        </Space>
      ),
    }] : []),
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
            expandIcon: ({ expanded, onExpand, record }) => (
              <RightOutlined
                onClick={(e) => onExpand(record, e)}
                rotate={expanded ? 90 : 0}
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  fontSize: '12px',
                }}
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

      {/* Modal for viewing entity JSON at transaction (Cyoda Cloud mode) */}
      {isCyodaCloud && (
        <Modal
          title={`Entity at Transaction: ${jsonModalTransactionId}`}
          open={jsonModalVisible}
          onCancel={() => setJsonModalVisible(false)}
          footer={null}
          width="80%"
          style={{ top: 20 }}
        >
          {jsonModalLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : jsonModalData ? (
            <pre
              className="language-javascript"
              style={{ maxHeight: '70vh', overflow: 'auto', margin: 0, padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}
            >
              <code
                className="language-javascript"
                dangerouslySetInnerHTML={{
                  __html: Prism.highlight(
                    JSON.stringify(jsonModalData, null, 2),
                    Prism.languages.javascript,
                    'javascript'
                  )
                }}
              />
            </pre>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              No data available
            </div>
          )}
        </Modal>
      )}

      {/* Audit Event Viewer Modal */}
      {isCyodaCloud && (
        <AuditEventViewer
          visible={auditViewerVisible}
          onClose={() => setAuditViewerVisible(false)}
          entityId={entityId}
          transactionId={auditViewerTransactionId}
          eventType={auditViewerEventType}
        />
      )}
    </div>
  );
};

export default EntityAudit;

