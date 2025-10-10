import React from 'react'
import { Spin } from 'antd'
import './LoadingSpinner.scss'

export interface LoadingSpinnerProps {
  loading?: boolean
  tip?: string
  size?: 'small' | 'default' | 'large'
  fullscreen?: boolean
  children?: React.ReactNode
  className?: string
}

/**
 * LoadingSpinner Component
 * Displays a loading spinner with optional tip text
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  loading = true,
  tip,
  size = 'default',
  fullscreen = false,
  children,
  className = ''
}) => {
  if (fullscreen) {
    return (
      <div className={`loading-spinner-fullscreen ${className}`}>
        <Spin spinning={loading} tip={tip} size={size}>
          {children}
        </Spin>
      </div>
    )
  }

  return (
    <div className={`loading-spinner ${className}`}>
      <Spin spinning={loading} tip={tip} size={size}>
        {children}
      </Spin>
    </div>
  )
}

