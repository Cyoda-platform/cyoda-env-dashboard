import React from 'react'
import { Tag } from 'antd'
import './TagLabel.scss'

export interface TagLabelProps {
  children: React.ReactNode
  color?: string
  closable?: boolean
  onClose?: () => void
  icon?: React.ReactNode
  bordered?: boolean
  className?: string
}

/**
 * TagLabel Component
 * A wrapper around Ant Design Tag for consistent tag styling
 */
export const TagLabel: React.FC<TagLabelProps> = ({
  children,
  color,
  closable = false,
  onClose,
  icon,
  bordered = true,
  className = ''
}) => {
  return (
    <Tag
      color={color}
      closable={closable}
      onClose={onClose}
      icon={icon}
      bordered={bordered}
      className={`tag-label ${className}`}
    >
      {children}
    </Tag>
  )
}

