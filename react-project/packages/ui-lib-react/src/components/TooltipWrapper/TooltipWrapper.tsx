import React from 'react'
import { Tooltip } from 'antd'
import './TooltipWrapper.scss'

export interface TooltipWrapperProps {
  title: React.ReactNode
  children: React.ReactNode
  placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'
  trigger?: 'hover' | 'focus' | 'click' | 'contextMenu'
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  className?: string
}

/**
 * TooltipWrapper Component
 * A wrapper around Ant Design Tooltip for consistent tooltip styling
 */
export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  title,
  children,
  placement = 'top',
  trigger = 'hover',
  mouseEnterDelay = 0.1,
  mouseLeaveDelay = 0.1,
  className = ''
}) => {
  return (
    <Tooltip
      title={title}
      placement={placement}
      trigger={trigger}
      mouseEnterDelay={mouseEnterDelay}
      mouseLeaveDelay={mouseLeaveDelay}
      className={`tooltip-wrapper ${className}`}
    >
      {children}
    </Tooltip>
  )
}

