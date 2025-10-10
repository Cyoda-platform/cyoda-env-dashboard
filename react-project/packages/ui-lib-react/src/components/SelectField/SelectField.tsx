import React from 'react'
import { Select } from 'antd'
import type { SelectProps } from 'antd'
import './SelectField.scss'

export interface SelectFieldProps extends Omit<SelectProps, 'className'> {
  className?: string
}

/**
 * SelectField Component
 * A wrapper around Ant Design Select for consistent select styling
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Select
      className={`select-field ${className}`}
      {...props}
    />
  )
}

