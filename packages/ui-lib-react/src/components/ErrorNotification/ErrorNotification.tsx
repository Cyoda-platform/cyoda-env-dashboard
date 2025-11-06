import React from 'react'
import { BugOutlined } from '@ant-design/icons'
import './ErrorNotification.scss'

export interface ErrorNotificationProps {
  /** Callback when notification is clicked */
  onClick?: () => void
  /** Whether to show the notification */
  visible?: boolean
}

/**
 * ErrorNotification Component
 * Displays a floating bug icon when errors are present
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/ErrorHandler/ErrorHandlerNotification.vue
 */
export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  onClick,
  visible = true
}) => {
  if (!visible) return null

  return (
    <div className="error-notification" onClick={onClick}>
      <BugOutlined />
    </div>
  )
}

