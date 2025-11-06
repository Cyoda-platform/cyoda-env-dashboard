import React, { useMemo } from 'react'
import { Drawer, Button, Space } from 'antd'
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons'
import moment from 'moment'
import _ from 'lodash'
import { DataTable } from '../DataTable'
import { ErrorData } from '../../contexts/ErrorHandlerContext'
import './ErrorTable.scss'

export interface ErrorTableProps {
  /** Array of errors to display */
  errors: ErrorData[]
  /** Whether the drawer is visible */
  visible: boolean
  /** Callback when drawer is closed */
  onClose: () => void
  /** Callback when detail view is requested */
  onDetailView?: (error: ErrorData) => void
  /** Callback when export is requested for a single error */
  onExport?: (error: ErrorData) => void
  /** Callback when export all is requested */
  onExportAll?: () => void
  /** Callback when clear all errors is requested */
  onClearErrors?: () => void
}

interface GroupedError {
  message: string
  events: number
  lastEvent: number
  error: ErrorData
  pageUrl?: string
}

/**
 * ErrorTable Component
 * Displays a table of errors in a drawer
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/ErrorHandler/ErrorHandlerTable.vue
 */
export const ErrorTable: React.FC<ErrorTableProps> = ({
  errors,
  visible,
  onClose,
  onDetailView,
  onExport,
  onExportAll,
  onClearErrors
}) => {
  const tableData = useMemo<GroupedError[]>(() => {
    if (errors.length === 0) return []

    const groupedData = _.groupBy(errors, (el) => el.message)
    
    return Object.keys(groupedData)
      .map((message) => {
        const errorGroup = groupedData[message]
        const lastEvent = _.maxBy(errorGroup, (el) => parseInt(el.createdAt, 10))!
        
        return {
          message,
          events: errorGroup.length,
          lastEvent: parseInt(lastEvent.createdAt, 10),
          error: lastEvent,
          pageUrl: lastEvent.pageUrl
        }
      })
      .reverse()
  }, [errors])

  const columns = [
    {
      title: 'Name',
      dataIndex: 'message',
      key: 'message',
      sorter: (a: GroupedError, b: GroupedError) => a.message.localeCompare(b.message)
    },
    {
      title: 'Page Url',
      dataIndex: 'pageUrl',
      key: 'pageUrl',
      sorter: (a: GroupedError, b: GroupedError) => 
        (a.pageUrl || '').localeCompare(b.pageUrl || '')
    },
    {
      title: 'Events',
      dataIndex: 'events',
      key: 'events',
      sorter: (a: GroupedError, b: GroupedError) => a.events - b.events
    },
    {
      title: 'Last Event',
      dataIndex: 'lastEvent',
      key: 'lastEvent',
      sorter: (a: GroupedError, b: GroupedError) => a.lastEvent - b.lastEvent,
      render: (timestamp: number) => moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_: any, record: GroupedError) => (
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => onDetailView?.(record.error)}
          />
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={() => onExport?.(record.error)}
          />
        </Space>
      )
    }
  ]

  return (
    <Drawer
      title="Error Handler"
      placement="bottom"
      height="50%"
      open={visible}
      onClose={onClose}
      className="error-table-drawer"
    >
      <div className="error-table-actions">
        <Space>
          <Button onClick={onClearErrors}>
            Remove ALL errors and notifications
          </Button>
          <Button type="primary" onClick={onExportAll}>
            Export ALL errors
          </Button>
        </Space>
      </div>
      <DataTable
        data={tableData}
        columns={columns}
        pageSize={10}
        bordered
        tableProps={{
          scroll: { y: 220 }
        }}
      />
    </Drawer>
  )
}

