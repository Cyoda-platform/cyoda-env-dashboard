import React from 'react'
import { Input } from 'antd'
import type { TextAreaProps } from 'antd/es/input'
import './TextAreaField.scss'

const { TextArea } = Input

export interface TextAreaFieldProps extends Omit<TextAreaProps, 'className'> {
  className?: string
}

/**
 * TextAreaField Component
 * A wrapper around Ant Design TextArea for consistent textarea styling
 */
export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  className = '',
  ...props
}) => {
  return (
    <TextArea
      className={`textarea-field ${className}`}
      {...props}
    />
  )
}

