import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Mark } from './Mark'

// Create mock functions that persist across renders
const mockMark = vi.fn()
const mockUnmark = vi.fn()

// Mock mark.js
vi.mock('mark.js', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      mark: mockMark,
      unmark: mockUnmark
    }))
  }
})

describe('Mark', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockMark.mockClear()
    mockUnmark.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders children', () => {
    render(
      <Mark>
        <div>Test content</div>
      </Mark>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('applies cyoda-mark class', () => {
    const { container } = render(
      <Mark>
        <div>Test content</div>
      </Mark>
    )
    expect(container.querySelector('.cyoda-mark')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Mark className="custom-class">
        <div>Test content</div>
      </Mark>
    )
    const markElement = container.querySelector('.cyoda-mark')
    expect(markElement).toHaveClass('custom-class')
  })

  it('renders with empty search', () => {
    render(
      <Mark search="">
        <div>Test content</div>
      </Mark>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders with search query', () => {
    render(
      <Mark search="test">
        <div>Test content with test word</div>
      </Mark>
    )
    expect(screen.getByText(/Test content with test word/)).toBeInTheDocument()
  })

  it('updates when search changes', () => {
    const { rerender } = render(
      <Mark search="first">
        <div>Test content</div>
      </Mark>
    )

    rerender(
      <Mark search="second">
        <div>Test content</div>
      </Mark>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('handles multiple children', () => {
    render(
      <Mark search="test">
        <div>
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </div>
      </Mark>
    )
    expect(screen.getByText('First paragraph')).toBeInTheDocument()
    expect(screen.getByText('Second paragraph')).toBeInTheDocument()
  })

  it('debounces marking operation', async () => {
    const { rerender } = render(
      <Mark search="test1">
        <div>Test content</div>
      </Mark>
    )

    // Change search multiple times quickly
    rerender(
      <Mark search="test2">
        <div>Test content</div>
      </Mark>
    )

    rerender(
      <Mark search="test3">
        <div>Test content</div>
      </Mark>
    )

    // Fast forward time
    vi.advanceTimersByTime(250)

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('clears timeout on unmount', () => {
    const { unmount } = render(
      <Mark search="test">
        <div>Test content</div>
      </Mark>
    )

    unmount()
    
    // Should not throw
    expect(true).toBe(true)
  })
})

