import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModellingPopupToggles } from './ModellingPopupToggles'

describe('ModellingPopupToggles', () => {
  it('renders without crashing', () => {
    const { container } = render(<ModellingPopupToggles />)
    
    expect(container.querySelector('.modelling-popup-toggles')).toBeInTheDocument()
  })

  it('renders both toggle labels', () => {
    render(<ModellingPopupToggles />)
    
    expect(screen.getByText('Condense the paths')).toBeInTheDocument()
    expect(screen.getByText('Open all selected')).toBeInTheDocument()
  })

  it('renders delimiter between toggles', () => {
    const { container } = render(<ModellingPopupToggles />)
    
    const delimiter = container.querySelector('.modelling-popup-toggles__delimiter')
    expect(delimiter).toBeInTheDocument()
    expect(delimiter?.textContent).toBe('|')
  })

  it('renders both switches', () => {
    const { container } = render(<ModellingPopupToggles />)
    
    const switches = container.querySelectorAll('.ant-switch')
    expect(switches.length).toBe(2)
  })

  it('both switches are off by default', () => {
    const { container } = render(<ModellingPopupToggles />)
    
    const switches = container.querySelectorAll('.ant-switch')
    switches.forEach(switchEl => {
      expect(switchEl).not.toHaveClass('ant-switch-checked')
    })
  })

  it('calls onChange with initial form values', () => {
    const onChange = vi.fn()
    render(<ModellingPopupToggles onChange={onChange} />)
    
    expect(onChange).toHaveBeenCalledWith({
      isOpenAllSelected: false,
      isCondenseThePaths: false
    })
  })

  it('calls onChange when condense paths switch is toggled', () => {
    const onChange = vi.fn()
    const { container } = render(<ModellingPopupToggles onChange={onChange} />)
    
    const switches = container.querySelectorAll('.ant-switch')
    fireEvent.click(switches[0])
    
    expect(onChange).toHaveBeenCalledWith({
      isOpenAllSelected: false,
      isCondenseThePaths: true
    })
  })

  it('calls onChange when open all selected switch is toggled', () => {
    const onChange = vi.fn()
    const { container } = render(<ModellingPopupToggles onChange={onChange} />)
    
    const switches = container.querySelectorAll('.ant-switch')
    fireEvent.click(switches[1])
    
    expect(onChange).toHaveBeenCalledWith({
      isOpenAllSelected: true,
      isCondenseThePaths: false
    })
  })

  it('toggles condense paths switch on and off', () => {
    const { container } = render(<ModellingPopupToggles />)
    
    const switches = container.querySelectorAll('.ant-switch')
    const condenseSwitch = switches[0]
    
    fireEvent.click(condenseSwitch)
    expect(condenseSwitch).toHaveClass('ant-switch-checked')
    
    fireEvent.click(condenseSwitch)
    expect(condenseSwitch).not.toHaveClass('ant-switch-checked')
  })

  it('toggles open all selected switch on and off', () => {
    const { container } = render(<ModellingPopupToggles />)
    
    const switches = container.querySelectorAll('.ant-switch')
    const openAllSwitch = switches[1]
    
    fireEvent.click(openAllSwitch)
    expect(openAllSwitch).toHaveClass('ant-switch-checked')
    
    fireEvent.click(openAllSwitch)
    expect(openAllSwitch).not.toHaveClass('ant-switch-checked')
  })

  it('can toggle both switches independently', () => {
    const onChange = vi.fn()
    const { container } = render(<ModellingPopupToggles onChange={onChange} />)
    
    const switches = container.querySelectorAll('.ant-switch')
    
    fireEvent.click(switches[0])
    fireEvent.click(switches[1])
    
    expect(onChange).toHaveBeenLastCalledWith({
      isOpenAllSelected: true,
      isCondenseThePaths: true
    })
  })

  it('applies custom className', () => {
    const { container } = render(<ModellingPopupToggles className="custom-class" />)
    
    const component = container.querySelector('.modelling-popup-toggles')
    expect(component).toHaveClass('custom-class')
  })
})

