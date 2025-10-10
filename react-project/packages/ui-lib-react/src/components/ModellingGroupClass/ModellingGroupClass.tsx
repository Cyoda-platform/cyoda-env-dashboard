import React from 'react'
import './ModellingGroupClass.scss'

export interface ModellingGroupClassItem {
  [key: string]: any
}

export interface ModellingGroupClassProps {
  requestParams?: ModellingGroupClassItem[]
  type?: string
  configDefinition?: Record<string, any>
  checked?: string[]
  limit?: number | null
  onlyRange?: boolean
  isOpenAllSelected?: boolean
  isCondenseThePaths?: boolean
  search?: string
  parentColDef?: Record<string, any>
  onlyView?: boolean
  disablePreview?: boolean
  renderItem?: (item: ModellingGroupClassItem, index: number) => React.ReactNode
  className?: string
}

/**
 * ModellingGroupClass Component
 * Wrapper component that renders a list of modelling item class components
 */
export const ModellingGroupClass: React.FC<ModellingGroupClassProps> = ({
  requestParams = [],
  renderItem,
  className = ''
}) => {
  return (
    <ul className={`modelling-group-class ${className}`}>
      {requestParams.map((requestParam, index) => (
        <li key={index}>
          {renderItem ? renderItem(requestParam, index) : null}
        </li>
      ))}
    </ul>
  )
}

