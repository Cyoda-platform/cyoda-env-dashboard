import React, { useState, useImperativeHandle, forwardRef, useMemo } from 'react'
import { Modal } from 'antd'
import { RightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { CodeEditor } from '../CodeEditor'
import './DataLineageCompare.scss'

/**
 * DataLineageCompare Component
 *
 * Displays a diff comparison between two transaction states using Monaco Editor.
 *
 * IMPORTANT: This component has critical styling requirements for diff highlighting
 * to work correctly in both light and dark themes. See README.md for details.
 *
 * Key dependencies:
 * - DataLineageCompare.scss: Contains transparent background overrides for light theme
 * - monacoTheme.ts: Contains matching diff colors for both themes
 *
 * DO NOT modify the SCSS without visual testing in both themes!
 */

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

      const lines = compareData.changedFields.map((el) => {
        const value = el.columnPathContainer[field]
        // Format value for better readability
        const formattedValue = typeof value === 'object'
          ? JSON.stringify(value, null, 2)
          : String(value ?? 'null')
        return `${el.columnPath}: ${formattedValue}`
      })

      console.log(`DataLineageCompare: ${field} lines:`, lines)
      return lines.join('\n')
    }

    const oldStr = useMemo(() => {
      console.log('DataLineageCompare: compareData =', compareData)
      console.log('DataLineageCompare: changedFields =', compareData?.changedFields)
      const data = getDataFor('prevValue')
      console.log('DataLineageCompare: oldStr =', data)
      console.log('DataLineageCompare: oldStr length =', data.length)
      return data
    }, [compareData])

    const newStr = useMemo(() => {
      const data = getDataFor('currValue')
      console.log('DataLineageCompare: newStr =', data)
      console.log('DataLineageCompare: newStr length =', data.length)
      return data
    }, [compareData])

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
          <div className="compare-header">
            <div className="compare-header__left">
              <div><strong>Date:</strong> {transformDate(checkedTransactions[0].dateTime)}</div>
              <div><strong>Transaction Id:</strong> {checkedTransactions[0].transactionId}</div>
            </div>
            <div className="compare-header__arrow">
              <RightOutlined />
            </div>
            <div className="compare-header__right">
              <div><strong>Date:</strong> {transformDate(checkedTransactions[1].dateTime)}</div>
              <div><strong>Transaction Id:</strong> {checkedTransactions[1].transactionId}</div>
            </div>
          </div>
        )}
        <div className="compare-content">
          <CodeEditor
            diff={true}
            oldString={oldStr}
            newString={newStr}
            language="plain"
            diffReadonly={true}
            height="500px"
          />
        </div>
      </Modal>
    )
  }
)

DataLineageCompare.displayName = 'DataLineageCompare'

