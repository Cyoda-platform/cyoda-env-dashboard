import React from 'react'
import { Collapse } from 'antd'
import type { CollapseProps } from 'antd'
import './CollapseComponent.scss'

export interface CollapseComponentProps extends Omit<CollapseProps, 'className'> {
  className?: string
}

/**
 * CollapseComponent
 * A wrapper around Ant Design Collapse for consistent collapse styling
 */
export const CollapseComponent: React.FC<CollapseComponentProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Collapse
      className={`collapse-component ${className}`}
      {...props}
    />
  )
}

