import React, { useEffect, useState } from 'react'
import './ChatMessageEmpty.scss'

export interface ChatMessageEmptyProps {
  className?: string
}

/**
 * ChatMessageEmpty Component
 * Displays animated loading dots for chat messages
 */
export const ChatMessageEmpty: React.FC<ChatMessageEmptyProps> = ({
  className = ''
}) => {
  const [dots, setDots] = useState('')
  const [num, setNum] = useState(0)

  useEffect(() => {
    const timerId = setInterval(() => {
      setNum(prevNum => {
        const nextNum = prevNum + 1
        const newNum = nextNum > 3 ? 0 : nextNum
        setDots('. '.repeat(newNum) || '\u00A0')
        return newNum
      })
    }, 500)

    return () => {
      clearInterval(timerId)
    }
  }, [])

  return (
    <div 
      className={`dots ${className}`}
      dangerouslySetInnerHTML={{ __html: dots }}
    />
  )
}

