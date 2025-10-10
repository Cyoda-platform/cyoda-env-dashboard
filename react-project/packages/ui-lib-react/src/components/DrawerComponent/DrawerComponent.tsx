import React from 'react'
import { Drawer } from 'antd'
import type { DrawerProps } from 'antd'
import './DrawerComponent.scss'

export interface DrawerComponentProps extends Omit<DrawerProps, 'className'> {
  className?: string
}

/**
 * DrawerComponent
 * A wrapper around Ant Design Drawer for consistent drawer styling
 */
export const DrawerComponent: React.FC<DrawerComponentProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Drawer
      className={`drawer-component ${className}`}
      {...props}
    />
  )
}

