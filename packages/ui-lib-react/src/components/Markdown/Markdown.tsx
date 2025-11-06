import React, { useRef, useEffect } from 'react'
import Mark from 'mark.js'
import './Markdown.scss'

export interface MarkdownProps {
  search?: string
  children?: React.ReactNode
}

/**
 * Markdown Component
 * Highlights search text within content using mark.js
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/CyodaMark/CyodaMark.vue
 */
export const Markdown: React.FC<MarkdownProps> = ({
  search = '',
  children
}) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const markInstanceRef = useRef<Mark | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (rootRef.current) {
      markInstanceRef.current = new Mark(rootRef.current)
    }

    return () => {
      markInstanceRef.current = null
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const worker = () => {
      if (!markInstanceRef.current) return

      // Unmark previous highlights
      markInstanceRef.current.unmark()

      // Mark new search term if provided
      if (search) {
        markInstanceRef.current.mark(search)
      }
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
    <div ref={rootRef} className="cyoda-mark">
      {children}
    </div>
  )
}

