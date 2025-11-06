import React from 'react'
import { Divider } from 'antd'
import { ConsistencyTableRow } from '../ConsistencyTableRow'
import './ConsistencyDialogTable.scss'

export interface ConsistencyDialogTableRow {
  [key: string]: any
}

export interface ConsistencyDialogTableProps {
  title?: string
  rows?: ConsistencyDialogTableRow[]
  className?: string
}

/**
 * ConsistencyDialogTable Component
 * Displays a table of consistency check results with a title
 */
export const ConsistencyDialogTable: React.FC<ConsistencyDialogTableProps> = ({
  title = '',
  rows = [],
  className = ''
}) => {
  return (
    <div className={`consistency-dialog-table ${className}`}>
      {title && <div className="consistency-dialog-table__title">{title}</div>}
      {rows.map((row, index) => (
        <React.Fragment key={index}>
          <ConsistencyTableRow row={row} />
          {index + 1 < rows.length && <Divider />}
        </React.Fragment>
      ))}
    </div>
  )
}

