import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EntityTypeSwitch } from './EntityTypeSwitch'

describe('EntityTypeSwitch', () => {
  it('renders when visible', () => {
    render(<EntityTypeSwitch visible={true} />)
    expect(screen.getByText('Entity Type:')).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    render(<EntityTypeSwitch visible={false} />)
    expect(screen.queryByText('Entity Type:')).not.toBeInTheDocument()
  })

  it('renders with Business as default', () => {
    render(<EntityTypeSwitch />)
    const switchElement = document.querySelector('.ant-switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).not.toHaveClass('ant-switch-checked')
  })

  it('renders as checked when value is PERSISTENCE', () => {
    render(<EntityTypeSwitch value="PERSISTENCE" />)
    const switchElement = document.querySelector('.ant-switch')
    expect(switchElement).toHaveClass('ant-switch-checked')
  })

  it('renders as unchecked when value is BUSINESS', () => {
    render(<EntityTypeSwitch value="BUSINESS" />)
    const switchElement = document.querySelector('.ant-switch')
    expect(switchElement).not.toHaveClass('ant-switch-checked')
  })

  it('calls onChange with PERSISTENCE when switched on', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<EntityTypeSwitch value="BUSINESS" onChange={onChange} />)
    
    const switchElement = document.querySelector('.ant-switch')!
    await user.click(switchElement)
    
    expect(onChange).toHaveBeenCalledWith('PERSISTENCE')
  })

  it('calls onChange with BUSINESS when switched off', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<EntityTypeSwitch value="PERSISTENCE" onChange={onChange} />)
    
    const switchElement = document.querySelector('.ant-switch')!
    await user.click(switchElement)
    
    expect(onChange).toHaveBeenCalledWith('BUSINESS')
  })

  it('displays Technical label when checked', () => {
    render(<EntityTypeSwitch value="PERSISTENCE" />)
    expect(screen.getByText('Technical')).toBeInTheDocument()
  })

  it('displays Business label when unchecked', () => {
    render(<EntityTypeSwitch value="BUSINESS" />)
    expect(screen.getByText('Business')).toBeInTheDocument()
  })

  it('can be disabled', () => {
    render(<EntityTypeSwitch disabled={true} />)
    const switchElement = document.querySelector('.ant-switch')
    expect(switchElement).toHaveClass('ant-switch-disabled')
  })

  it('is visible by default', () => {
    render(<EntityTypeSwitch />)
    expect(screen.getByText('Entity Type:')).toBeInTheDocument()
  })
})

