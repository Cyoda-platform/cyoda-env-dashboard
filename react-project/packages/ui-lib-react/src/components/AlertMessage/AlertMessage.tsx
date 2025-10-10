import React from 'react'
import { Alert } from 'antd'
import './AlertMessage.scss'

export interface AlertMessageProps {
  message: string
  description?: string
  type?: 'success' | 'info' | 'warning' | 'error'
  showIcon?: boolean
  closable?: boolean
  onClose?: () => void
  banner?: boolean
  className?: string
}

/**
 * AlertMessage Component
 * Displays an alert message with customizable type and appearance
 */
export const AlertMessage: React.FC<AlertMessageProps> = ({
  message,
  description,
  type = 'info',
  showIcon = true,
  closable = false,
  onClose,
  banner = false,
  className = ''
}) => {
  return (
    <Alert
      message={message}
      description={description}
      type={type}
      showIcon={showIcon}
      closable={closable}
      onClose={onClose}
      banner={banner}
      className={`alert-message ${className}`}
    />
  )
}

