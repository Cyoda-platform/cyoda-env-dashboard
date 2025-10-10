import React from 'react'
import { Progress } from 'antd'
import './ProgressBar.scss'

export interface ProgressBarProps {
  percent: number
  status?: 'success' | 'exception' | 'normal' | 'active'
  showInfo?: boolean
  strokeColor?: string
  type?: 'line' | 'circle' | 'dashboard'
  size?: 'small' | 'default'
  className?: string
}

/**
 * ProgressBar Component
 * A wrapper around Ant Design Progress for consistent progress bar styling
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  status,
  showInfo = true,
  strokeColor,
  type = 'line',
  size = 'default',
  className = ''
}) => {
  return (
    <Progress
      percent={percent}
      status={status}
      showInfo={showInfo}
      strokeColor={strokeColor}
      type={type}
      size={size}
      className={`progress-bar ${className}`}
    />
  )
}

