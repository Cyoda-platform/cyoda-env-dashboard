import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders with default status', () => {
    const { container } = render(<StatusBadge />)
    
    const badge = container.querySelector('.status-badge')
    expect(badge).toBeInTheDocument()
  })

  it('renders with success status and text', () => {
    render(<StatusBadge status="success" text="Success" />)
    
    expect(screen.getByText('Success')).toBeInTheDocument()
  })

  it('renders with error status and text', () => {
    render(<StatusBadge status="error" text="Error" />)
    
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('renders with warning status and text', () => {
    render(<StatusBadge status="warning" text="Warning" />)
    
    expect(screen.getByText('Warning')).toBeInTheDocument()
  })

  it('renders with info status and text', () => {
    render(<StatusBadge status="info" text="Info" />)
    
    expect(screen.getByText('Info')).toBeInTheDocument()
  })

  it('renders with processing status and text', () => {
    render(<StatusBadge status="processing" text="Processing" />)
    
    expect(screen.getByText('Processing')).toBeInTheDocument()
  })

  it('renders with count', () => {
    render(
      <StatusBadge count={5}>
        <div>Content</div>
      </StatusBadge>
    )
    
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders with count zero when showZero is true', () => {
    render(
      <StatusBadge count={0} showZero>
        <div>Content</div>
      </StatusBadge>
    )
    
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('does not render count zero when showZero is false', () => {
    render(
      <StatusBadge count={0} showZero={false}>
        <div>Content</div>
      </StatusBadge>
    )
    
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('renders as dot badge', () => {
    const { container } = render(
      <StatusBadge dot>
        <div>Content</div>
      </StatusBadge>
    )
    
    const dot = container.querySelector('.ant-badge-dot')
    expect(dot).toBeInTheDocument()
  })

  it('renders with children', () => {
    render(
      <StatusBadge status="success">
        <div>Child Content</div>
      </StatusBadge>
    )
    
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<StatusBadge className="custom-class" />)
    
    const badge = container.querySelector('.status-badge')
    expect(badge).toHaveClass('custom-class')
  })

  it('renders with large count', () => {
    const { container } = render(
      <StatusBadge count={99}>
        <div>Content</div>
      </StatusBadge>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
    const badge = container.querySelector('.ant-badge-count')
    expect(badge).toBeInTheDocument()
    expect(badge?.getAttribute('title')).toBe('99')
  })

  it('renders with text and custom className', () => {
    const { container } = render(
      <StatusBadge status="success" text="Active" className="custom-badge" />
    )
    
    expect(screen.getByText('Active')).toBeInTheDocument()
    const badge = container.querySelector('.status-badge')
    expect(badge).toHaveClass('custom-badge')
  })
})

