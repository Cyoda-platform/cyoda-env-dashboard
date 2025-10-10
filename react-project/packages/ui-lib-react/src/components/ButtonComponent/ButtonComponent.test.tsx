import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ButtonComponent } from './ButtonComponent'

describe('ButtonComponent', () => {
  it('renders without crashing', () => {
    render(<ButtonComponent>Click me</ButtonComponent>)
    
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renders with children', () => {
    render(<ButtonComponent>Test Button</ButtonComponent>)
    
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<ButtonComponent onClick={onClick}>Click</ButtonComponent>)
    
    const button = screen.getByText('Click')
    fireEvent.click(button)
    
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders as primary type', () => {
    const { container } = render(<ButtonComponent type="primary">Primary</ButtonComponent>)
    
    const button = container.querySelector('.ant-btn-primary')
    expect(button).toBeInTheDocument()
  })

  it('renders as disabled', () => {
    render(<ButtonComponent disabled>Disabled</ButtonComponent>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('renders with loading state', () => {
    const { container } = render(<ButtonComponent loading>Loading</ButtonComponent>)
    
    const loadingIcon = container.querySelector('.anticon-loading')
    expect(loadingIcon).toBeInTheDocument()
  })

  it('renders with danger type', () => {
    const { container } = render(<ButtonComponent danger>Danger</ButtonComponent>)
    
    const button = container.querySelector('.ant-btn-dangerous')
    expect(button).toBeInTheDocument()
  })

  it('renders with icon', () => {
    const { container } = render(
      <ButtonComponent icon={<span className="test-icon">Icon</span>}>
        With Icon
      </ButtonComponent>
    )
    
    expect(container.querySelector('.test-icon')).toBeInTheDocument()
  })

  it('renders with different sizes', () => {
    const { container } = render(<ButtonComponent size="large">Large</ButtonComponent>)
    
    const button = container.querySelector('.ant-btn-lg')
    expect(button).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ButtonComponent className="custom-class">Custom</ButtonComponent>)
    
    const button = container.querySelector('.button-component')
    expect(button).toHaveClass('custom-class')
  })

  it('renders as block button', () => {
    const { container } = render(<ButtonComponent block>Block</ButtonComponent>)
    
    const button = container.querySelector('.ant-btn-block')
    expect(button).toBeInTheDocument()
  })

  it('renders with ghost style', () => {
    const { container } = render(<ButtonComponent ghost>Ghost</ButtonComponent>)
    
    const button = container.querySelector('.ant-btn-background-ghost')
    expect(button).toBeInTheDocument()
  })
})

