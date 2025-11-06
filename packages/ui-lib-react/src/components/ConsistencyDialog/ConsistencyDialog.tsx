import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Modal, Button, Tabs } from 'antd'
import type { TabsProps } from 'antd'
import { ConsistencyDialogTable } from '../ConsistencyDialogTable'
import './ConsistencyDialog.scss'

export interface ConsistencyDialogData {
  processResults?: any[]
  transitionResults?: any[]
  workflowResults?: any[]
}

export interface ConsistencyDialogProps {
  data?: ConsistencyDialogData
  onFix?: () => Promise<void>
  className?: string
}

export interface ConsistencyDialogRef {
  dialogVisible: boolean
  setDialogVisible: (visible: boolean) => void
}

/**
 * ConsistencyDialog
 * Dialog for displaying and fixing state machine consistency issues
 */
export const ConsistencyDialog = forwardRef<ConsistencyDialogRef, ConsistencyDialogProps>(({
  data = {},
  onFix,
  className = ''
}, ref) => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useImperativeHandle(ref, () => ({
    dialogVisible,
    setDialogVisible
  }))

  const hasErrors = (data.processResults && data.processResults.length > 0) ||
                    (data.transitionResults && data.transitionResults.length > 0) ||
                    (data.workflowResults && data.workflowResults.length > 0)

  const handleFix = async () => {
    Modal.confirm({
      title: 'Confirm!',
      content: 'Do you really want to fix?',
      onOk: async () => {
        try {
          setIsLoading(true)
          if (onFix) {
            await onFix()
          }
          setDialogVisible(false)
        } finally {
          setIsLoading(false)
        }
      }
    })
  }

  const items: TabsProps['items'] = []

  if (data.processResults && data.processResults.length > 0) {
    items.push({
      key: 'process',
      label: 'Process Results',
      children: <ConsistencyDialogTable rows={data.processResults} />
    })
  }

  if (data.transitionResults && data.transitionResults.length > 0) {
    items.push({
      key: 'transition',
      label: 'Transition Results',
      children: <ConsistencyDialogTable rows={data.transitionResults} />
    })
  }

  if (data.workflowResults && data.workflowResults.length > 0) {
    items.push({
      key: 'workflow',
      label: 'Workflow Results',
      children: <ConsistencyDialogTable rows={data.workflowResults} />
    })
  }

  return (
    <Modal
      title="State Machine Consistency"
      open={dialogVisible}
      onCancel={() => setDialogVisible(false)}
      width="50%"
      className={`consistency-dialog ${className}`}
      footer={[
        <Button key="close" onClick={() => setDialogVisible(false)}>
          Close
        </Button>
      ]}
    >
      <div className="consistency-dialog__content">
        <div className="consistency-dialog__header">
          <h4>For Automatic Fix</h4>
        </div>
        {!hasErrors ? (
          <div>State Machine have not any errors</div>
        ) : (
          <>
            <div className="consistency-dialog__actions">
              <Button type="primary" onClick={handleFix} loading={isLoading}>
                Fix
              </Button>
            </div>
            <Tabs items={items} />
          </>
        )}
      </div>
    </Modal>
  )
})

ConsistencyDialog.displayName = 'ConsistencyDialog'

