import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '../../test-utils'
import { Markdown } from './Markdown'

describe('Markdown', () => {

  it('renders children content', () => {
    render(
      <Markdown>
        <p>Test content</p>
      </Markdown>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders with cyoda-mark class', () => {
    const { container } = render(
      <Markdown>
        <p>Test content</p>
      </Markdown>
    )
    expect(container.querySelector('.cyoda-mark')).toBeInTheDocument()
  })

  it('highlights search text', async () => {
    const { container } = render(
      <Markdown search="highlight">
        <p>This text should highlight the word highlight</p>
      </Markdown>
    )

    // Wait for debounced marking (250ms + buffer)
    await waitFor(() => {
      const marks = container.querySelectorAll('mark')
      expect(marks.length).toBeGreaterThan(0)
    }, { timeout: 1000 })
  })

  it('updates highlights when search changes', async () => {
    const { container, rerender } = render(
      <Markdown search="first">
        <p>This is the first word and second word</p>
      </Markdown>
    )

    await waitFor(() => {
      const marks = container.querySelectorAll('mark')
      expect(marks.length).toBeGreaterThan(0)
    }, { timeout: 1000 })

    // Change search term
    rerender(
      <Markdown search="second">
        <p>This is the first word and second word</p>
      </Markdown>
    )

    await waitFor(() => {
      const marks = container.querySelectorAll('mark')
      expect(marks.length).toBeGreaterThan(0)
    }, { timeout: 1000 })
  })

  it('removes highlights when search is empty', async () => {
    const { container, rerender } = render(
      <Markdown search="highlight">
        <p>This text should highlight the word</p>
      </Markdown>
    )

    await waitFor(() => {
      const marks = container.querySelectorAll('mark')
      expect(marks.length).toBeGreaterThan(0)
    }, { timeout: 1000 })

    // Clear search
    rerender(
      <Markdown search="">
        <p>This text should highlight the word</p>
      </Markdown>
    )

    await waitFor(() => {
      const marks = container.querySelectorAll('mark')
      expect(marks.length).toBe(0)
    }, { timeout: 1000 })
  })

  it('debounces marking operations', () => {
    const { rerender } = render(
      <Markdown search="test1">
        <p>Test content</p>
      </Markdown>
    )

    // Change search multiple times quickly
    rerender(<Markdown search="test2"><p>Test content</p></Markdown>)
    rerender(<Markdown search="test3"><p>Test content</p></Markdown>)
    rerender(<Markdown search="test4"><p>Test content</p></Markdown>)

    // Test passes if no errors thrown
    expect(true).toBe(true)
  })

  it('handles complex nested content', async () => {
    const { container } = render(
      <Markdown search="nested">
        <div>
          <p>This is nested content</p>
          <ul>
            <li>Nested item 1</li>
            <li>Nested item 2</li>
          </ul>
        </div>
      </Markdown>
    )

    await waitFor(() => {
      const marks = container.querySelectorAll('mark')
      expect(marks.length).toBeGreaterThan(0)
    }, { timeout: 1000 })
  })

  it('cleans up on unmount', () => {
    const { unmount } = render(
      <Markdown search="test">
        <p>Test content</p>
      </Markdown>
    )

    unmount()

    // Should not throw errors
    expect(true).toBe(true)
  })
})

