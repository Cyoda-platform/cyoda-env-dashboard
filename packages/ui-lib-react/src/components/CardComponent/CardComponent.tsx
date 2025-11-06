import React from 'react'
import { Card } from 'antd'
import type { CardProps } from 'antd'
import './CardComponent.scss'

export interface CardComponentProps extends Omit<CardProps, 'className'> {
  className?: string
}

/**
 * CardComponent
 * A wrapper around Ant Design Card for consistent card styling
 */
export const CardComponent: React.FC<CardComponentProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Card
      className={`card-component ${className}`}
      {...props}
    />
  )
}

