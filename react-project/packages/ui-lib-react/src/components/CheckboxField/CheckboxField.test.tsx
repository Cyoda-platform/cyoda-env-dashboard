import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CheckboxField } from './CheckboxField'

describe('CheckboxField', () => {
  it('renders without crashing', () => {
    const { container } = render(<CheckboxField />)
    
    expect(container.querySelector('.ant-checkbox-wrapper')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<CheckboxField>Accept terms</CheckboxField>)
    
    expect(screen.getByText('Accept terms')).toBeInTheDocument()
  })

  it('renders unchecked by default', () => {
    const { container } = render(<CheckboxField />)
    
    const checkbox = container.querySelector('input[type="checkbox"]')
    expect(checkbox).not.toBeChecked()
  })

  it('renders as checked', () => {
    const { container } = render(<CheckboxField checked onChange={() => {}} />)
    
    const checkbox = container.querySelector('input[type="checkbox"]')
    expect(checkbox).toBeChecked()
  })

  it('calls onChange when clicked', () => {
    const onChange = vi.fn()
    const { container } = render(<CheckboxField onChange={onChange} />)
    
    const checkbox = container.querySelector('input[type="checkbox"]')
    if (checkbox) {
      fireEvent.click(checkbox)
    }
    
    expect(onChange).toHaveBeenCalled()
  })

  it('renders as disabled', () => {
    const { container } = render(<CheckboxField disabled />)
    
    const checkbox = container.querySelector('input[type="checkbox"]')
    expect(checkbox).toBeDisabled()
  })

  it('renders with indeterminate state', () => {
    const { container } = render(<CheckboxField indeterminate />)
    
    const checkbox = container.querySelector('.ant-checkbox-indeterminate')
    expect(checkbox).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<CheckboxField className="custom-class" />)
    
    const wrapper = container.querySelector('.checkbox-field')
    expect(wrapper).toHaveClass('custom-class')
  })

  it('toggles checked state', () => {
    const { container } = render(<CheckboxField />)
    
    const checkbox = container.querySelector('input[type="checkbox"]')
    if (checkbox) {
      expect(checkbox).not.toBeChecked()
      
      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    }
  })

  it('renders with value', () => {
    const { container } = render(<CheckboxField value="test-value" />)
    
    const checkbox = container.querySelector('input[type="checkbox"]')
    expect(checkbox).toHaveAttribute('value', 'test-value')
  })

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn()
    const { container } = render(<CheckboxField disabled onChange={onChange} />)
    
    const checkbox = container.querySelector('input[type="checkbox"]')
    if (checkbox) {
      fireEvent.click(checkbox)
    }
    
    expect(onChange).not.toHaveBeenCalled()
  })
})

