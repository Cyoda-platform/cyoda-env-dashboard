import React from 'react'
import { Card } from 'antd'
import './Section.scss'

export interface SectionProps {
  title?: string
  subtitle?: string
  extra?: React.ReactNode
  children?: React.ReactNode
  bordered?: boolean
  loading?: boolean
  className?: string
}

/**
 * Section Component
 * A wrapper around Ant Design Card for consistent section styling
 */
export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  extra,
  children,
  bordered = true,
  loading = false,
  className = ''
}) => {
  const cardTitle = title ? (
    <div className="section-header">
      <div className="section-title">{title}</div>
      {subtitle && <div className="section-subtitle">{subtitle}</div>}
    </div>
  ) : undefined

  return (
    <Card
      title={cardTitle}
      extra={extra}
      bordered={bordered}
      loading={loading}
      className={`section ${className}`}
    >
      {children}
    </Card>
  )
}

