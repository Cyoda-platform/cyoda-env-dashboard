import React, { useState, forwardRef, useImperativeHandle, useMemo } from 'react'
import { Modal, Button } from 'antd'
import { CodeEditor } from '../CodeEditor'
import './QueryPlanDetailRaw.scss'

export interface QueryPlanDetailRawRef {
  dialogVisible: boolean
  setDialogVisible: (visible: boolean) => void
}

export interface QueryPlanDetailRawProps {
  queryPlan?: any
  title?: string
  className?: string
  visible?: boolean
  onClose?: () => void
}

/**
 * QueryPlanDetailRaw Component
 * Displays raw query plan in a modal with syntax highlighting
 * Supports both ref-based and props-based visibility control
 */
export const QueryPlanDetailRaw = forwardRef<QueryPlanDetailRawRef, QueryPlanDetailRawProps>(({
  queryPlan = {},
  title = '',
  className = '',
  visible,
  onClose
}, ref) => {
  const [internalVisible, setInternalVisible] = useState(false)

  // Use props-based visibility if provided, otherwise use internal state
  const isVisible = visible !== undefined ? visible : internalVisible
  const handleClose = onClose || (() => setInternalVisible(false))

  useImperativeHandle(ref, () => ({
    dialogVisible: internalVisible,
    setDialogVisible: setInternalVisible
  }))

  const computedTitle = useMemo(() => {
    return `Query Plan Raw For ${title}`
  }, [title])

  const formattedCode = useMemo(() => {
    return JSON.stringify(queryPlan, null, 2)
  }, [queryPlan])

  return (
    <Modal
      open={isVisible}
      onCancel={handleClose}
      title={computedTitle}
      width="80%"
      className={`query-plan-detail-raw ${className}`}
      maskClosable={false}
      footer={[
        <Button key="close" onClick={handleClose}>
          Close
        </Button>
      ]}
    >
      <CodeEditor
        value={formattedCode}
        language="json"
        readOnly={true}
        height="500px"
      />
    </Modal>
  )
})

QueryPlanDetailRaw.displayName = 'QueryPlanDetailRaw'

