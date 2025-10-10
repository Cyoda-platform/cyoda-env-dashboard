import React, { forwardRef, useImperativeHandle, useState, useMemo, useCallback } from 'react'
import { Modal, Table, Button, Select, Form, Space } from 'antd'
import type { TableColumnsType } from 'antd'
import './ConfigEditorStreamGrid.scss'

export interface ConfigDefinitionRequest {
  sdDef?: {
    columns?: Array<{ name: string }>
    condition?: any
  }
  offset?: number
  length?: number
  pointTime?: number | null
}

export interface StreamGridData {
  rows?: Array<{
    columnsValues: Record<string, any>
  }>
  pointTime?: number
}

export interface ConfigEditorStreamGridProps {
  title?: string
  hasFilterBuilder?: boolean
  isDeleteAvailable?: boolean
  onLoadData?: (request: ConfigDefinitionRequest) => Promise<StreamGridData>
  onClose?: () => void
  className?: string
}

export interface ConfigEditorStreamGridRef {
  dialogVisible: boolean
  setDialogVisible: (visible: boolean) => void
  configDefinitionRequest: ConfigDefinitionRequest
  onlyUniq: boolean
  loadPage: () => Promise<void>
}

/**
 * ConfigEditorStreamGrid
 * A data grid component for displaying and managing stream data with pagination
 */
export const ConfigEditorStreamGrid = forwardRef<ConfigEditorStreamGridRef, ConfigEditorStreamGridProps>(({
  title = 'Report Stream Result',
  hasFilterBuilder = false,
  isDeleteAvailable = false,
  onLoadData,
  onClose,
  className = ''
}, ref) => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [configDefinitionRequest, setConfigDefinitionRequest] = useState<ConfigDefinitionRequest>({})
  const [onlyUniq, setOnlyUniq] = useState(false)
  const [lastRequest, setLastRequest] = useState<StreamGridData>({})
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const columns: TableColumnsType<any> = useMemo(() => {
    if (lastRequest?.rows && lastRequest.rows.length > 0 && configDefinitionRequest.sdDef?.columns) {
      return configDefinitionRequest.sdDef.columns.map((col) => ({
        title: col.name,
        dataIndex: col.name,
        key: col.name,
        sorter: true,
        width: 200,
        render: (value: any) => {
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') return JSON.stringify(value)
          return String(value)
        }
      }))
    }
    return []
  }, [lastRequest, configDefinitionRequest])

  const tableData = useMemo(() => {
    if (lastRequest?.rows && lastRequest.rows.length > 0) {
      return lastRequest.rows.map((row, index) => ({
        key: index,
        ...row.columnsValues
      }))
    }
    return []
  }, [lastRequest])

  const loadPage = useCallback(async (reset = false) => {
    try {
      setIsLoading(true)
      const request = {
        ...configDefinitionRequest,
        offset: page * pageSize,
        length: pageSize,
        pointTime: reset ? Date.now() : (lastRequest.pointTime || null)
      }
      
      if (onLoadData) {
        const data = await onLoadData(request)
        setLastRequest(data)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [configDefinitionRequest, page, pageSize, lastRequest, onLoadData])

  useImperativeHandle(ref, () => ({
    dialogVisible,
    setDialogVisible,
    configDefinitionRequest,
    onlyUniq,
    loadPage
  }))

  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setPage(0)
  }

  const handlePrev = () => {
    if (page > 0) {
      setPage(page - 1)
    }
  }

  const handleNext = () => {
    setPage(page + 1)
  }

  const handleClose = () => {
    setDialogVisible(false)
    if (onClose) {
      onClose()
    }
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    }
  }

  const isDisableNextPage = tableData.length < pageSize

  return (
    <Modal
      title={
        <div>
          {title} | <span className="page-size">Page Size: {pageSize}</span>
        </div>
      }
      open={dialogVisible}
      onCancel={handleClose}
      width="80%"
      className={`config-editor-stream-grid ${className}`}
      footer={
        <div className="config-editor-stream-grid__footer">
          <span className="page-info">Current page: {page + 1}</span>
          <Form layout="inline">
            <Form.Item label="Page Size">
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                options={[
                  { label: '20', value: 20 },
                  { label: '50', value: 50 },
                  { label: '100', value: 100 },
                  { label: '200', value: 200 },
                  { label: '300', value: 300 }
                ]}
                style={{ width: 100 }}
              />
            </Form.Item>
          </Form>
          <Space>
            <Button type="primary" disabled={page === 0} onClick={handlePrev}>
              Previous {pageSize}
            </Button>
            <Button type="primary" disabled={isDisableNextPage} onClick={handleNext}>
              Next {pageSize}
            </Button>
            <Button onClick={handleClose}>Close</Button>
          </Space>
        </div>
      }
    >
      <div className="config-editor-stream-grid__content">
        {hasFilterBuilder && (
          <div className="config-editor-stream-grid__filter">
            <div className="filter-builder">
              {/* Filter builder would go here */}
            </div>
            <div className="actions">
              <Button type="primary" onClick={() => loadPage(true)}>
                Apply Filter
              </Button>
            </div>
          </div>
        )}

        <Table
          rowSelection={isDeleteAvailable ? rowSelection : undefined}
          columns={columns}
          dataSource={tableData}
          loading={isLoading}
          pagination={false}
          scroll={{ y: 400 }}
          onRow={(record) => ({
            onDoubleClick: () => {
              console.log('Row double clicked:', record)
            }
          })}
        />
      </div>
    </Modal>
  )
})

ConfigEditorStreamGrid.displayName = 'ConfigEditorStreamGrid'

