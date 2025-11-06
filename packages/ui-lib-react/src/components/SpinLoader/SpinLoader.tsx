import React from 'react'
import { Spin } from 'antd'
import './SpinLoader.scss'

export interface SpinLoaderProps {
  spinning?: boolean
  size?: 'small' | 'default' | 'large'
  tip?: string
  delay?: number
  children?: React.ReactNode
  className?: string
}

/**
 * SpinLoader Component
 * A wrapper around Ant Design Spin for consistent loading spinner styling
 */
export const SpinLoader: React.FC<SpinLoaderProps> = ({
  spinning = true,
  size = 'default',
  tip,
  delay,
  children,
  className = ''
}) => {
  return (
    <Spin
      spinning={spinning}
      size={size}
      tip={tip}
      delay={delay}
      className={`spin-loader ${className}`}
    >
      {children}
    </Spin>
  )
}

