import React, { useState, useRef } from 'react'
import { Button } from 'antd'
import './StateMachineConsistency.scss'

export interface StateMachineConsistencyDialogRef {
  dialogVisible: boolean
  setDialogVisible: (visible: boolean) => void
}

export interface StateMachineConsistencyProps {
  onCheckConsistency?: () => Promise<any>
  renderDialog?: (data: any, ref: React.RefObject<StateMachineConsistencyDialogRef>) => React.ReactNode
  className?: string
}

/**
 * StateMachineConsistency Component
 * Main component for checking state machine consistency
 */
export const StateMachineConsistency: React.FC<StateMachineConsistencyProps> = ({
  onCheckConsistency,
  renderDialog,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any>({})
  const dialogRef = useRef<StateMachineConsistencyDialogRef>(null)

  const handleCheckConsistency = async () => {
    try {
      setIsLoading(true)
      if (onCheckConsistency) {
        const result = await onCheckConsistency()
        setData(result)
        dialogRef.current?.setDialogVisible(true)
      }
    } catch (error) {
      console.error('Failed to check consistency:', error)
      // Error is logged but not re-thrown to prevent unhandled rejection
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`state-machine-consistency ${className}`}>
      <div className="state-machine-consistency__actions">
        <Button 
          type="primary" 
          loading={isLoading}
          onClick={handleCheckConsistency}
        >
          Check Consistency
        </Button>
      </div>
      {renderDialog && renderDialog(data, dialogRef)}
    </div>
  )
}

