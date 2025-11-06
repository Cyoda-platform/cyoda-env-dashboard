import React from 'react'
import { Divider } from 'antd'
import { ConsistencyTableRow, ConsistencyRowData } from '../ConsistencyTableRow'
import './ConsistencyTable.scss'

export interface ConsistencyTableProps {
  title?: string
  rows?: ConsistencyRowData[]
  className?: string
}

/**
 * ConsistencyTable Component
 * Displays a table of state machine consistency check results
 */
export const ConsistencyTable: React.FC<ConsistencyTableProps> = ({
  title = '',
  rows = [],
  className = ''
}) => {
  return (
    <div className={`consistency-table ${className}`}>
      {title && <div className="title">{title}</div>}
      {rows.map((row, index) => (
        <React.Fragment key={index}>
          <ConsistencyTableRow row={row} />
          {index + 1 < rows.length && <Divider />}
        </React.Fragment>
      ))}
    </div>
  )
}

