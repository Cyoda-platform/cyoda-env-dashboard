import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RadioField } from './RadioField'

describe('RadioField', () => {
  it('renders without crashing', () => {
    const { container } = render(<RadioField />)
    
    expect(container.querySelector('.ant-radio-wrapper')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<RadioField>Option 1</RadioField>)
    
    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('renders unchecked by default', () => {
    const { container } = render(<RadioField />)
    
    const radio = container.querySelector('input[type="radio"]')
    expect(radio).not.toBeChecked()
  })

  it('renders as checked', () => {
    const { container } = render(<RadioField checked onChange={() => {}} />)
    
    const radio = container.querySelector('input[type="radio"]')
    expect(radio).toBeChecked()
  })

  it('calls onChange when clicked', () => {
    const onChange = vi.fn()
    const { container } = render(<RadioField onChange={onChange} />)
    
    const radio = container.querySelector('input[type="radio"]')
    if (radio) {
      fireEvent.click(radio)
    }
    
    expect(onChange).toHaveBeenCalled()
  })

  it('renders as disabled', () => {
    const { container } = render(<RadioField disabled />)
    
    const radio = container.querySelector('input[type="radio"]')
    expect(radio).toBeDisabled()
  })

  it('applies custom className', () => {
    const { container } = render(<RadioField className="custom-class" />)
    
    const wrapper = container.querySelector('.radio-field')
    expect(wrapper).toHaveClass('custom-class')
  })

  it('renders with value', () => {
    const { container } = render(<RadioField value="test-value" />)
    
    const radio = container.querySelector('input[type="radio"]')
    expect(radio).toHaveAttribute('value', 'test-value')
  })

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn()
    const { container } = render(<RadioField disabled onChange={onChange} />)
    
    const radio = container.querySelector('input[type="radio"]')
    if (radio) {
      fireEvent.click(radio)
    }
    
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders with children content', () => {
    render(<RadioField>Radio Label</RadioField>)
    
    expect(screen.getByText('Radio Label')).toBeInTheDocument()
  })
})

