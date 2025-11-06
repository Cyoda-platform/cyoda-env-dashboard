import React from 'react'
import { Checkbox } from 'antd'
import type { CheckboxProps } from 'antd'
import './CheckboxField.scss'

export interface CheckboxFieldProps extends Omit<CheckboxProps, 'className'> {
  className?: string
}

/**
 * CheckboxField Component
 * A wrapper around Ant Design Checkbox for consistent checkbox styling
 */
export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Checkbox
      className={`checkbox-field ${className}`}
      {...props}
    />
  )
}

