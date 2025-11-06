import React from 'react'
import { Input } from 'antd'
import type { InputProps } from 'antd'
import './InputField.scss'

export interface InputFieldProps extends Omit<InputProps, 'className'> {
  className?: string
}

/**
 * InputField Component
 * A wrapper around Ant Design Input for consistent input styling
 */
export const InputField: React.FC<InputFieldProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Input
      className={`input-field ${className}`}
      {...props}
    />
  )
}

