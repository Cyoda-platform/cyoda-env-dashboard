import React from 'react'
import { Empty } from 'antd'
import './EmptyState.scss'

export interface EmptyStateProps {
  message?: string
  description?: string
  image?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

/**
 * EmptyState Component
 * Displays an empty state with optional message and actions
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No Data',
  description,
  image,
  children,
  className = ''
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <Empty
        image={image}
        description={
          <div className="empty-description">
            <div className="empty-message">{message}</div>
            {description && <div className="empty-detail">{description}</div>}
          </div>
        }
      >
        {children}
      </Empty>
    </div>
  )
}

