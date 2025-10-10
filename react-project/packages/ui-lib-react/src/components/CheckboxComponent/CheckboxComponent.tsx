import React from 'react'
import { Checkbox } from 'antd'
import type { CheckboxProps } from 'antd'
import './CheckboxComponent.scss'

export interface CheckboxComponentProps extends Omit<CheckboxProps, 'className'> {
  className?: string
}

/**
 * CheckboxComponent
 * A wrapper around Ant Design Checkbox for consistent checkbox styling
 */
export const CheckboxComponent: React.FC<CheckboxComponentProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Checkbox
      className={`checkbox-component ${className}`}
      {...props}
    />
  )
}

