import React from 'react'
import { Radio } from 'antd'
import type { RadioProps } from 'antd'
import './RadioField.scss'

export interface RadioFieldProps extends Omit<RadioProps, 'className'> {
  className?: string
}

/**
 * RadioField Component
 * A wrapper around Ant Design Radio for consistent radio styling
 */
export const RadioField: React.FC<RadioFieldProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Radio
      className={`radio-field ${className}`}
      {...props}
    />
  )
}

