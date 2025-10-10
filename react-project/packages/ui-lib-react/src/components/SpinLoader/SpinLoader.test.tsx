import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SpinLoader } from './SpinLoader'

describe('SpinLoader', () => {
  it('renders without crashing', () => {
    const { container } = render(<SpinLoader />)
    
    expect(container.querySelector('.ant-spin')).toBeInTheDocument()
  })

  it('renders in spinning state by default', () => {
    const { container } = render(<SpinLoader />)
    
    const spin = container.querySelector('.ant-spin-spinning')
    expect(spin).toBeInTheDocument()
  })

  it('renders without spinning when spinning is false', () => {
    const { container } = render(<SpinLoader spinning={false}><div>Content</div></SpinLoader>)
    
    const spin = container.querySelector('.ant-spin-spinning')
    expect(spin).not.toBeInTheDocument()
  })

  it('renders with children', () => {
    render(<SpinLoader><div>Loading Content</div></SpinLoader>)
    
    expect(screen.getByText('Loading Content')).toBeInTheDocument()
  })

  it('renders with tip text', () => {
    render(<SpinLoader tip="Loading..."><div>Content</div></SpinLoader>)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders with small size', () => {
    const { container } = render(<SpinLoader size="small" />)
    
    const spin = container.querySelector('.ant-spin-sm')
    expect(spin).toBeInTheDocument()
  })

  it('renders with large size', () => {
    const { container } = render(<SpinLoader size="large" />)
    
    const spin = container.querySelector('.ant-spin-lg')
    expect(spin).toBeInTheDocument()
  })

  it('renders with default size', () => {
    const { container } = render(<SpinLoader size="default" />)
    
    const spin = container.querySelector('.ant-spin')
    expect(spin).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<SpinLoader className="custom-class" />)
    
    const spin = container.querySelector('.spin-loader')
    expect(spin).toHaveClass('custom-class')
  })

  it('renders without children', () => {
    const { container } = render(<SpinLoader />)
    
    expect(container.querySelector('.ant-spin')).toBeInTheDocument()
  })

  it('renders with all props combined', () => {
    render(
      <SpinLoader
        spinning={true}
        size="large"
        tip="Please wait..."
        className="test-spin"
      >
        <div>Content</div>
      </SpinLoader>
    )
    
    expect(screen.getByText('Please wait...')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('hides spinner when spinning is false with children', () => {
    render(
      <SpinLoader spinning={false}>
        <div>Visible Content</div>
      </SpinLoader>
    )
    
    expect(screen.getByText('Visible Content')).toBeInTheDocument()
  })
})

