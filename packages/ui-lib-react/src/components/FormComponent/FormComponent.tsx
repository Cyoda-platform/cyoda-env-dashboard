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
  // antd v5's `Form` export resolves to a narrowly-typed wrapper whose props
  // type is inferred as `{ children?: ReactNode }` at the call site. Cast the
  // component so we can spread the real FormProps.
  const AnyForm = Form as React.FC<FormProps>
  return (
    <AnyForm
      className={`form-component ${className}`}
      {...props}
    />
  )
}

