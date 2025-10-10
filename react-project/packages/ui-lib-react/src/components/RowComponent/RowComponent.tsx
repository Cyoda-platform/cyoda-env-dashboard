import React from 'react'
import { Row } from 'antd'
import type { RowProps } from 'antd'
import './RowComponent.scss'

export interface RowComponentProps extends Omit<RowProps, 'className'> {
  className?: string
}

/**
 * RowComponent
 * A wrapper around Ant Design Row for consistent grid layout
 */
export const RowComponent: React.FC<RowComponentProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Row
      className={`row-component ${className}`}
      {...props}
    />
  )
}

