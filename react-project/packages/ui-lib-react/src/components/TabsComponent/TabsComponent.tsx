import React from 'react'
import { Tabs } from 'antd'
import type { TabsProps } from 'antd'
import './TabsComponent.scss'

export interface TabsComponentProps extends Omit<TabsProps, 'className'> {
  className?: string
}

/**
 * TabsComponent
 * A wrapper around Ant Design Tabs for consistent tabs styling
 */
export const TabsComponent: React.FC<TabsComponentProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Tabs
      className={`tabs-component ${className}`}
      {...props}
    />
  )
}

