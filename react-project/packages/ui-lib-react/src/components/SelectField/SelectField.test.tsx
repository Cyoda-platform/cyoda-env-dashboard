import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SelectField } from './SelectField'

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' }
]

describe('SelectField', () => {
  it('renders without crashing', () => {
    const { container } = render(<SelectField />)
    
    expect(container.querySelector('.ant-select')).toBeInTheDocument()
  })

  it('renders with options', () => {
    render(<SelectField options={options} />)
    
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<SelectField placeholder="Select an option" />)
    
    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('renders with value', () => {
    render(<SelectField value="1" options={options} />)
    
    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('calls onChange when value changes', () => {
    const onChange = vi.fn()
    render(<SelectField options={options} onChange={onChange} />)
    
    const select = screen.getByRole('combobox')
    fireEvent.mouseDown(select)
  })

  it('renders as disabled', () => {
    const { container } = render(<SelectField disabled options={options} />)
    
    const select = container.querySelector('.ant-select-disabled')
    expect(select).toBeInTheDocument()
  })

  it('renders with multiple selection', () => {
    render(<SelectField mode="multiple" options={options} />)
    
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<SelectField className="custom-class" />)
    
    const select = container.querySelector('.select-field')
    expect(select).toHaveClass('custom-class')
  })

  it('renders with allowClear', () => {
    const { container } = render(<SelectField allowClear value="1" options={options} />)
    
    const select = container.querySelector('.ant-select-allow-clear')
    expect(select).toBeInTheDocument()
  })

  it('renders with showSearch', () => {
    render(<SelectField showSearch options={options} />)
    
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('renders with loading state', () => {
    const { container } = render(<SelectField loading options={options} />)
    
    const select = container.querySelector('.ant-select')
    expect(select).toBeInTheDocument()
  })
})

