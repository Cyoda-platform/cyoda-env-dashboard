import React from 'react'
import { Button as AntButton } from 'antd'
import type { ButtonProps as AntButtonProps } from 'antd'
import './Button.scss'

// Omit antd's `type`, `children`, and `variant` — we narrow each to our own shape.
// antd v5 added its own `variant` ('outlined' | 'dashed' | …) that conflicts.
export interface ButtonProps extends Omit<AntButtonProps, 'type' | 'children' | 'variant'> {
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

