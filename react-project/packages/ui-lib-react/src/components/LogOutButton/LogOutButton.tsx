import React from 'react'
import { Button, Modal } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

export interface LogOutButtonProps {
  onLogout?: (clearData: boolean) => Promise<void> | void
  buttonText?: string
  confirmTitle?: string
  confirmMessage?: string
  confirmButtonText?: string
  cancelButtonText?: string
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text'
  danger?: boolean
}

/**
 * LogOutButton Component
 * Button with confirmation dialog for logging out
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/LogOutButton/LogOutButton.vue
 */
export const LogOutButton: React.FC<LogOutButtonProps> = ({
  onLogout,
  buttonText = 'Logout',
  confirmTitle = 'Confirm',
  confirmMessage = 'Do you really want to logout?',
  confirmButtonText = 'Logout',
  cancelButtonText = 'Logout and Clear Data',
  type = 'default',
  danger = true
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    Modal.confirm({
      title: confirmTitle,
      content: confirmMessage,
      okText: confirmButtonText,
      cancelText: cancelButtonText,
      onOk: async () => {
        // Logout without clearing data
        await onLogout?.(false)
        navigate('/login')
      },
      onCancel: async () => {
        // Logout and clear data
        await onLogout?.(true)
        navigate('/login')
      },
      okButtonProps: {
        danger: true
      }
    })
  }

  return (
    <Button 
      type={type} 
      danger={danger}
      onClick={handleClick}
      icon={<LogoutOutlined />}
    >
      {buttonText}
    </Button>
  )
}

