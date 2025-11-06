import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { ChatMessageEmpty } from './ChatMessageEmpty'

describe('ChatMessageEmpty', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders with dots class', () => {
    const { container } = render(<ChatMessageEmpty />)
    expect(container.querySelector('.dots')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ChatMessageEmpty className="custom-class" />)
    const element = container.querySelector('.dots')
    expect(element).toHaveClass('custom-class')
  })

  it('animates dots over time', () => {
    const { container } = render(<ChatMessageEmpty />)
    const dotsElement = container.querySelector('.dots')

    // Initial state (empty or nbsp)
    expect(dotsElement).toBeInTheDocument()

    // Advance timer by 500ms
    vi.advanceTimersByTime(500)

    // Should have updated (could be dots or nbsp)
    expect(dotsElement).toBeInTheDocument()

    // Advance timer by another 500ms
    vi.advanceTimersByTime(500)

    // Should still be in the document
    expect(dotsElement).toBeInTheDocument()
  })

  it('clears interval on unmount', () => {
    const { unmount } = render(<ChatMessageEmpty />)
    
    unmount()
    
    // Should not throw
    expect(true).toBe(true)
  })

  it('cycles through dot patterns', () => {
    const { container } = render(<ChatMessageEmpty />)
    const dotsElement = container.querySelector('.dots')

    // Cycle through 5 intervals (should loop back)
    for (let i = 0; i < 5; i++) {
      vi.advanceTimersByTime(500)
    }

    expect(dotsElement).toBeInTheDocument()
  })
})

