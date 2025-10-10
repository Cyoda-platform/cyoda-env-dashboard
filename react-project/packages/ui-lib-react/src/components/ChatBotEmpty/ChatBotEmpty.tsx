import React from 'react'
import { RobotOutlined } from '@ant-design/icons'
import './ChatBotEmpty.scss'

export interface ChatBotEmptyProps {
  message?: string
  className?: string
}

/**
 * ChatBotEmpty Component
 * Empty state for AI ChatBot showing a robot icon and welcome message
 */
export const ChatBotEmpty: React.FC<ChatBotEmptyProps> = ({
  message = 'How can I help you today?',
  className = ''
}) => {
  return (
    <div className={`ai-chat-bot-empty ${className}`}>
      <RobotOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
      <span className="message">{message}</span>
    </div>
  )
}

