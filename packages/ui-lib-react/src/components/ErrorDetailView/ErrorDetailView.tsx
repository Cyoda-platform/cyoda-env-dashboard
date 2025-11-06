import React from 'react'
import { Modal, Button } from 'antd'
import moment from 'moment'
import { ErrorData } from '../../contexts/ErrorHandlerContext'
import './ErrorDetailView.scss'

export interface ErrorDetailViewProps {
  /** The error to display */
  error?: ErrorData | null
  /** Whether the modal is visible */
  visible: boolean
  /** Callback when modal is closed */
  onClose: () => void
  /** Callback when export button is clicked */
  onExport?: (error: ErrorData) => void
  /** Total count of events for this error message */
  eventsCount?: number
}

/**
 * ErrorDetailView Component
 * Displays detailed information about an error in a modal
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/ErrorHandler/ErrorHandlerDetailView.vue
 */
export const ErrorDetailView: React.FC<ErrorDetailViewProps> = ({
  error,
  visible,
  onClose,
  onExport,
  eventsCount = 1
}) => {
  const title = error ? `Error: ${error.message}` : 'Error Details'

  const handleExport = () => {
    if (error && onExport) {
      onExport(error)
    }
  }

  const formatDateTime = (timestamp: string) => {
    return moment(parseInt(timestamp, 10)).format('YYYY-MM-DD HH:mm:ss')
  }

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      width="70%"
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button key="export" type="primary" onClick={handleExport}>
          Export
        </Button>
      ]}
    >
      {error && (
        <div className="error-detail-view">
          <div className="error-row">
            <div className="error-name">Last error</div>
            <div className="error-text">{formatDateTime(error.createdAt)}</div>
          </div>
          <div className="error-row">
            <div className="error-name">Events</div>
            <div className="error-text">{eventsCount}</div>
          </div>
          {error.info && (
            <div className="error-row">
              <div className="error-name">Info</div>
              <div className="error-text">{error.info}</div>
            </div>
          )}
          {error.pageUrl && (
            <div className="error-row">
              <div className="error-name">Page</div>
              <div className="error-text">{error.pageUrl}</div>
            </div>
          )}
          {error.uiVersion && (
            <div className="error-row">
              <div className="error-name">UI version</div>
              <div className="error-text">{error.uiVersion}</div>
            </div>
          )}
          {error.stack && (
            <div className="error-row">
              <div className="error-name">Stack</div>
              <div className="error-text">{error.stack}</div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

