import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TextAreaField } from './TextAreaField'

describe('TextAreaField', () => {
  it('renders without crashing', () => {
    const { container } = render(<TextAreaField />)
    
    expect(container.querySelector('textarea')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<TextAreaField placeholder="Enter text" />)
    
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders with value', () => {
    render(<TextAreaField value="Test value" onChange={() => {}} />)
    
    const textarea = screen.getByDisplayValue('Test value')
    expect(textarea).toBeInTheDocument()
  })

  it('calls onChange when text is entered', () => {
    const onChange = vi.fn()
    render(<TextAreaField onChange={onChange} />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'New text' } })
    
    expect(onChange).toHaveBeenCalled()
  })

  it('renders as disabled', () => {
    render(<TextAreaField disabled />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('applies custom className', () => {
    const { container } = render(<TextAreaField className="custom-class" />)
    
    const textarea = container.querySelector('.textarea-field')
    expect(textarea).toHaveClass('custom-class')
  })

  it('renders with rows', () => {
    render(<TextAreaField rows={5} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('renders with maxLength', () => {
    render(<TextAreaField maxLength={100} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('maxlength', '100')
  })

  it('renders with autoSize', () => {
    const { container } = render(<TextAreaField autoSize />)
    
    const textarea = container.querySelector('textarea')
    expect(textarea).toBeInTheDocument()
  })

  it('renders with showCount', () => {
    const { container } = render(<TextAreaField showCount maxLength={100} />)
    
    const wrapper = container.querySelector('.ant-input-textarea-show-count')
    expect(wrapper).toBeInTheDocument()
  })

  it('updates value on change', () => {
    render(<TextAreaField />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Updated text' } })
    
    expect(textarea).toHaveValue('Updated text')
  })

  it('textarea is disabled when disabled prop is true', () => {
    render(<TextAreaField disabled />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })
})

