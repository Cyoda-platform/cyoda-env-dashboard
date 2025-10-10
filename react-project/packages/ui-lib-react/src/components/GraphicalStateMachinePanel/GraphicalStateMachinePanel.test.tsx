import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphicalStateMachinePanel } from './GraphicalStateMachinePanel'

describe('GraphicalStateMachinePanel', () => {
  it('renders all toggle buttons', () => {
    render(<GraphicalStateMachinePanel />)
    
    expect(screen.getByText('List of transitions')).toBeInTheDocument()
    expect(screen.getByText('processes')).toBeInTheDocument()
    expect(screen.getByText('criteria')).toBeInTheDocument()
    expect(screen.getByText('states')).toBeInTheDocument()
    expect(screen.getByText('transitions titles')).toBeInTheDocument()
    expect(screen.getByText('Reset positions')).toBeInTheDocument()
  })

  it('shows eye icon when element is visible', () => {
    const { container } = render(
      <GraphicalStateMachinePanel
        showProcesses={true}
        showListOfTransitions={true}
        showCriteria={true}
        showTitles={true}
      />
    )
    
    const eyeIcons = container.querySelectorAll('.anticon-eye')
    expect(eyeIcons.length).toBeGreaterThan(0)
  })

  it('shows eye-invisible icon when element is hidden', () => {
    const { container } = render(
      <GraphicalStateMachinePanel
        showProcesses={false}
        showListOfTransitions={false}
        showCriteria={false}
        showTitles={false}
        showEdgesTitles={false}
      />
    )
    
    const eyeInvisibleIcons = container.querySelectorAll('.anticon-eye-invisible')
    expect(eyeInvisibleIcons.length).toBeGreaterThan(0)
  })

  it('calls onToggleListOfTransitions when button is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    
    render(<GraphicalStateMachinePanel onToggleListOfTransitions={onToggle} />)
    
    const button = screen.getByText('List of transitions')
    await user.click(button)
    
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('calls onToggleProcesses when button is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    
    render(<GraphicalStateMachinePanel onToggleProcesses={onToggle} />)
    
    const button = screen.getByText('processes')
    await user.click(button)
    
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('calls onToggleCriteria when button is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    
    render(<GraphicalStateMachinePanel onToggleCriteria={onToggle} />)
    
    const button = screen.getByText('criteria')
    await user.click(button)
    
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('calls onToggleTitles when button is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    
    render(<GraphicalStateMachinePanel onToggleTitles={onToggle} />)
    
    const button = screen.getByText('states')
    await user.click(button)
    
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('calls onToggleEdgesTitles when button is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    
    render(<GraphicalStateMachinePanel onToggleEdgesTitles={onToggle} />)
    
    const button = screen.getByText('transitions titles')
    await user.click(button)
    
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('calls onResetPositions when button is clicked', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    
    render(<GraphicalStateMachinePanel onResetPositions={onReset} />)
    
    const button = screen.getByText('Reset positions')
    await user.click(button)
    
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    const { container } = render(
      <GraphicalStateMachinePanel className="custom-class" />
    )
    
    const element = container.querySelector('.graphical-state-machine-panel')
    expect(element).toHaveClass('custom-class')
  })
})

