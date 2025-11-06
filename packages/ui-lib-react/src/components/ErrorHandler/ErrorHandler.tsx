import React, { useState, useEffect, useMemo } from 'react'
import { message } from 'antd'
import moment from 'moment'
import FileSaver from 'file-saver'
import { ErrorNotification } from '../ErrorNotification'
import { ErrorTable } from '../ErrorTable'
import { ErrorDetailView } from '../ErrorDetailView'
import { useErrorHandler, ErrorData } from '../../contexts/ErrorHandlerContext'

export interface ErrorHandlerProps {
  /** UI version for error reports */
  uiVersion?: string
  /** Platform version for error reports */
  platformVersion?: string
  /** Error messages to ignore (won't be tracked) */
  ignoreErrors?: string[]
  /** Whether to enable global error handling */
  enableGlobalHandler?: boolean
}

/**
 * ErrorHandler Component
 * Main error handling component that provides error tracking, notification, and debugging tools
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/ErrorHandler/ErrorHandler.vue
 */
export const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  uiVersion = import.meta.env.VITE_APP_UI_VERSION || '-',
  platformVersion = '-',
  ignoreErrors = ['Request failed with status code', 'canceled'],
  enableGlobalHandler = true
}) => {
  const { errors, addError, clearErrors } = useErrorHandler()
  const [tableVisible, setTableVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedError, setSelectedError] = useState<ErrorData | null>(null)

  // Count of events for the selected error
  const eventsCount = useMemo(() => {
    if (!selectedError) return 0
    return errors.filter(e => e.message === selectedError.message).length
  }, [errors, selectedError])

  // Setup global error handler
  useEffect(() => {
    if (!enableGlobalHandler) return

    const handleError = (event: ErrorEvent) => {
      const error = event.error

      // Check if error should be ignored
      if (ignoreErrors.some(ignoreErr => 
        error?.message?.toLowerCase().includes(ignoreErr.toLowerCase())
      )) {
        console.error(error)
        return
      }

      // Show error message to user
      message.error({
        content: (
          <span>
            Page may not work correctly. Please send error to developer.{' '}
            <a onClick={() => setTableVisible(true)}>Open debug tool</a>
          </span>
        ),
        duration: 5
      })

      // Add error to store
      addError({
        message: error?.message || 'Unknown error',
        info: event.type,
        stack: error?.stack,
        createdAt: moment().format('x'),
        pageUrl: window.location.href,
        uiVersion
      })

      console.error(error)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [enableGlobalHandler, ignoreErrors, uiVersion, addError])

  const handleOpenTable = () => {
    setTableVisible(true)
  }

  const handleCloseTable = () => {
    setTableVisible(false)
  }

  const handleDetailView = (error: ErrorData) => {
    setSelectedError(error)
    setDetailVisible(true)
  }

  const handleCloseDetail = () => {
    setDetailVisible(false)
    setSelectedError(null)
  }

  const prepareDataForExport = (error: ErrorData) => {
    return {
      message: error.message,
      info: error.info,
      stack: error.stack,
      createdAt: error.createdAt,
      pageUrl: error.pageUrl,
      uiVersion: error.uiVersion,
      platformVersion
    }
  }

  const handleExport = (error: ErrorData) => {
    const data = prepareDataForExport(error)
    const sanitizedMessage = error.message
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll(/[^a-zA-Z0-9]/g, '_')
      .replaceAll(/_+/g, '_')
      .replace(/_$/, '')

    const fileName = `file_${moment().format('YYYY-MM-DD_HH-mm-ss')}_platform_v${platformVersion}_UI_v${uiVersion}_error_${sanitizedMessage}.json`
    const content = JSON.stringify(data, null, 2)
    const file = new File([content], fileName, { type: 'text/plain;charset=utf-8' })
    FileSaver.saveAs(file)
  }

  const handleExportAll = () => {
    const allData = errors.map(error => prepareDataForExport(error))
    const fileName = `all_errors_${moment().format('YYYY-MM-DD_HH-mm-ss')}_platform_v${platformVersion}_UI_v${uiVersion}.json`
    const content = JSON.stringify(allData, null, 2)
    const file = new File([content], fileName, { type: 'text/plain;charset=utf-8' })
    FileSaver.saveAs(file)
  }

  const handleClearErrors = () => {
    clearErrors()
    setTableVisible(false)
    message.success('All errors cleared')
  }

  return (
    <div className="error-handler">
      <ErrorNotification
        visible={errors.length > 0}
        onClick={handleOpenTable}
      />
      <ErrorTable
        errors={errors}
        visible={tableVisible}
        onClose={handleCloseTable}
        onDetailView={handleDetailView}
        onExport={handleExport}
        onExportAll={handleExportAll}
        onClearErrors={handleClearErrors}
      />
      <ErrorDetailView
        error={selectedError}
        visible={detailVisible}
        onClose={handleCloseDetail}
        onExport={handleExport}
        eventsCount={eventsCount}
      />
    </div>
  )
}

