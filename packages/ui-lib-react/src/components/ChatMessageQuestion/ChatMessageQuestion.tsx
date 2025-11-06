import React from 'react'
import './ChatMessageQuestion.scss'

export interface ChatMessage {
  text?: string
  return_object?: string
}

export interface ChatMessageQuestionProps {
  message: ChatMessage
  className?: string
}

/**
 * ChatMessageQuestion Component
 * Displays a user's question in the chat with return object info
 */
export const ChatMessageQuestion: React.FC<ChatMessageQuestionProps> = ({
  message,
  className = ''
}) => {
  return (
    <div className={`ai-chat-bot-messages-question ${className}`}>
      <div className="message">
        {message.text || "You didn't ask a question"}
      </div>
      {message.return_object && (
        <div className="return-object">
          <small>Return object: {message.return_object}</small>
        </div>
      )}
    </div>
  )
}

