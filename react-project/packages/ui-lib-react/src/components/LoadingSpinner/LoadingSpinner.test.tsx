import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default loading state', () => {
    const { container } = render(<LoadingSpinner />)
    
    const spinner = container.querySelector('.ant-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with loading false', () => {
    const { container } = render(<LoadingSpinner loading={false} />)
    
    const spinner = container.querySelector('.ant-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with tip text', () => {
    render(
      <LoadingSpinner tip="Loading...">
        <div>Content</div>
      </LoadingSpinner>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="small" />)
    
    const spinner = container.querySelector('.ant-spin-sm')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="large" />)
    
    const spinner = container.querySelector('.ant-spin-lg')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with default size', () => {
    const { container } = render(<LoadingSpinner size="default" />)
    
    const spinner = container.querySelector('.ant-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders in fullscreen mode', () => {
    const { container } = render(<LoadingSpinner fullscreen />)
    
    const fullscreenContainer = container.querySelector('.loading-spinner-fullscreen')
    expect(fullscreenContainer).toBeInTheDocument()
  })

  it('does not render fullscreen when fullscreen is false', () => {
    const { container } = render(<LoadingSpinner fullscreen={false} />)
    
    const fullscreenContainer = container.querySelector('.loading-spinner-fullscreen')
    expect(fullscreenContainer).not.toBeInTheDocument()
  })

  it('renders with children', () => {
    render(
      <LoadingSpinner>
        <div>Content</div>
      </LoadingSpinner>
    )
    
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />)
    
    const spinner = container.querySelector('.loading-spinner')
    expect(spinner).toHaveClass('custom-class')
  })

  it('applies custom className in fullscreen mode', () => {
    const { container } = render(<LoadingSpinner fullscreen className="custom-class" />)
    
    const fullscreenContainer = container.querySelector('.loading-spinner-fullscreen')
    expect(fullscreenContainer).toHaveClass('custom-class')
  })

  it('renders with tip and children', () => {
    render(
      <LoadingSpinner tip="Loading data...">
        <div>Data content</div>
      </LoadingSpinner>
    )
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
    expect(screen.getByText('Data content')).toBeInTheDocument()
  })

  it('renders with all props combined', () => {
    render(
      <LoadingSpinner 
        loading={true}
        tip="Please wait..."
        size="large"
        className="custom-spinner"
      >
        <div>Content</div>
      </LoadingSpinner>
    )
    
    expect(screen.getByText('Please wait...')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})

