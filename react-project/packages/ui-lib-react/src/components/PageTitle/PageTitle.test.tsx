import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageTitle } from './PageTitle'

describe('PageTitle', () => {
  it('renders title', () => {
    render(<PageTitle title="Test Title" />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders with subtitle', () => {
    render(<PageTitle title="Test Title" subtitle="Test Subtitle" />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    const { container } = render(<PageTitle title="Test Title" />)
    
    const subtitle = container.querySelector('.subtitle')
    expect(subtitle).not.toBeInTheDocument()
  })

  it('renders with default h2 heading', () => {
    render(<PageTitle title="Test Title" />)
    
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Test Title')
  })

  it('renders with custom heading level', () => {
    render(<PageTitle title="Test Title" level={1} />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Test Title')
  })

  it('renders with h3 heading', () => {
    render(<PageTitle title="Test Title" level={3} />)
    
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toHaveTextContent('Test Title')
  })

  it('applies custom className', () => {
    const { container } = render(<PageTitle title="Test Title" className="custom-class" />)
    
    const pageTitle = container.querySelector('.page-title')
    expect(pageTitle).toHaveClass('custom-class')
  })

  it('applies title class to heading', () => {
    render(<PageTitle title="Test Title" />)
    
    const heading = screen.getByRole('heading')
    expect(heading).toHaveClass('title')
  })

  it('applies subtitle class to subtitle paragraph', () => {
    const { container } = render(<PageTitle title="Test Title" subtitle="Test Subtitle" />)
    
    const subtitle = container.querySelector('.subtitle')
    expect(subtitle).toBeInTheDocument()
    expect(subtitle?.tagName).toBe('P')
  })

  it('renders with all heading levels', () => {
    const levels: Array<1 | 2 | 3 | 4 | 5 | 6> = [1, 2, 3, 4, 5, 6]
    
    levels.forEach(level => {
      const { unmount } = render(<PageTitle title={`Title ${level}`} level={level} />)
      const heading = screen.getByRole('heading', { level })
      expect(heading).toHaveTextContent(`Title ${level}`)
      unmount()
    })
  })

  it('renders with long title', () => {
    const longTitle = 'This is a very long title that should still render correctly'
    render(<PageTitle title={longTitle} />)
    
    expect(screen.getByText(longTitle)).toBeInTheDocument()
  })

  it('renders with long subtitle', () => {
    const longSubtitle = 'This is a very long subtitle that provides additional context'
    render(<PageTitle title="Title" subtitle={longSubtitle} />)
    
    expect(screen.getByText(longSubtitle)).toBeInTheDocument()
  })
})

