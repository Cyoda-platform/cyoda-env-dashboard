import React, { useState, useEffect } from 'react'
import { Row, Col } from 'antd'
import { DataLineageFilter } from '../DataLineageFilter'
import { DataLineageTransactions, Transaction } from '../DataLineageTransactions'
import dayjs from 'dayjs'
import './DataLineage.scss'

export interface DataLineageFilter {
  dateFrom: string
  dateTo: string
}

export interface DataLineageProps {
  requestClass?: string
  id?: string
  onLoadTransactions?: (requestClass: string, id: string) => Promise<Transaction[]>
  className?: string
}

/**
 * DataLineage Component
 * Main data lineage view with filter and transactions
 */
export const DataLineage: React.FC<DataLineageProps> = ({
  requestClass = '',
  id = '',
  onLoadTransactions,
  className = ''
}) => {
  const [transactionsData, setTransactionsData] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<DataLineageFilter>({
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    const loadData = async () => {
      if (onLoadTransactions && requestClass && id) {
        const data = await onLoadTransactions(requestClass, id)
        // Sort by date descending
        const sorted = [...data].sort((a, b) => {
          const dateA = dayjs(a.dateTime, 'DD-MM-YYYY HH:mm:ss.SSS')
          const dateB = dayjs(b.dateTime, 'DD-MM-YYYY HH:mm:ss.SSS')
          return dateB.unix() - dateA.unix()
        })
        setTransactionsData(sorted)
      }
    }
    loadData()
  }, [requestClass, id, onLoadTransactions])

  const filteredTransactions = transactionsData.filter((transaction) => {
    const transactionDate = dayjs(transaction.dateTime, 'DD-MM-YYYY HH:mm:ss.SSS')
    
    if (filter.dateFrom) {
      const dateFrom = dayjs(filter.dateFrom)
      if (transactionDate.isBefore(dateFrom)) {
        return false
      }
    }
    
    if (filter.dateTo) {
      const dateTo = dayjs(filter.dateTo)
      if (transactionDate.isAfter(dateTo)) {
        return false
      }
    }
    
    return true
  })

  return (
    <div className={`data-lineage ${className}`}>
      <Row gutter={20}>
        <Col span={6}>
          <DataLineageFilter
            filter={filter}
            onFilterChange={setFilter}
          />
        </Col>
        <Col span={18}>
          <DataLineageTransactions
            requestClass={requestClass}
            id={id}
            transactionsData={filteredTransactions}
          />
        </Col>
      </Row>
    </div>
  )
}

