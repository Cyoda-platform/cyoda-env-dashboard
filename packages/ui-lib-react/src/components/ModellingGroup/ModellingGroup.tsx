import React from 'react'
import './ModellingGroup.scss'

export interface ModellingGroupItem {
  columnPath: string
  [key: string]: any
}

export interface ModellingGroupProps {
  reportInfoRows?: ModellingGroupItem[]
  relatedPaths?: string[]
  requestClass?: string
  checked?: string[]
  limit?: number | null
  onlyRange?: boolean
  isOpenAllSelected?: boolean
  isCondenseThePaths?: boolean
  search?: string
  parentColDef?: Record<string, any>
  onlyView?: boolean
  disablePreview?: boolean
  renderItem?: (item: ModellingGroupItem, index: number) => React.ReactNode
  className?: string
}

/**
 * ModellingGroup Component
 * Wrapper component that renders a list of modelling items
 */
export const ModellingGroup: React.FC<ModellingGroupProps> = ({
  reportInfoRows = [],
  renderItem,
  className = ''
}) => {
  return (
    <ul className={`modelling-group ${className}`}>
      {reportInfoRows.map((reportInfoRow, index) => (
        <li key={reportInfoRow.columnPath}>
          {renderItem ? renderItem(reportInfoRow, index) : null}
        </li>
      ))}
    </ul>
  )
}

