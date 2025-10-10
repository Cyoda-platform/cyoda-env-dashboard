import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModellingToggles } from './ModellingToggles'

describe('ModellingToggles', () => {
  it('renders both toggle labels', () => {
    render(<ModellingToggles />)
    expect(screen.getByText('Condense the paths')).toBeInTheDocument()
    expect(screen.getByText('Open all selected')).toBeInTheDocument()
  })

  it('renders delimiter', () => {
    const { container } = render(<ModellingToggles />)
    expect(container.querySelector('.delimiter')).toBeInTheDocument()
    expect(container.querySelector('.delimiter')?.textContent).toBe('|')
  })

  it('renders with default values (both false)', () => {
    const { container } = render(<ModellingToggles />)
    const switches = container.querySelectorAll('.ant-switch')
    expect(switches).toHaveLength(2)
    switches.forEach(switchEl => {
      expect(switchEl).not.toHaveClass('ant-switch-checked')
    })
  })

  it('renders with custom values', () => {
    const value = {
      isCondenseThePaths: true,
      isOpenAllSelected: false
    }
    const { container } = render(<ModellingToggles value={value} />)
    const switches = container.querySelectorAll('.ant-switch')
    expect(switches[0]).toHaveClass('ant-switch-checked')
    expect(switches[1]).not.toHaveClass('ant-switch-checked')
  })

  it('calls onChange when condense paths is toggled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    const { container } = render(<ModellingToggles onChange={onChange} />)
    const switches = container.querySelectorAll('.ant-switch')
    
    await user.click(switches[0])
    
    expect(onChange).toHaveBeenCalledWith({
      isCondenseThePaths: true,
      isOpenAllSelected: false
    })
  })

  it('calls onChange when open all selected is toggled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    const { container } = render(<ModellingToggles onChange={onChange} />)
    const switches = container.querySelectorAll('.ant-switch')
    
    await user.click(switches[1])
    
    expect(onChange).toHaveBeenCalledWith({
      isCondenseThePaths: false,
      isOpenAllSelected: true
    })
  })

  it('toggles both switches independently', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    const { container } = render(<ModellingToggles onChange={onChange} />)
    const switches = container.querySelectorAll('.ant-switch')
    
    await user.click(switches[0])
    expect(onChange).toHaveBeenLastCalledWith({
      isCondenseThePaths: true,
      isOpenAllSelected: false
    })
    
    await user.click(switches[1])
    expect(onChange).toHaveBeenLastCalledWith({
      isCondenseThePaths: true,
      isOpenAllSelected: true
    })
  })

  it('applies custom className', () => {
    const { container } = render(
      <ModellingToggles className="custom-class" />
    )
    const element = container.querySelector('.actions-settings-inner')
    expect(element).toHaveClass('custom-class')
  })

  it('updates when value prop changes', () => {
    const { container, rerender } = render(
      <ModellingToggles value={{ isCondenseThePaths: false, isOpenAllSelected: false }} />
    )
    
    rerender(
      <ModellingToggles value={{ isCondenseThePaths: true, isOpenAllSelected: true }} />
    )
    
    const switches = container.querySelectorAll('.ant-switch')
    switches.forEach(switchEl => {
      expect(switchEl).toHaveClass('ant-switch-checked')
    })
  })
})

