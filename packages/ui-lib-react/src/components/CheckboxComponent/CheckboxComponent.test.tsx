import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CheckboxComponent } from './CheckboxComponent'

describe('CheckboxComponent', () => {
  it('renders without crashing', () => {
    const { container } = render(<CheckboxComponent>Checkbox</CheckboxComponent>)
    
    expect(container.querySelector('.ant-checkbox-wrapper')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<CheckboxComponent>Test Label</CheckboxComponent>)
    
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<CheckboxComponent className="custom-class">Label</CheckboxComponent>)
    
    const checkbox = container.querySelector('.checkbox-component')
    expect(checkbox).toHaveClass('custom-class')
  })

  it('renders in checked state', () => {
    const { container } = render(<CheckboxComponent checked>Label</CheckboxComponent>)
    
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(input?.checked).toBe(true)
  })

  it('renders in unchecked state', () => {
    const { container } = render(<CheckboxComponent checked={false}>Label</CheckboxComponent>)
    
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(input?.checked).toBe(false)
  })

  it('calls onChange when clicked', () => {
    const onChange = vi.fn()
    render(<CheckboxComponent onChange={onChange}>Label</CheckboxComponent>)
    
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    
    expect(onChange).toHaveBeenCalled()
  })

  it('renders in disabled state', () => {
    const { container } = render(<CheckboxComponent disabled>Label</CheckboxComponent>)
    
    const input = container.querySelector('input[type="checkbox"]')
    expect(input).toBeDisabled()
  })

  it('renders in indeterminate state', () => {
    const { container } = render(<CheckboxComponent indeterminate>Label</CheckboxComponent>)
    
    expect(container.querySelector('.ant-checkbox-indeterminate')).toBeInTheDocument()
  })

  it('renders without label', () => {
    const { container } = render(<CheckboxComponent />)
    
    expect(container.querySelector('.ant-checkbox')).toBeInTheDocument()
  })

  it('does not call onChange when disabled and clicked', () => {
    const onChange = vi.fn()
    render(<CheckboxComponent disabled onChange={onChange}>Label</CheckboxComponent>)
    
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    
    expect(onChange).not.toHaveBeenCalled()
  })
})

