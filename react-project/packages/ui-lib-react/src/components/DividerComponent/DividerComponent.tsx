import React from 'react'
import { Divider } from 'antd'
import type { DividerProps } from 'antd'
import './DividerComponent.scss'

export interface DividerComponentProps extends Omit<DividerProps, 'className'> {
  className?: string
}

/**
 * DividerComponent
 * A wrapper around Ant Design Divider for consistent divider styling
 */
export const DividerComponent: React.FC<DividerComponentProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Divider
      className={`divider-component ${className}`}
      {...props}
    />
  )
}

