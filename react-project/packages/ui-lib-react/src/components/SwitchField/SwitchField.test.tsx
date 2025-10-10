import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { SwitchField } from './SwitchField'

describe('SwitchField', () => {
  it('renders without crashing', () => {
    const { container } = render(<SwitchField />)
    
    expect(container.querySelector('.ant-switch')).toBeInTheDocument()
  })

  it('renders unchecked by default', () => {
    const { container } = render(<SwitchField />)
    
    const switchEl = container.querySelector('.ant-switch')
    expect(switchEl).not.toHaveClass('ant-switch-checked')
  })

  it('renders as checked', () => {
    const { container } = render(<SwitchField checked onChange={() => {}} />)
    
    const switchEl = container.querySelector('.ant-switch')
    expect(switchEl).toHaveClass('ant-switch-checked')
  })

  it('calls onChange when clicked', () => {
    const onChange = vi.fn()
    const { container } = render(<SwitchField onChange={onChange} />)
    
    const switchEl = container.querySelector('.ant-switch')
    if (switchEl) {
      fireEvent.click(switchEl)
    }
    
    expect(onChange).toHaveBeenCalled()
  })

  it('renders as disabled', () => {
    const { container } = render(<SwitchField disabled />)
    
    const switchEl = container.querySelector('.ant-switch')
    expect(switchEl).toHaveClass('ant-switch-disabled')
  })

  it('applies custom className', () => {
    const { container } = render(<SwitchField className="custom-class" />)
    
    const switchEl = container.querySelector('.switch-field')
    expect(switchEl).toHaveClass('custom-class')
  })

  it('toggles checked state', () => {
    const { container } = render(<SwitchField />)
    
    const switchEl = container.querySelector('.ant-switch')
    if (switchEl) {
      expect(switchEl).not.toHaveClass('ant-switch-checked')
      
      fireEvent.click(switchEl)
      expect(switchEl).toHaveClass('ant-switch-checked')
    }
  })

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn()
    const { container } = render(<SwitchField disabled onChange={onChange} />)
    
    const switchEl = container.querySelector('.ant-switch')
    if (switchEl) {
      fireEvent.click(switchEl)
    }
    
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders with loading state', () => {
    const { container } = render(<SwitchField loading />)
    
    const loadingIcon = container.querySelector('.anticon-loading')
    expect(loadingIcon).toBeInTheDocument()
  })

  it('renders with custom size', () => {
    const { container } = render(<SwitchField size="small" />)
    
    const switchEl = container.querySelector('.ant-switch-small')
    expect(switchEl).toBeInTheDocument()
  })

  it('renders with checked children', () => {
    const { container } = render(<SwitchField checkedChildren="ON" />)
    
    const switchEl = container.querySelector('.ant-switch')
    expect(switchEl).toBeInTheDocument()
  })

  it('renders with unchecked children', () => {
    const { container } = render(<SwitchField unCheckedChildren="OFF" />)
    
    const switchEl = container.querySelector('.ant-switch')
    expect(switchEl).toBeInTheDocument()
  })
})

