import React, { useState, useRef } from 'react'
import { Timeline, Checkbox, Button } from 'antd'
import { DataLineageCompare, DataLineageCompareRef } from '../DataLineageCompare'
import dayjs from 'dayjs'
import './DataLineageTransactions.scss'

export interface Transaction {
  transactionId: string
  dateTime: string
  changeCount: number
  timestamp?: string
}

export interface DataLineageTransactionsProps {
  transactionsData?: Transaction[]
  requestClass?: string
  id?: string
  onCompare?: (transaction1: Transaction, transaction2: Transaction) => Promise<any>
  className?: string
}

/**
 * DataLineageTransactions Component
 * Displays a timeline of transactions with comparison functionality
 */
export const DataLineageTransactions: React.FC<DataLineageTransactionsProps> = ({
  transactionsData = [],
  requestClass = '',
  id = '',
  onCompare,
  className = ''
}) => {
  const [checkedTransactions, setCheckedTransactions] = useState<Transaction[]>([])
  const [compareData, setCompareData] = useState<any>({})
  const [isLoadingCompare, setIsLoadingCompare] = useState(false)
  const dataLineageCompareRef = useRef<DataLineageCompareRef>(null)

  const transformDate = (date: string): string => {
    return dayjs(date, 'DD-MM-YYYY HH:mm:ss.SSS').format('DD/MM/YYYY HH:mm:ss')
  }

  const handleCheckboxChange = (transaction: Transaction, checked: boolean) => {
    if (checked) {
      if (checkedTransactions.length < 2) {
        setCheckedTransactions([...checkedTransactions, transaction])
      }
    } else {
      setCheckedTransactions(checkedTransactions.filter(t => t.transactionId !== transaction.transactionId))
    }
  }

  // Compute sorted transactions for display in compare modal
  const sortedCheckedTransactions = React.useMemo(() => {
    return [...checkedTransactions].sort((a, b) => {
      const dateA = dayjs(a.dateTime, 'DD-MM-YYYY HH:mm:ss.SSS')
      const dateB = dayjs(b.dateTime, 'DD-MM-YYYY HH:mm:ss.SSS')
      return dateA.unix() - dateB.unix()
    })
  }, [checkedTransactions])

  const handleCompare = async () => {
    if (checkedTransactions.length < 2 || !onCompare) return

    try {
      setIsLoadingCompare(true)
      // Use pre-sorted transactions
      const sorted = sortedCheckedTransactions

      const data = await onCompare(sorted[0], sorted[1])
      setCompareData(data)
      dataLineageCompareRef.current?.setDialogVisible(true)
    } finally {
      setIsLoadingCompare(false)
    }
  }

  const timelineItems = transactionsData.map((transaction, index) => ({
    key: index,
    children: (
      <div className="data-lineage-transactions__item">
        <div className="data-lineage-transactions__date">
          {transformDate(transaction.dateTime)}
        </div>
        <div className="data-lineage-transactions__fields">
          No. changed fields [{transaction.changeCount}]
          <Checkbox
            checked={checkedTransactions.some(t => t.transactionId === transaction.transactionId)}
            disabled={checkedTransactions.length >= 2 && !checkedTransactions.some(t => t.transactionId === transaction.transactionId)}
            onChange={(e) => handleCheckboxChange(transaction, e.target.checked)}
          />
        </div>
      </div>
    )
  }))

  return (
    <div className={`data-lineage-transactions ${className}`}>
      <div className="data-lineage-transactions__header">
        <strong>Current version</strong>
      </div>
      <div className="data-lineage-transactions__body">
        <Timeline items={timelineItems} />
        <Button
          type="primary"
          loading={isLoadingCompare}
          disabled={checkedTransactions.length < 2}
          onClick={handleCompare}
        >
          Compare
        </Button>
        {checkedTransactions.length >= 2 && compareData && (
          <DataLineageCompare
            ref={dataLineageCompareRef}
            checkedTransactions={sortedCheckedTransactions}
            compareData={compareData}
          />
        )}
      </div>
    </div>
  )
}

