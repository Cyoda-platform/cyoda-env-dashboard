import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModellingItemClassForm } from './ModellingItemClassForm'

describe('ModellingItemClassForm', () => {
  it('renders without crashing', () => {
    const { container } = render(<ModellingItemClassForm />)
    
    expect(container.querySelector('.modelling-item-class-form')).toBeInTheDocument()
  })

  it('renders input fields based on types', () => {
    const { container } = render(
      <ModellingItemClassForm types={['String', 'Integer']} />
    )
    
    const inputs = container.querySelectorAll('input')
    expect(inputs.length).toBe(2)
  })

  it('renders with placeholder from types', () => {
    render(<ModellingItemClassForm types={['String', 'Integer']} />)
    
    expect(screen.getByPlaceholderText('String')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Integer')).toBeInTheDocument()
  })

  it('renders Apply button when isAvailableSubmit is true', () => {
    render(<ModellingItemClassForm isAvailableSubmit={true} />)
    
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })

  it('does not render Apply button when isAvailableSubmit is false', () => {
    render(<ModellingItemClassForm isAvailableSubmit={false} />)
    
    expect(screen.queryByText('Apply')).not.toBeInTheDocument()
  })

  it('calls onChange when input value changes and isAvailableSubmit is false', () => {
    const onChange = vi.fn()
    const { container } = render(
      <ModellingItemClassForm
        types={['String']}
        isAvailableSubmit={false}
        onChange={onChange}
      />
    )
    
    const input = container.querySelector('input')
    if (input) {
      fireEvent.change(input, { target: { value: 'test' } })
    }
    
    expect(onChange).toHaveBeenCalled()
  })

  it('calls onChange when Apply button is clicked', () => {
    const onChange = vi.fn()
    const { container } = render(
      <ModellingItemClassForm
        types={['String']}
        isAvailableSubmit={true}
        onChange={onChange}
      />
    )
    
    const input = container.querySelector('input')
    if (input) {
      fireEvent.change(input, { target: { value: 'test' } })
    }
    
    const applyButton = screen.getByText('Apply')
    fireEvent.click(applyButton)
    
    expect(onChange).toHaveBeenCalledWith(['test'])
  })

  it('replaces empty values with asterisk on submit', () => {
    const onChange = vi.fn()
    render(
      <ModellingItemClassForm
        types={['String', 'Integer']}
        isAvailableSubmit={true}
        onChange={onChange}
      />
    )

    const applyButton = screen.getByText('Apply')
    fireEvent.click(applyButton)

    // Check that onChange was called with an array containing asterisks
    expect(onChange).toHaveBeenCalled()
    const callArgs = onChange.mock.calls[0][0]
    expect(callArgs).toEqual(['*', '*'])
  })

  it('initializes form with provided values', () => {
    const { container } = render(
      <ModellingItemClassForm
        types={['String', 'Integer']}
        values={['test', '123']}
      />
    )
    
    const inputs = container.querySelectorAll('input')
    expect(inputs[0]).toHaveValue('test')
    expect(inputs[1]).toHaveValue('123')
  })

  it('updates form when values prop changes', () => {
    const { container, rerender } = render(
      <ModellingItemClassForm
        types={['String']}
        values={['initial']}
      />
    )
    
    let input = container.querySelector('input')
    expect(input).toHaveValue('initial')
    
    rerender(
      <ModellingItemClassForm
        types={['String']}
        values={['updated']}
      />
    )
    
    input = container.querySelector('input')
    expect(input).toHaveValue('updated')
  })

  it('applies custom className', () => {
    const { container } = render(
      <ModellingItemClassForm className="custom-class" />
    )
    
    const component = container.querySelector('.modelling-item-class-form')
    expect(component).toHaveClass('custom-class')
  })

  it('handles multiple input fields correctly', () => {
    const onChange = vi.fn()
    const { container } = render(
      <ModellingItemClassForm
        types={['String', 'Integer', 'String']}
        isAvailableSubmit={true}
        onChange={onChange}
      />
    )
    
    const inputs = container.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: 'first' } })
    fireEvent.change(inputs[1], { target: { value: '123' } })
    fireEvent.change(inputs[2], { target: { value: 'third' } })
    
    const applyButton = screen.getByText('Apply')
    fireEvent.click(applyButton)
    
    expect(onChange).toHaveBeenCalledWith(['first', '123', 'third'])
  })

  it('renders with no types', () => {
    const { container } = render(<ModellingItemClassForm types={[]} />)
    
    const inputs = container.querySelectorAll('input')
    expect(inputs.length).toBe(0)
  })
})

