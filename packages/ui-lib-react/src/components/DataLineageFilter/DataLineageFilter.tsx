import React from 'react'
import { Form, DatePicker } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import './DataLineageFilter.scss'

export interface DataLineageFilterValue {
  dateFrom?: string | null
  dateTo?: string | null
}

export interface DataLineageFilterProps {
  filter: DataLineageFilterValue
  onChange?: (filter: DataLineageFilterValue) => void
  className?: string
}

/**
 * DataLineageFilter Component
 * Filter component for data lineage with date range selection
 */
export const DataLineageFilter: React.FC<DataLineageFilterProps> = ({
  filter,
  onChange,
  className = ''
}) => {
  const handleDateFromChange = (date: Dayjs | null) => {
    onChange?.({
      ...filter,
      dateFrom: date ? date.toISOString() : null
    })
  }

  const handleDateToChange = (date: Dayjs | null) => {
    onChange?.({
      ...filter,
      dateTo: date ? date.toISOString() : null
    })
  }

  const dateFromValue = filter.dateFrom ? dayjs(filter.dateFrom) : null
  const dateToValue = filter.dateTo ? dayjs(filter.dateTo) : null

  return (
    <div className={`data-lineage-filter ${className}`}>
      <h3>Filter</h3>
      <Form layout="vertical">
        <Form.Item label="Start">
          <DatePicker
            showTime
            format="DD.MM.YYYY HH:mm:ss"
            value={dateFromValue}
            onChange={handleDateFromChange}
            placeholder="Start"
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="End">
          <DatePicker
            showTime
            format="DD.MM.YYYY HH:mm:ss"
            value={dateToValue}
            onChange={handleDateToChange}
            placeholder="End"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </div>
  )
}

