import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JsonFileUpload } from './JsonFileUpload'

describe('JsonFileUpload', () => {
  it('renders upload area', () => {
    render(<JsonFileUpload />)
    
    expect(screen.getByText('Click or drag file to this area to upload')).toBeInTheDocument()
  })

  it('renders upload hint', () => {
    render(<JsonFileUpload />)
    
    expect(screen.getByText('Support for a single JSON file upload only.')).toBeInTheDocument()
  })

  it('renders upload icon', () => {
    const { container } = render(<JsonFileUpload />)
    
    const icon = container.querySelector('.ant-upload-drag-icon')
    expect(icon).toBeInTheDocument()
  })

  it('calls onChange with parsed JSON data when valid file is uploaded', async () => {
    const onChange = vi.fn()
    const jsonData = { test: 'data', value: 123 }
    const file = new File([JSON.stringify(jsonData)], 'test.json', { type: 'application/json' })
    
    render(<JsonFileUpload onChange={onChange} />)
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    if (input) {
      await userEvent.upload(input, file)
      
      // Wait for FileReader to complete
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(onChange).toHaveBeenCalledWith(jsonData)
    }
  })

  it('does not call onChange when invalid JSON is uploaded', async () => {
    const onChange = vi.fn()
    const file = new File(['invalid json content'], 'test.json', { type: 'application/json' })
    
    render(<JsonFileUpload onChange={onChange} />)
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    if (input) {
      await userEvent.upload(input, file)
      
      // Wait for FileReader to complete
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(onChange).not.toHaveBeenCalled()
    }
  })

  it('accepts only JSON files', () => {
    const { container } = render(<JsonFileUpload />)
    
    const input = container.querySelector('input[type="file"]')
    expect(input).toHaveAttribute('accept', 'application/json,.json')
  })

  it('does not allow multiple files', () => {
    const { container } = render(<JsonFileUpload />)
    
    const input = container.querySelector('input[type="file"]')
    expect(input).not.toHaveAttribute('multiple')
  })

  it('applies custom className', () => {
    const { container } = render(
      <JsonFileUpload className="custom-class" />
    )
    
    const component = container.querySelector('.json-file-upload')
    expect(component).toHaveClass('custom-class')
  })

  it('renders dragger component', () => {
    const { container } = render(<JsonFileUpload />)
    
    const dragger = container.querySelector('.ant-upload-drag')
    expect(dragger).toBeInTheDocument()
  })

  it('handles complex JSON objects', async () => {
    const onChange = vi.fn()
    const complexData = {
      nested: {
        array: [1, 2, 3],
        object: { key: 'value' }
      },
      boolean: true,
      null: null
    }
    const file = new File([JSON.stringify(complexData)], 'complex.json', { type: 'application/json' })
    
    render(<JsonFileUpload onChange={onChange} />)
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    if (input) {
      await userEvent.upload(input, file)
      
      // Wait for FileReader to complete
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(onChange).toHaveBeenCalledWith(complexData)
    }
  })
})

