import React, { useState, useImperativeHandle, forwardRef, useMemo, useEffect } from 'react'
import { Modal, Spin } from 'antd'
import { RightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getCyodaCloudEntity, HelperFeatureFlags } from '@cyoda/http-api-react'
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
 *
 * When VITE_FEATURE_FLAG_IS_CYODA_CLOUD is enabled, this component fetches full entity
 * JSON at each transaction ID and displays a JSON diff instead of the field-based diff.
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
    [key: string]: any // Allow additional properties like elements, shortPath
  }
}

export interface CompareData {
  changedFields?: ChangedField[]
  [key: string]: any
}

export interface DataLineageCompareProps {
  compareData?: CompareData | null
  checkedTransactions?: Transaction[]
  className?: string
  /** Entity ID for fetching full entity JSON in Cyoda Cloud mode */
  entityId?: string
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
  ({ compareData = {}, checkedTransactions = [], className = '', entityId }, ref) => {
    const [dialogVisible, setDialogVisible] = useState(false)
    const isCyodaCloud = HelperFeatureFlags.isCyodaCloud()

    // Cyoda Cloud mode state for JSON diff
    const [cyodaCloudLoading, setCyodaCloudLoading] = useState(false)
    const [cyodaCloudOldEntity, setCyodaCloudOldEntity] = useState<Record<string, unknown> | null>(null)
    const [cyodaCloudNewEntity, setCyodaCloudNewEntity] = useState<Record<string, unknown> | null>(null)
    const [cyodaCloudError, setCyodaCloudError] = useState<string | null>(null)

    useImperativeHandle(ref, () => ({
      dialogVisible,
      setDialogVisible
    }))

    // Fetch entity versions when dialog opens in Cyoda Cloud mode
    useEffect(() => {
      if (!dialogVisible || !isCyodaCloud || !entityId || checkedTransactions.length < 2) {
        return
      }

      const fetchEntityVersions = async () => {
        setCyodaCloudLoading(true)
        setCyodaCloudError(null)
        setCyodaCloudOldEntity(null)
        setCyodaCloudNewEntity(null)

        try {
          const [oldResponse, newResponse] = await Promise.all([
            getCyodaCloudEntity(entityId, checkedTransactions[0].transactionId),
            getCyodaCloudEntity(entityId, checkedTransactions[1].transactionId)
          ])
          setCyodaCloudOldEntity(oldResponse.data)
          setCyodaCloudNewEntity(newResponse.data)
        } catch (error) {
          console.error('Failed to fetch entity versions for comparison:', error)
          setCyodaCloudError('Failed to fetch entity versions. Please try again.')
        } finally {
          setCyodaCloudLoading(false)
        }
      }

      fetchEntityVersions()
    }, [dialogVisible, isCyodaCloud, entityId, checkedTransactions])

    const transformDate = (date: string): string => {
      return dayjs(date, 'DD-MM-YYYY HH:mm:ss.SSS').format('DD/MM/YYYY HH:mm:ss')
    }

    // Standard mode: get data from compareData.changedFields
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

    // Standard mode strings (from compareData)
    const oldStr = useMemo(() => {
      if (isCyodaCloud) return '' // Not used in Cyoda Cloud mode
      console.log('DataLineageCompare: compareData =', compareData)
      console.log('DataLineageCompare: changedFields =', compareData?.changedFields)
      const data = getDataFor('prevValue')
      console.log('DataLineageCompare: oldStr =', data)
      console.log('DataLineageCompare: oldStr length =', data.length)
      return data
    }, [compareData, isCyodaCloud])

    const newStr = useMemo(() => {
      if (isCyodaCloud) return '' // Not used in Cyoda Cloud mode
      const data = getDataFor('currValue')
      console.log('DataLineageCompare: newStr =', data)
      console.log('DataLineageCompare: newStr length =', data.length)
      return data
    }, [compareData, isCyodaCloud])

    // Cyoda Cloud mode strings (from fetched entities)
    const cyodaCloudOldStr = useMemo(() => {
      if (!cyodaCloudOldEntity) return ''
      return JSON.stringify(cyodaCloudOldEntity, null, 2)
    }, [cyodaCloudOldEntity])

    const cyodaCloudNewStr = useMemo(() => {
      if (!cyodaCloudNewEntity) return ''
      return JSON.stringify(cyodaCloudNewEntity, null, 2)
    }, [cyodaCloudNewEntity])

    const handleClose = () => {
      setDialogVisible(false)
      // Reset Cyoda Cloud state when closing
      if (isCyodaCloud) {
        setCyodaCloudOldEntity(null)
        setCyodaCloudNewEntity(null)
        setCyodaCloudError(null)
      }
    }

    // Determine which strings to use for diff
    const diffOldString = isCyodaCloud ? cyodaCloudOldStr : oldStr
    const diffNewString = isCyodaCloud ? cyodaCloudNewStr : newStr
    const diffLanguage = isCyodaCloud ? 'json' : 'plain'

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
          {isCyodaCloud && cyodaCloudLoading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px', color: '#666' }}>Loading entity versions...</div>
            </div>
          ) : isCyodaCloud && cyodaCloudError ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#ff4d4f' }}>
              {cyodaCloudError}
            </div>
          ) : (
            <CodeEditor
              diff={true}
              oldString={diffOldString}
              newString={diffNewString}
              language={diffLanguage}
              diffReadonly={true}
              height="500px"
            />
          )}
        </div>
      </Modal>
    )
  }
)

DataLineageCompare.displayName = 'DataLineageCompare'

