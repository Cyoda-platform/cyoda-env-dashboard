import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InputField } from './InputField'

describe('InputField', () => {
  it('renders without crashing', () => {
    const { container } = render(<InputField />)
    
    expect(container.querySelector('.ant-input')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<InputField placeholder="Enter text" />)
    
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders with value', () => {
    render(<InputField value="Test value" onChange={() => {}} />)
    
    expect(screen.getByDisplayValue('Test value')).toBeInTheDocument()
  })

  it('calls onChange when value changes', () => {
    const onChange = vi.fn()
    render(<InputField onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new value' } })
    
    expect(onChange).toHaveBeenCalled()
  })

  it('renders as disabled', () => {
    render(<InputField disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('renders with prefix', () => {
    render(<InputField prefix={<span>$</span>} />)
    
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('renders with suffix', () => {
    render(<InputField suffix={<span>@</span>} />)
    
    expect(screen.getByText('@')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<InputField className="custom-class" />)
    
    const input = container.querySelector('.input-field')
    expect(input).toHaveClass('custom-class')
  })

  it('renders with maxLength', () => {
    render(<InputField maxLength={10} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('maxlength', '10')
  })

  it('renders with type password', () => {
    const { container } = render(<InputField type="password" />)

    const input = container.querySelector('input[type="password"]')
    expect(input).toBeInTheDocument()
  })
})

