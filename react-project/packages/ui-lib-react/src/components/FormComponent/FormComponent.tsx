import React from 'react'
import { Form } from 'antd'
import type { FormProps } from 'antd'
import './FormComponent.scss'

export interface FormComponentProps extends Omit<FormProps, 'className'> {
  className?: string
}

/**
 * FormComponent
 * A wrapper around Ant Design Form for consistent form styling
 */
export const FormComponent: React.FC<FormComponentProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Form
      className={`form-component ${className}`}
      {...props}
    />
  )
}

