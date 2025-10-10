import React from 'react'
import { Col } from 'antd'
import type { ColProps } from 'antd'
import './ColComponent.scss'

export interface ColComponentProps extends Omit<ColProps, 'className'> {
  className?: string
}

/**
 * ColComponent
 * A wrapper around Ant Design Col for consistent grid layout
 */
export const ColComponent: React.FC<ColComponentProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Col
      className={`col-component ${className}`}
      {...props}
    />
  )
}

