import React from 'react'
import { Card } from 'antd'
import './CardWrapper.scss'

export interface CardWrapperProps {
  title?: React.ReactNode
  extra?: React.ReactNode
  bordered?: boolean
  hoverable?: boolean
  loading?: boolean
  size?: 'default' | 'small'
  children?: React.ReactNode
  className?: string
}

/**
 * CardWrapper Component
 * A wrapper around Ant Design Card for consistent card styling
 */
export const CardWrapper: React.FC<CardWrapperProps> = ({
  title,
  extra,
  bordered = true,
  hoverable = false,
  loading = false,
  size = 'default',
  children,
  className = ''
}) => {
  return (
    <Card
      title={title}
      extra={extra}
      bordered={bordered}
      hoverable={hoverable}
      loading={loading}
      size={size}
      className={`card-wrapper ${className}`}
    >
      {children}
    </Card>
  )
}

