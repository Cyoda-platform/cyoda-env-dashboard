import React, { useState, useEffect } from 'react'
import { CodeEditor } from '../CodeEditor'
import './ChatMessageJavascript.scss'

export interface ChatMessageJavascriptProps {
  message?: {
    text?: string
    ready?: boolean
  }
  onReady?: () => void
  className?: string
}

/**
 * ChatMessageJavascript Component
 * Displays JavaScript code in a syntax-highlighted editor
 */
export const ChatMessageJavascript: React.FC<ChatMessageJavascriptProps> = ({
  message = {},
  onReady,
  className = ''
}) => {
  const [isReady, setIsReady] = useState(false)
  const code = message.text || ''

  useEffect(() => {
    // Simulate code being ready after a short delay
    const timer = setTimeout(() => {
      setIsReady(true)
      onReady?.()
    }, 100)

    return () => clearTimeout(timer)
  }, [code, onReady])

  return (
    <div className={`chat-message-javascript ${className}`}>
      <div className="chat-message-javascript__content">
        <CodeEditor
          value={code}
          language="javascript"
          readOnly={true}
          height="auto"
        />
      </div>
    </div>
  )
}

