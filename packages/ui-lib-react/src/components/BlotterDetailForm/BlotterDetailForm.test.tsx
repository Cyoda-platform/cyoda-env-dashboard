import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlotterDetailForm } from './BlotterDetailForm'

describe('BlotterDetailForm', () => {
  it('renders form label', () => {
    render(<BlotterDetailForm />)
    
    expect(screen.getByText('Show Empty Fields')).toBeInTheDocument()
  })

  it('renders with default value (unchecked)', () => {
    const { container } = render(<BlotterDetailForm />)
    
    const switchEl = container.querySelector('.ant-switch')
    expect(switchEl).not.toHaveClass('ant-switch-checked')
  })

  it('renders with custom value (checked)', () => {
    const value = { isShowEmpty: true }
    const { container } = render(<BlotterDetailForm value={value} />)
    
    const switchEl = container.querySelector('.ant-switch')
    expect(switchEl).toHaveClass('ant-switch-checked')
  })

  it('calls onChange with initial value on mount', () => {
    const onChange = vi.fn()
    
    render(<BlotterDetailForm onChange={onChange} />)
    
    expect(onChange).toHaveBeenCalledWith({ isShowEmpty: false })
  })

  it('calls onChange when switch is toggled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<BlotterDetailForm onChange={onChange} />)
    
    const switchEl = container.querySelector('.ant-switch')
    if (switchEl) {
      await user.click(switchEl)
      
      expect(onChange).toHaveBeenCalledWith({ isShowEmpty: true })
    }
  })

  it('toggles switch from checked to unchecked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const value = { isShowEmpty: true }
    const { container } = render(<BlotterDetailForm value={value} onChange={onChange} />)
    
    const switchEl = container.querySelector('.ant-switch')
    if (switchEl) {
      await user.click(switchEl)
      
      expect(onChange).toHaveBeenCalledWith({ isShowEmpty: false })
    }
  })

  it('updates when value prop changes', () => {
    const { container, rerender } = render(
      <BlotterDetailForm value={{ isShowEmpty: false }} />
    )
    
    let switchEl = container.querySelector('.ant-switch')
    expect(switchEl).not.toHaveClass('ant-switch-checked')
    
    rerender(<BlotterDetailForm value={{ isShowEmpty: true }} />)
    
    switchEl = container.querySelector('.ant-switch')
    expect(switchEl).toHaveClass('ant-switch-checked')
  })

  it('applies custom className', () => {
    const { container } = render(
      <BlotterDetailForm className="custom-class" />
    )
    
    const form = container.querySelector('.blotter-detail-form')
    expect(form).toHaveClass('custom-class')
  })

  it('maintains state across multiple toggles', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<BlotterDetailForm onChange={onChange} />)
    
    const switchEl = container.querySelector('.ant-switch')
    if (switchEl) {
      // First toggle
      await user.click(switchEl)
      expect(onChange).toHaveBeenLastCalledWith({ isShowEmpty: true })
      
      // Second toggle
      await user.click(switchEl)
      expect(onChange).toHaveBeenLastCalledWith({ isShowEmpty: false })
      
      // Third toggle
      await user.click(switchEl)
      expect(onChange).toHaveBeenLastCalledWith({ isShowEmpty: true })
    }
  })
})

