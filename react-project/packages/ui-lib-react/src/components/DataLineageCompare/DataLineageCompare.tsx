import React, { useState, useImperativeHandle, forwardRef, useMemo } from 'react'
import { Modal } from 'antd'
import dayjs from 'dayjs'
import { CodeEditor } from '../CodeEditor'
import './DataLineageCompare.scss'

export interface Transaction {
  transactionId: string
  dateTime: string
  [key: string]: any
}

export interface ChangedField {
  columnPath: string
  columnPathContainer: {
    prevValue: any
    currValue: any
  }
}

export interface CompareData {
  changedFields?: ChangedField[]
  [key: string]: any
}

export interface DataLineageCompareProps {
  compareData?: CompareData
  checkedTransactions?: Transaction[]
  className?: string
}

export interface DataLineageCompareRef {
  dialogVisible: boolean
  setDialogVisible: (visible: boolean) => void
}

/**
 * DataLineageCompare Component
 * Displays a comparison dialog for data lineage transactions
 */
export const DataLineageCompare = forwardRef<DataLineageCompareRef, DataLineageCompareProps>(
  ({ compareData = {}, checkedTransactions = [], className = '' }, ref) => {
    const [dialogVisible, setDialogVisible] = useState(false)

    useImperativeHandle(ref, () => ({
      dialogVisible,
      setDialogVisible
    }))

    const transformDate = (date: string): string => {
      return dayjs(date, 'DD-MM-YYYY HH:mm:ss.SSS').format('DD/MM/YYYY HH:mm:ss')
    }

    const getDataFor = (field: 'currValue' | 'prevValue'): string => {
      if (!compareData?.changedFields) return ''
      
      return compareData.changedFields
        .map((el) => `${el.columnPath}: ${el.columnPathContainer[field]}`)
        .join('\n')
    }

    const oldStr = useMemo(() => getDataFor('prevValue'), [compareData])
    const newStr = useMemo(() => getDataFor('currValue'), [compareData])

    const handleClose = () => {
      setDialogVisible(false)
    }

    return (
      <Modal
        title="Compare"
        open={dialogVisible}
        onCancel={handleClose}
        width="80%"
        footer={null}
        maskClosable={false}
        className={`data-lineage-compare ${className}`}
      >
        {checkedTransactions.length >= 2 && (
          <div className="row flex">
            <div>
              <strong>Date:</strong> {transformDate(checkedTransactions[0].dateTime)}
              <br />
              <strong>Transaction Id:</strong> {checkedTransactions[0].transactionId}
            </div>
            <div>
              <strong>Date:</strong> {transformDate(checkedTransactions[1].dateTime)}
              <br />
              <strong>Transaction Id:</strong> {checkedTransactions[1].transactionId}
            </div>
          </div>
        )}
        <CodeEditor
          value={oldStr}
          language="text"
          readOnly
          diffEditor
          originalValue={oldStr}
          modifiedValue={newStr}
        />
      </Modal>
    )
  }
)

DataLineageCompare.displayName = 'DataLineageCompare'

