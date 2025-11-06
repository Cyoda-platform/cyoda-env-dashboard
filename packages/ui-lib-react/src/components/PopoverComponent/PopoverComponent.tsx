import React from 'react'
import { Popover } from 'antd'
import type { PopoverProps } from 'antd'
import './PopoverComponent.scss'

export interface PopoverComponentProps extends Omit<PopoverProps, 'className'> {
  className?: string
}

/**
 * PopoverComponent
 * A wrapper around Ant Design Popover for consistent popover styling
 */
export const PopoverComponent: React.FC<PopoverComponentProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Popover
      className={`popover-component ${className}`}
      {...props}
    />
  )
}

