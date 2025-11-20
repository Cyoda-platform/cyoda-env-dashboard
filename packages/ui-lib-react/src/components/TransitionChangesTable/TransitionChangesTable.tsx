import React, { useState, useEffect } from 'react'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router-dom'
import { axiosProcessing } from '@cyoda/http-api-react'
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

  const expandedRowRender = (record: TransitionChange) => {
    const columns: ColumnsType<ChangedFieldValue> = [
      {
        title: 'Path',
        dataIndex: 'columnPath',
        key: 'columnPath',
        render: (text) => text || '-'
      },
      {
        title: 'Old value',
        dataIndex: 'prevValue',
        key: 'prevValue'
      },
      {
        title: 'New value',
        dataIndex: 'currValue',
        key: 'currValue'
      }
    ]

    return (
      <Table
        columns={columns}
        dataSource={record.changedFieldValues}
        pagination={false}
        rowKey={(row) => row.columnPath}
      />
    )
  }

  const columns: ColumnsType<TransitionChange> = [
    {
      title: 'Transaction Id',
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
          <Link to={linkPath}>
            {text}
          </Link>
        )
      }
    },
    {
      title: 'Time(uuid/date)',
      key: 'timeUid',
      render: (_, record) => `${record.timeUUID} / ${record.creationDate}`
    },
    {
      title: 'State from',
      key: 'stateFrom',
      render: (_, record) => getChangedFieldValuesByKey(record, 'state', 'prevValue')
    },
    {
      title: 'State to',
      key: 'stateTo',
      render: (_, record) => getChangedFieldValuesByKey(record, 'state', 'currValue')
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user'
    },
    {
      title: 'Change Type',
      dataIndex: 'operation',
      key: 'operation'
    }
  ]

  return (
    <div className="transition-changes-table card">
      <div className="card-body">
        <Table
          columns={columns}
          dataSource={tableData}
          loading={loading}
          scroll={{ x: true, y: 400 }}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.changedFieldValues && record.changedFieldValues.length > 0
          }}
          rowKey={(record) => record.transactionId}
        />
      </div>
    </div>
  )
}

