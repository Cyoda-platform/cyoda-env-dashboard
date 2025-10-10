import React from 'react'
import { Divider } from 'antd'
import './SectionDivider.scss'

export interface SectionDividerProps {
  text?: string
  orientation?: 'left' | 'right' | 'center'
  orientationMargin?: string | number
  dashed?: boolean
  type?: 'horizontal' | 'vertical'
  className?: string
}

/**
 * SectionDivider Component
 * A wrapper around Ant Design Divider for section separation
 */
export const SectionDivider: React.FC<SectionDividerProps> = ({
  text,
  orientation = 'center',
  orientationMargin,
  dashed = false,
  type = 'horizontal',
  className = ''
}) => {
  return (
    <Divider
      orientation={orientation}
      orientationMargin={orientationMargin}
      dashed={dashed}
      type={type}
      className={`section-divider ${className}`}
    >
      {text}
    </Divider>
  )
}

