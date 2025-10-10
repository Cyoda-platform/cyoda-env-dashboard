import React from 'react'
import { DatePicker } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import './DateTimePicker.scss'

export interface DateTimePickerProps {
  /** Current value (ISO 8601 string) */
  value?: string
  /** Callback when value changes */
  onChange?: (value: string) => void
  /** Whether the picker is disabled */
  disabled?: boolean
  /** Whether to include timezone in output (default: true) */
  includeTimeZone?: boolean
  /** Placeholder text */
  placeholder?: string
}

/**
 * DateTimePicker Component
 * DateTime picker with ISO 8601 format support
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/DateTimePicker/DateTimePicker.vue
 */
export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  disabled = false,
  includeTimeZone = true,
  placeholder = 'Select date and time'
}) => {
  const handleChange = (date: Dayjs | null) => {
    if (!onChange) return

    if (!date) {
      onChange('')
      return
    }

    const includeTimeZoneSuffix = includeTimeZone ? 'Z' : ''
    const formattedTime = date.format(`YYYY-MM-DD[T]HH:mm:ss.SSS${includeTimeZoneSuffix}`)
    onChange(formattedTime)
  }

  const dayjsValue = value ? dayjs(value) : null

  return (
    <DatePicker
      showTime
      value={dayjsValue}
      onChange={handleChange}
      disabled={disabled}
      format="DD.MM.YYYY HH:mm:ss"
      placeholder={placeholder}
      className="date-time-picker"
    />
  )
}

