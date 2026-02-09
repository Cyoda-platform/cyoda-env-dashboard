import React, { useState, useEffect } from 'react'
import { Table, Tag, Modal, Button, Space, Spin, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { RightOutlined, SearchOutlined, BranchesOutlined, ThunderboltOutlined, DiffOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { axiosProcessing, getCyodaCloudEntity, HelperFeatureFlags, isTreeNodeEntity } from '@cyoda/http-api-react'
import type { AuditEventType } from '@cyoda/http-api-react'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import { AuditEventViewer } from '../AuditEventViewers'
import './TransitionChangesTable.scss'

export interface ChangedFieldValue {
  columnPath: string
  prevValue: string
  currValue: string
}

export interface TransitionChange {
  transactionId: string
  timeUUID: string
  creationDate: string
  user: string
  operation: string
  changedFieldValues: ChangedFieldValue[]
}

export interface TransitionChangesTableProps {
  /** Entity type */
  type?: string
  /** Entity ID */
  entityId?: string
  /** Whether to disable transaction links */
  disableLink?: boolean
  /** Function to fetch transaction changes */
  onFetchChanges?: (params: { type: string; id: string }) => Promise<TransitionChange[]>
  /** Base path for transaction links */
  basePath?: string
  /** Node name for transaction links */
  nodeName?: string
}

/**
 * TransitionChangesTable Component
 * Displays entity transition changes with expandable rows showing field changes
 *
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/PmTransitionChanges/TransitionChangesTable.vue
 */
export const TransitionChangesTable: React.FC<TransitionChangesTableProps> = ({
  type = '',
  entityId = '',
  disableLink = false,
  onFetchChanges,
  basePath = '/processing-ui/nodes',
  nodeName
}) => {
  const [tableData, setTableData] = useState<TransitionChange[]>([])
  const [loading, setLoading] = useState(false)

  // Cyoda Cloud mode state for viewing entity at transaction
  const isCyodaCloud = HelperFeatureFlags.isCyodaCloud()
  const showAuditFeatures = isCyodaCloud && isTreeNodeEntity(type)
  const [jsonModalVisible, setJsonModalVisible] = useState(false)
  const [jsonModalData, setJsonModalData] = useState<Record<string, unknown> | null>(null)
  const [jsonModalLoading, setJsonModalLoading] = useState(false)
  const [jsonModalTransactionId, setJsonModalTransactionId] = useState<string>('')

  // Audit event viewer state
  const [auditViewerVisible, setAuditViewerVisible] = useState(false)
  const [auditViewerEventType, setAuditViewerEventType] = useState<AuditEventType>('StateMachine')
  const [auditViewerTransactionId, setAuditViewerTransactionId] = useState<string>('')

  // Handler for opening audit event viewer
  const handleOpenAuditViewer = (transactionId: string, eventType: AuditEventType) => {
    setAuditViewerTransactionId(transactionId)
    setAuditViewerEventType(eventType)
    setAuditViewerVisible(true)
  }

  useEffect(() => {
    loadData()
  }, [type, entityId])

  const loadData = async () => {
    if (!type || !entityId) return

    try {
      setLoading(true)

      // Use custom fetch function if provided, otherwise use default API
      if (onFetchChanges) {
        const data = await onFetchChanges({ type, id: entityId })
        setTableData(data)
      } else {
        const { data } = await axiosProcessing.get<TransitionChange[]>(
          '/platform-processing/transactions/view/entity-changes',
          { params: { type, id: entityId } }
        )
        setTableData(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const getChangedFieldValuesByKey = (
    record: TransitionChange,
    columnPath: string,
    field: 'prevValue' | 'currValue'
  ): string => {
    const row = record.changedFieldValues.find(elem => elem.columnPath === columnPath)
    return row ? row[field] : '-'
  }

  // Render value (similar to EntityAudit)
  const renderValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return <Tag color="default">null</Tag>
    }
    if (typeof value === 'object') {
      return <pre style={{ margin: 0, fontSize: '12px' }}>{JSON.stringify(value, null, 2)}</pre>
    }
    return String(value)
  }

  // Render operation tag
  const renderOperation = (operation: string) => {
    const colorMap: Record<string, string> = {
      CREATE: 'green',
      UPDATE: 'blue',
      DELETE: 'red',
    }
    return <Tag color={colorMap[operation] || 'default'}>{operation}</Tag>
  }

  // Handle viewing entity at a specific transaction (Cyoda Cloud mode)
  const handleViewEntityAtTransaction = async (transactionId: string) => {
    if (!entityId) return

    setJsonModalTransactionId(transactionId)
    setJsonModalVisible(true)
    setJsonModalLoading(true)
    setJsonModalData(null)

    try {
      const { data } = await getCyodaCloudEntity(entityId, transactionId)
      setJsonModalData(data)
    } catch (error) {
      console.error('Failed to load entity at transaction:', error)
      setJsonModalData(null)
    } finally {
      setJsonModalLoading(false)
    }
  }

  const expandedRowRender = (record: TransitionChange) => {
    const columns: ColumnsType<ChangedFieldValue> = [
      {
        title: 'PATH',
        dataIndex: 'columnPath',
        key: 'columnPath',
        width: 200,
        render: (text) => text || '-'
      },
      {
        title: 'OLD VALUE',
        dataIndex: 'prevValue',
        key: 'prevValue',
        render: renderValue
      },
      {
        title: 'NEW VALUE',
        dataIndex: 'currValue',
        key: 'currValue',
        render: renderValue
      }
    ]

    return (
      <Table
        columns={columns}
        dataSource={record.changedFieldValues}
        pagination={false}
        rowKey={(row) => row.columnPath}
        size="small"
        bordered
      />
    )
  }

  const columns: ColumnsType<TransitionChange> = [
    {
      title: 'TRANSACTION ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 320,
      render: (text, record) => {
        if (disableLink) {
          return text
        }
        const linkPath = nodeName
          ? `${basePath}/${nodeName}/transaction/${record.transactionId}`
          : `${basePath}/${type}/transaction/${record.transactionId}`;
        return (
          <Link to={linkPath} className="transition-link">
            {text}
          </Link>
        )
      }
    },
    {
      title: 'TIME (UUID/DATE)',
      key: 'timeUid',
      width: 300,
      render: (_, record) => (
        <span>
          {record.timeUUID} / {record.creationDate}
        </span>
      )
    },
    {
      title: 'STATE FROM',
      key: 'stateFrom',
      width: 150,
      render: (_, record) => renderValue(getChangedFieldValuesByKey(record, 'state', 'prevValue'))
    },
    {
      title: 'STATE TO',
      key: 'stateTo',
      width: 150,
      render: (_, record) => renderValue(getChangedFieldValuesByKey(record, 'state', 'currValue'))
    },
    {
      title: 'USER',
      dataIndex: 'user',
      key: 'user',
      width: 120
    },
    {
      title: 'CHANGE TYPE',
      dataIndex: 'operation',
      key: 'operation',
      width: 120,
      render: (operation: string) => renderOperation(operation)
    },
    // Details column - only shown when Cyoda Cloud is enabled
    ...(isCyodaCloud && entityId ? [{
      title: 'DETAILS',
      key: 'details',
      width: showAuditFeatures ? 180 : 60,
      render: (_: unknown, record: TransitionChange) => (
        <Space size="small">
          <Tooltip title="View entity at this transaction">
            <Button
              type="text"
              size="small"
              icon={<SearchOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                handleViewEntityAtTransaction(record.transactionId)
              }}
            />
          </Tooltip>
          {showAuditFeatures && (
            <>
              <Tooltip title="State Machine Audit">
                <Button
                  type="text"
                  size="small"
                  icon={<BranchesOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenAuditViewer(record.transactionId, 'StateMachine')
                  }}
                />
              </Tooltip>
              <Tooltip title="Entity Change Audit">
                <Button
                  type="text"
                  size="small"
                  icon={<DiffOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenAuditViewer(record.transactionId, 'EntityChange')
                  }}
                />
              </Tooltip>
              <Tooltip title="System Events">
                <Button
                  type="text"
                  size="small"
                  icon={<ThunderboltOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenAuditViewer(record.transactionId, 'System')
                  }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }] : [])
  ]

  return (
    <div className="transition-changes-table card">
      <div className="card-body">
        <Table
          columns={columns}
          dataSource={tableData}
          loading={loading}
          rowKey={(record) => record.transactionId}
          scroll={{ x: true, y: 400 }}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.changedFieldValues && record.changedFieldValues.length > 0,
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
      </div>

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
      {showAuditFeatures && entityId && (
        <AuditEventViewer
          visible={auditViewerVisible}
          onClose={() => setAuditViewerVisible(false)}
          entityId={entityId}
          transactionId={auditViewerTransactionId}
          eventType={auditViewerEventType}
        />
      )}
    </div>
  )
}

