import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import { Table, Pagination } from 'antd'
import type { TableProps, PaginationProps } from 'antd'
import { orderBy } from 'lodash'
import './DataTable.scss'

export interface DataTableFilter {
  prop: string
  value?: any
  filterFn?: (row: any, filter: DataTableFilter) => boolean
}

export interface DataTablePaginationProps {
  pageSizes?: number[]
  total?: number
  small?: boolean
  layout?: string
}

export interface DataTableTableProps {
  border?: boolean
  height?: number | string
  maxHeight?: number | string
}

export interface DataTableProps extends Omit<TableProps<any>, 'pagination'> {
  data?: any[]
  filters?: DataTableFilter[]
  paginationProps?: DataTablePaginationProps
  pageSize?: number
  currentPage?: number
  tableProps?: DataTableTableProps
  defaultSort?: {
    prop?: string
    order?: 'ascend' | 'descend'
  }
  remote?: boolean
  toolBar?: React.ReactNode
  paginationSlot?: React.ReactNode
  onPrevClick?: () => void
  onNextClick?: () => void
  onCurrentPageChange?: () => void
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: any[]) => void
  onQueryChange?: (params: any) => void
  onPageSizeChange?: (pageSize: number) => void
  onCurrentPageUpdate?: (page: number) => void
}

export interface DataTableRef {
  tableRef: any
}

/**
 * DataTable Component
 * Feature-rich data table with pagination, sorting, and filtering
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/CyodaDataTables/CyodaDataTables.vue
 */
export const DataTable = forwardRef<DataTableRef, DataTableProps>(({
  data = [],
  filters = [],
  paginationProps = {},
  pageSize: propPageSize,
  currentPage: propCurrentPage = 1,
  tableProps = {},
  defaultSort = {},
  loading = false,
  remote = false,
  toolBar,
  paginationSlot,
  onPrevClick,
  onNextClick,
  onCurrentPageChange,
  onSelectionChange,
  onQueryChange,
  onPageSizeChange,
  onCurrentPageUpdate,
  children,
  ...restTableProps
}, ref) => {
  const tableRef = useRef<any>(null)
  const [currentPage, setCurrentPage] = useState(propCurrentPage)
  const [pageSize, setPageSize] = useState(propPageSize || 20)
  const [sortData, setSortData] = useState<any>(null)
  const queryChangeTimeoutRef = useRef<any>(null)

  // Expose table ref to parent
  useImperativeHandle(ref, () => ({
    tableRef: tableRef.current
  }))

  // Sync with prop changes
  useEffect(() => {
    if (propCurrentPage !== currentPage) {
      setCurrentPage(propCurrentPage)
    }
  }, [propCurrentPage])

  useEffect(() => {
    if (propPageSize && propPageSize !== pageSize) {
      setPageSize(propPageSize)
    }
  }, [propPageSize])

  // Sorted data
  const sortedData = useMemo(() => {
    if (sortData?.order && sortData?.columnKey) {
      const orderType = sortData.order === 'descend' ? 'desc' : 'asc'
      return orderBy([...data], [sortData.columnKey], [orderType])
    }
    return data
  }, [data, sortData])

  // Filtered data
  const filteredData = useMemo(() => {
    let localData = [...sortedData]
    if (!filters || filters.length === 0) return localData

    filters.forEach((filter) => {
      localData = localData.filter((row) => {
        if (filter.filterFn) return filter.filterFn(row, filter)
        return !filter.value || row[filter.prop] === filter.value
      })
    })
    return localData
  }, [sortedData, filters])

  // Total count
  const total = useMemo(() => {
    if (paginationProps.total !== undefined) return paginationProps.total
    return filteredData.length
  }, [paginationProps.total, filteredData])

  // Local table data (paginated)
  const localTableData = useMemo(() => {
    if (remote) return data
    const from = pageSize * (currentPage - 1)
    const to = from + pageSize
    return filteredData.slice(from, to)
  }, [remote, data, filteredData, pageSize, currentPage])

  // Query change handler with debounce
  const queryChange = (params = {}) => {
    if (queryChangeTimeoutRef.current) {
      clearTimeout(queryChangeTimeoutRef.current)
    }
    queryChangeTimeoutRef.current = setTimeout(() => {
      onQueryChange?.({
        pageSize,
        page: currentPage,
        filters,
        ...params
      })
      queryChangeTimeoutRef.current = null
    }, 100)
  }

  // Initial query change
  useEffect(() => {
    queryChange({ type: 'init' })
  }, [])

  // Watch filters
  useEffect(() => {
    queryChange()
  }, [filters])

  // Handle pagination change
  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page)
    onCurrentPageUpdate?.(page)
    onCurrentPageChange?.()
    queryChange()
  }

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size)
    onPageSizeChange?.(size)
    queryChange()
  }

  // Handle sort change
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSortData(sorter)
  }

  // Handle selection change
  const handleSelectionChange = (selectedRowKeys: React.Key[], selectedRows: any[]) => {
    onSelectionChange?.(selectedRowKeys, selectedRows)
  }

  // Pagination config
  const paginationConfig: PaginationProps = {
    current: currentPage,
    pageSize: pageSize,
    total: total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `Total ${total} items`,
    pageSizeOptions: paginationProps.pageSizes || [5, 10, 20, 50],
    size: paginationProps.small ? 'small' : 'default',
    onChange: handlePageChange,
    onShowSizeChange: handlePageSizeChange,
  }

  const showPagination = paginationConfig.total !== undefined && paginationConfig.total > 0

  return (
    <div className="cyoda-data-tables">
      {toolBar && (
        <div className="tool">
          {toolBar}
        </div>
      )}
      <div className="table">
        <Table
          ref={tableRef}
          {...restTableProps}
          dataSource={localTableData}
          loading={loading}
          bordered={tableProps.border}
          scroll={{ 
            y: tableProps.height || tableProps.maxHeight,
          }}
          pagination={false}
          onChange={handleTableChange}
          rowSelection={onSelectionChange ? {
            onChange: handleSelectionChange,
          } : undefined}
        >
          {children}
        </Table>
      </div>
      {showPagination && (
        <div className="pagination-bar">
          <div className="pagination-wrap">
            <Pagination {...paginationConfig} />
            {paginationSlot}
          </div>
        </div>
      )}
    </div>
  )
})

DataTable.displayName = 'DataTable'

