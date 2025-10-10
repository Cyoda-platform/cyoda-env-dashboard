import React from 'react'
import { Badge } from 'antd'
import './StatusBadge.scss'

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'default' | 'processing'

export interface StatusBadgeProps {
  status?: StatusType
  text?: string
  count?: number
  showZero?: boolean
  dot?: boolean
  children?: React.ReactNode
  className?: string
}

/**
 * StatusBadge Component
 * Displays a status badge with customizable appearance
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = 'default',
  text,
  count,
  showZero = false,
  dot = false,
  children,
  className = ''
}) => {
  if (text) {
    return (
      <Badge status={status} text={text} className={`status-badge ${className}`} />
    )
  }

  if (count !== undefined || dot) {
    return (
      <Badge
        count={count}
        showZero={showZero}
        dot={dot}
        className={`status-badge ${className}`}
      >
        {children}
      </Badge>
    )
  }

  return (
    <Badge status={status} className={`status-badge ${className}`}>
      {children}
    </Badge>
  )
}

