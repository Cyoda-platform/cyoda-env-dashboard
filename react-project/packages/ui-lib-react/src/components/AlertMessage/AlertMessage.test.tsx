import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AlertMessage } from './AlertMessage'

describe('AlertMessage', () => {
  it('renders with message', () => {
    render(<AlertMessage message="Test message" />)
    
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(<AlertMessage message="Title" description="Description text" />)
    
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })

  it('renders with success type', () => {
    const { container } = render(<AlertMessage message="Success" type="success" />)
    
    const alert = container.querySelector('.ant-alert-success')
    expect(alert).toBeInTheDocument()
  })

  it('renders with info type by default', () => {
    const { container } = render(<AlertMessage message="Info" />)
    
    const alert = container.querySelector('.ant-alert-info')
    expect(alert).toBeInTheDocument()
  })

  it('renders with warning type', () => {
    const { container } = render(<AlertMessage message="Warning" type="warning" />)
    
    const alert = container.querySelector('.ant-alert-warning')
    expect(alert).toBeInTheDocument()
  })

  it('renders with error type', () => {
    const { container } = render(<AlertMessage message="Error" type="error" />)
    
    const alert = container.querySelector('.ant-alert-error')
    expect(alert).toBeInTheDocument()
  })

  it('shows icon by default', () => {
    const { container } = render(<AlertMessage message="With icon" />)

    const icon = container.querySelector('.anticon')
    expect(icon).toBeInTheDocument()
  })

  it('hides icon when showIcon is false', () => {
    const { container } = render(<AlertMessage message="No icon" showIcon={false} />)
    
    const alert = container.querySelector('.ant-alert-with-description')
    expect(alert).not.toBeInTheDocument()
  })

  it('renders as closable', () => {
    const { container } = render(<AlertMessage message="Closable" closable />)
    
    const closeButton = container.querySelector('.ant-alert-close-icon')
    expect(closeButton).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(
      <AlertMessage message="Closable" closable onClose={onClose} />
    )
    
    const closeButton = container.querySelector('.ant-alert-close-icon')
    if (closeButton) {
      fireEvent.click(closeButton)
      expect(onClose).toHaveBeenCalledTimes(1)
    }
  })

  it('renders as banner', () => {
    const { container } = render(<AlertMessage message="Banner" banner />)
    
    const banner = container.querySelector('.ant-alert-banner')
    expect(banner).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<AlertMessage message="Custom" className="custom-class" />)
    
    const alert = container.querySelector('.alert-message')
    expect(alert).toHaveClass('custom-class')
  })

  it('renders with all props combined', () => {
    const onClose = vi.fn()
    render(
      <AlertMessage
        message="Complete Alert"
        description="Full description"
        type="success"
        showIcon={true}
        closable={true}
        onClose={onClose}
        banner={false}
        className="test-alert"
      />
    )
    
    expect(screen.getByText('Complete Alert')).toBeInTheDocument()
    expect(screen.getByText('Full description')).toBeInTheDocument()
  })

  it('renders with long message', () => {
    const longMessage = 'This is a very long alert message that should still render correctly'
    render(<AlertMessage message={longMessage} />)
    
    expect(screen.getByText(longMessage)).toBeInTheDocument()
  })

  it('renders with long description', () => {
    const longDescription = 'This is a very long description that provides additional context'
    render(<AlertMessage message="Title" description={longDescription} />)
    
    expect(screen.getByText(longDescription)).toBeInTheDocument()
  })
})

