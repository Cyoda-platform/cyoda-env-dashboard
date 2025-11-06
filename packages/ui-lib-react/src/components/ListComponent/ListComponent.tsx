import React from 'react'
import { List } from 'antd'
import type { ListProps } from 'antd'
import './ListComponent.scss'

export interface ListComponentProps<T = any> extends Omit<ListProps<T>, 'className'> {
  className?: string
}

/**
 * ListComponent
 * A wrapper around Ant Design List for consistent list styling
 */
export function ListComponent<T = any>({
  className = '',
  ...props
}: ListComponentProps<T>) {
  return (
    <List<T>
      className={`list-component ${className}`}
      {...props}
    />
  )
}

