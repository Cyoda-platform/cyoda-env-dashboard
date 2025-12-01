import React, { forwardRef, useImperativeHandle, useState, useMemo, useCallback } from 'react'
import { Modal, Table, Button, Select, Form, Space } from 'antd'
import type { TableColumnsType } from 'antd'
import EntityDetailModal from '../EntityDetailModal/EntityDetailModal'
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
  onFetchDefinition?: (definitionId: string) => Promise<any>
  onClose?: () => void
  className?: string
}

export interface ConfigEditorStreamGridRef {
  dialogVisible: boolean
  setDialogVisible: (visible: boolean) => void
  definitionId: string | null
  setDefinitionId: (id: string | null) => void
  configDefinitionRequest: ConfigDefinitionRequest
  setConfigDefinitionRequest: (request: ConfigDefinitionRequest) => void
  onlyUniq: boolean
  setOnlyUniq: (value: boolean) => void
  loadPage: () => Promise<void>
  open: (id: string) => void
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
  onFetchDefinition,
  onClose,
  className = ''
}, ref) => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [definitionId, setDefinitionId] = useState<string | null>(null)
  const [configDefinitionRequest, setConfigDefinitionRequest] = useState<ConfigDefinitionRequest>({})
  const [onlyUniq, setOnlyUniq] = useState(false)
  const [lastRequest, setLastRequest] = useState<StreamGridData>({})
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [entityDetailVisible, setEntityDetailVisible] = useState(false)

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
    console.log('ConfigEditorStreamGrid: Computing tableData from lastRequest:', lastRequest)
    if (lastRequest?.rows && lastRequest.rows.length > 0) {
      console.log('ConfigEditorStreamGrid: First row:', lastRequest.rows[0])
      let data = lastRequest.rows.map((row) => row.columnsValues)

      // If onlyUniq is true and there's only one column, filter to unique values
      const keys = Object.keys(data[0] || {})
      if (onlyUniq && keys.length === 1) {
        console.log('ConfigEditorStreamGrid: Filtering to unique values for column:', keys[0])
        // Use a Set to get unique values based on the single column
        const uniqueValues = new Map()
        data.forEach((row) => {
          const value = row[keys[0]]
          const key = JSON.stringify(value)
          if (!uniqueValues.has(key)) {
            uniqueValues.set(key, row)
          }
        })
        data = Array.from(uniqueValues.values())
        console.log('ConfigEditorStreamGrid: Unique values count:', data.length)
      }

      // Add keys for React table
      const dataWithKeys = data.map((row, index) => ({
        key: index,
        ...row
      }))
      console.log('ConfigEditorStreamGrid: Computed tableData:', dataWithKeys)
      return dataWithKeys
    }
    console.log('ConfigEditorStreamGrid: No rows in lastRequest')
    return []
  }, [lastRequest, onlyUniq])

  const loadPage = useCallback(async (reset = false, customRequest?: any) => {
    try {
      setIsLoading(true)
      const baseRequest = customRequest || configDefinitionRequest
      const request = {
        ...baseRequest,
        offset: page * pageSize,
        length: pageSize,
        pointTime: reset ? Date.now() : (lastRequest.pointTime || null)
      }

      console.log('ConfigEditorStreamGrid: Loading page with request:', request)

      if (onLoadData) {
        const data = await onLoadData(request)
        console.log('ConfigEditorStreamGrid: Received data:', data)
        console.log('ConfigEditorStreamGrid: sdDef from response:', data.sdDef)

        // If the response includes sdDef, use it to update configDefinitionRequest
        if (data.sdDef) {
          const updatedRequest = {
            ...request,
            sdDef: data.sdDef,
          }
          console.log('ConfigEditorStreamGrid: Updated request with sdDef:', updatedRequest)
          setConfigDefinitionRequest(updatedRequest)
        }

        setLastRequest(data)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [configDefinitionRequest, page, pageSize, lastRequest, onLoadData])

  // Auto-load data when dialog opens (similar to Vue's watch)
  React.useEffect(() => {
    const fetchAndLoadData = async () => {
      if (dialogVisible && definitionId) {
        console.log('ConfigEditorStreamGrid: Dialog opened with definitionId:', definitionId)

        // Reset state
        setPage(0)
        setLastRequest({})

        // Fetch the stream definition
        if (onFetchDefinition) {
          try {
            const definition = await onFetchDefinition(definitionId)
            console.log('ConfigEditorStreamGrid: Fetched definition:', definition)

            // Set the config definition request
            const request: ConfigDefinitionRequest = {
              '@bean': 'com.cyoda.core.streamdata.StreamDataRequest',
              sdDef: definition.streamDataDef || definition,
              pointTime: Date.now(),
              offset: 0,
              length: pageSize,
            }

            console.log('ConfigEditorStreamGrid: Setting configDefinitionRequest:', request)
            setConfigDefinitionRequest(request)

            // Load the first page with the request directly
            if (onLoadData) {
              setIsLoading(true)
              try {
                const data = await onLoadData(request)
                console.log('ConfigEditorStreamGrid: Received data:', data)
                setLastRequest(data)
              } catch (error) {
                console.error('ConfigEditorStreamGrid: Failed to load data:', error)
              } finally {
                setIsLoading(false)
              }
            }
          } catch (error) {
            console.error('ConfigEditorStreamGrid: Failed to fetch definition:', error)
          }
        }
      }

      if (!dialogVisible && onClose) {
        onClose()
      }
    }

    fetchAndLoadData()
  }, [dialogVisible, definitionId])

  useImperativeHandle(ref, () => ({
    dialogVisible,
    setDialogVisible,
    definitionId,
    setDefinitionId,
    configDefinitionRequest,
    setConfigDefinitionRequest,
    onlyUniq,
    setOnlyUniq,
    loadPage,
    open: (id: string) => {
      setDefinitionId(id)
      setDialogVisible(true)
    }
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

  const handleRowDoubleClick = (record: any) => {
    console.log('Row double clicked:', record)
    if (record && record.id) {
      setSelectedRow(record)
      setEntityDetailVisible(true)
    }
  }

  const handleEntityDetailClose = () => {
    setEntityDetailVisible(false)
    setSelectedRow(null)
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
          scroll={{ x: true, y: 400 }}
          onRow={(record) => ({
            onDoubleClick: () => handleRowDoubleClick(record)
          })}
        />
      </div>

      {/* Entity Detail Modal */}
      <EntityDetailModal
        visible={entityDetailVisible}
        selectedRow={selectedRow}
        configDefinition={configDefinitionRequest.sdDef || {}}
        onClose={handleEntityDetailClose}
      />
    </Modal>
  )
})

ConfigEditorStreamGrid.displayName = 'ConfigEditorStreamGrid'

