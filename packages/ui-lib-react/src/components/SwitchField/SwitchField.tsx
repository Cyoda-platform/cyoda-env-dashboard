import React from 'react'
import { Switch } from 'antd'
import type { SwitchProps } from 'antd'
import './SwitchField.scss'

export interface SwitchFieldProps extends Omit<SwitchProps, 'className'> {
  className?: string
}

/**
 * SwitchField Component
 * A wrapper around Ant Design Switch for consistent switch styling
 */
export const SwitchField: React.FC<SwitchFieldProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Switch
      className={`switch-field ${className}`}
      {...props}
    />
  )
}

