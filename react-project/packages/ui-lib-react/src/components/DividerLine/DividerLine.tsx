import React from 'react'
import { Divider } from 'antd'
import './DividerLine.scss'

export interface DividerLineProps {
  orientation?: 'left' | 'right' | 'center'
  orientationMargin?: string | number
  dashed?: boolean
  plain?: boolean
  type?: 'horizontal' | 'vertical'
  children?: React.ReactNode
  className?: string
}

/**
 * DividerLine Component
 * A wrapper around Ant Design Divider for consistent divider styling
 */
export const DividerLine: React.FC<DividerLineProps> = ({
  orientation = 'center',
  orientationMargin,
  dashed = false,
  plain = false,
  type = 'horizontal',
  children,
  className = ''
}) => {
  return (
    <Divider
      orientation={orientation}
      orientationMargin={orientationMargin}
      dashed={dashed}
      plain={plain}
      type={type}
      className={`divider-line ${className}`}
    >
      {children}
    </Divider>
  )
}

