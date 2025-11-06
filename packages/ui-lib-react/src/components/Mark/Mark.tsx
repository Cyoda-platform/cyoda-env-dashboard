import React, { useRef, useEffect } from 'react'
import MarkJS from 'mark.js'
import './Mark.scss'

export interface MarkProps {
  search?: string
  children: React.ReactNode
  className?: string
}

/**
 * Mark Component
 * Highlights text matching the search query using mark.js
 */
export const Mark: React.FC<MarkProps> = ({
  search = '',
  children,
  className = ''
}) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<MarkJS | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (rootRef.current) {
      instanceRef.current = new MarkJS(rootRef.current)
    }

    return () => {
      instanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const worker = () => {
      if (!instanceRef.current) return

      instanceRef.current.unmark()

      if (!search) return

      instanceRef.current.mark(search)
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce the marking operation
    timeoutRef.current = setTimeout(worker, 250)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [search])

  return (
    <div ref={rootRef} className={`cyoda-mark ${className}`}>
      {children}
    </div>
  )
}

