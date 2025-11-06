import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'antd'
import './ChatMessageText.scss'

export interface ChatMessageTextProps {
  message?: {
    text?: string
    ready?: boolean
  }
  onReady?: () => void
  renderMarkdown?: (text: string) => string
  className?: string
}

/**
 * ChatMessageText Component
 * Displays text messages with markdown support and code block copy functionality
 */
export const ChatMessageText: React.FC<ChatMessageTextProps> = ({
  message = {},
  onReady,
  renderMarkdown,
  className = ''
}) => {
  const [isReady, setIsReady] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const text = message.text || ''

  useEffect(() => {
    // Simulate ready state
    const timer = setTimeout(() => {
      setIsReady(true)
      if (message.ready !== undefined) {
        message.ready = true
      }
      onReady?.()
    }, 100)

    return () => clearTimeout(timer)
  }, [text, onReady])

  useEffect(() => {
    if (isReady && text) {
      // Render markdown if function provided, otherwise use plain text
      const content = renderMarkdown ? renderMarkdown(text) : text
      setHtmlContent(content)
    }
  }, [isReady, text, renderMarkdown])

  useEffect(() => {
    if (htmlContent && rootRef.current) {
      // Add copy buttons to code blocks
      const codeBlocks = rootRef.current.querySelectorAll('pre code')
      codeBlocks.forEach((block) => {
        const pre = block.parentElement
        if (pre && !pre.querySelector('.copy-button')) {
          const button = document.createElement('button')
          button.textContent = 'copy'
          button.className = 'copy-button'
          
          button.addEventListener('click', () => {
            navigator.clipboard.writeText(block.textContent || '').then(() => {
              button.textContent = 'copied!'
              setTimeout(() => {
                button.textContent = 'copy'
              }, 2000)
            })
          })
          
          pre.style.position = 'relative'
          pre.prepend(button)
        }
      })
    }
  }, [htmlContent])

  return (
    <div className={`chat-message-text ${className}`} ref={rootRef}>
      <div 
        className="chat-message-text__message"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  )
}

