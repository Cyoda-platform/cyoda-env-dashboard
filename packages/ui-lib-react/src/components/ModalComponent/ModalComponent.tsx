import React from 'react'
import { Modal } from 'antd'
import type { ModalProps } from 'antd'
import './ModalComponent.scss'

export interface ModalComponentProps extends Omit<ModalProps, 'className'> {
  className?: string
}

/**
 * ModalComponent
 * A wrapper around Ant Design Modal for consistent modal styling
 */
export const ModalComponent: React.FC<ModalComponentProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Modal
      className={`modal-component ${className}`}
      {...props}
    />
  )
}

