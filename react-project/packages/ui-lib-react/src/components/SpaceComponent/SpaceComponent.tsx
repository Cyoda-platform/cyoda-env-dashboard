import React from 'react'
import { Space } from 'antd'
import type { SpaceProps } from 'antd'
import './SpaceComponent.scss'

export interface SpaceComponentProps extends Omit<SpaceProps, 'className'> {
  className?: string
}

/**
 * SpaceComponent
 * A wrapper around Ant Design Space for consistent spacing
 */
export const SpaceComponent: React.FC<SpaceComponentProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Space
      className={`space-component ${className}`}
      {...props}
    />
  )
}

