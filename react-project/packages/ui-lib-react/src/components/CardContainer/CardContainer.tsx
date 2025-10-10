import React from 'react'
import { Card } from 'antd'
import './CardContainer.scss'

export interface CardContainerProps {
  title?: React.ReactNode
  extra?: React.ReactNode
  children?: React.ReactNode
  bordered?: boolean
  hoverable?: boolean
  loading?: boolean
  size?: 'default' | 'small'
  className?: string
}

/**
 * CardContainer Component
 * A wrapper around Ant Design Card for consistent card styling
 */
export const CardContainer: React.FC<CardContainerProps> = ({
  title,
  extra,
  children,
  bordered = true,
  hoverable = false,
  loading = false,
  size = 'default',
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
      className={`card-container ${className}`}
    >
      {children}
    </Card>
  )
}

