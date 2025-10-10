import React from 'react'
import { Table } from 'antd'
import type { TableProps } from 'antd'
import './TableComponent.scss'

export interface TableComponentProps<T = any> extends Omit<TableProps<T>, 'className'> {
  className?: string
}

/**
 * TableComponent
 * A wrapper around Ant Design Table for consistent table styling
 */
export function TableComponent<T extends object = any>({
  className = '',
  ...props
}: TableComponentProps<T>) {
  return (
    <Table<T>
      className={`table-component ${className}`}
      {...props}
    />
  )
}

