import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'
import { Button } from 'antd'

describe('EmptyState', () => {
  it('renders with default message', () => {
    render(<EmptyState />)
    
    expect(screen.getByText('No Data')).toBeInTheDocument()
  })

  it('renders with custom message', () => {
    render(<EmptyState message="No items found" />)
    
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(<EmptyState message="No items" description="Try adding some items" />)
    
    expect(screen.getByText('No items')).toBeInTheDocument()
    expect(screen.getByText('Try adding some items')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState message="No items" />)
    
    const detail = container.querySelector('.empty-detail')
    expect(detail).not.toBeInTheDocument()
  })

  it('renders with children', () => {
    render(
      <EmptyState message="No items">
        <Button type="primary">Add Item</Button>
      </EmptyState>
    )
    
    expect(screen.getByText('Add Item')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<EmptyState className="custom-class" />)
    
    const emptyState = container.querySelector('.empty-state')
    expect(emptyState).toHaveClass('custom-class')
  })

  it('renders with custom image', () => {
    const customImage = <img src="/custom.png" alt="Custom" />
    const { container } = render(<EmptyState image={customImage} />)
    
    const img = container.querySelector('img[alt="Custom"]')
    expect(img).toBeInTheDocument()
  })

  it('renders message in empty-message class', () => {
    const { container } = render(<EmptyState message="Test Message" />)
    
    const message = container.querySelector('.empty-message')
    expect(message).toHaveTextContent('Test Message')
  })

  it('renders description in empty-detail class', () => {
    const { container } = render(<EmptyState description="Test Detail" />)
    
    const detail = container.querySelector('.empty-detail')
    expect(detail).toHaveTextContent('Test Detail')
  })

  it('renders with multiple children', () => {
    render(
      <EmptyState message="No items">
        <Button type="primary">Add Item</Button>
        <Button>Cancel</Button>
      </EmptyState>
    )
    
    expect(screen.getByText('Add Item')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('renders with long message', () => {
    const longMessage = 'This is a very long message that should still render correctly in the empty state'
    render(<EmptyState message={longMessage} />)
    
    expect(screen.getByText(longMessage)).toBeInTheDocument()
  })

  it('renders with long description', () => {
    const longDescription = 'This is a very long description that provides additional context about the empty state'
    render(<EmptyState description={longDescription} />)
    
    expect(screen.getByText(longDescription)).toBeInTheDocument()
  })
})

