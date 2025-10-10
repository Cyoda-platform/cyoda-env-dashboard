import React from 'react'
import { Button } from 'antd'
import type { ButtonProps } from 'antd'
import './ButtonComponent.scss'

export interface ButtonComponentProps extends Omit<ButtonProps, 'className'> {
  className?: string
}

/**
 * ButtonComponent
 * A wrapper around Ant Design Button for consistent button styling
 */
export const ButtonComponent: React.FC<ButtonComponentProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Button
      className={`button-component ${className}`}
      {...props}
    />
  )
}

