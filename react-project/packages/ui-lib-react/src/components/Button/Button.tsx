import React from 'react'
import { Button as AntButton } from 'antd'
import type { ButtonProps as AntButtonProps } from 'antd'
import './Button.scss'

export interface ButtonProps extends Omit<AntButtonProps, 'type'> {
  variant?: 'primary' | 'secondary' | 'default' | 'text' | 'link'
  children: React.ReactNode
}

/**
 * Cyoda Button Component
 * Wrapper around Ant Design Button with custom styling
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  children,
  className,
  ...props
}) => {
  const buttonType = variant === 'secondary' ? 'default' : variant

  return (
    <AntButton
      type={buttonType as AntButtonProps['type']}
      className={`cyoda-button ${className || ''}`}
      {...props}
    >
      {children}
    </AntButton>
  )
}

