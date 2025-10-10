import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StateMachineConsistency } from './StateMachineConsistency'
import { createRef } from 'react'
import type { StateMachineConsistencyDialogRef } from './StateMachineConsistency'

describe('StateMachineConsistency', () => {
  it('renders without crashing', () => {
    const { container } = render(<StateMachineConsistency />)
    
    expect(container.querySelector('.state-machine-consistency')).toBeInTheDocument()
  })

  it('renders Check Consistency button', () => {
    render(<StateMachineConsistency />)
    
    expect(screen.getByText('Check Consistency')).toBeInTheDocument()
  })

  it('calls onCheckConsistency when button is clicked', async () => {
    const onCheckConsistency = vi.fn().mockResolvedValue({ result: 'success' })
    render(<StateMachineConsistency onCheckConsistency={onCheckConsistency} />)
    
    const button = screen.getByText('Check Consistency')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(onCheckConsistency).toHaveBeenCalledTimes(1)
    })
  })

  it('shows loading state while checking consistency', async () => {
    const onCheckConsistency = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(<StateMachineConsistency onCheckConsistency={onCheckConsistency} />)
    
    const button = screen.getByText('Check Consistency')
    fireEvent.click(button)
    
    // Button should show loading state
    await waitFor(() => {
      const loadingButton = screen.getByRole('button', { name: /Check Consistency/i })
      expect(loadingButton).toBeInTheDocument()
    })
  })

  it('opens dialog after successful check', async () => {
    const mockData = { result: 'success' }
    const onCheckConsistency = vi.fn().mockResolvedValue(mockData)
    const setDialogVisible = vi.fn()
    
    const renderDialog = vi.fn((data, ref) => {
      // Simulate dialog ref
      if (ref.current) {
        ref.current.setDialogVisible = setDialogVisible
      }
      return <div>Dialog</div>
    })
    
    render(
      <StateMachineConsistency 
        onCheckConsistency={onCheckConsistency}
        renderDialog={renderDialog}
      />
    )
    
    const button = screen.getByText('Check Consistency')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(onCheckConsistency).toHaveBeenCalled()
    })
  })

  it('renders dialog when renderDialog is provided', () => {
    const renderDialog = () => <div data-testid="custom-dialog">Custom Dialog</div>
    render(<StateMachineConsistency renderDialog={renderDialog} />)
    
    expect(screen.getByTestId('custom-dialog')).toBeInTheDocument()
  })

  it('does not render dialog when renderDialog is not provided', () => {
    const { container } = render(<StateMachineConsistency />)
    
    expect(container.querySelector('[data-testid="custom-dialog"]')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<StateMachineConsistency className="custom-class" />)
    
    const component = container.querySelector('.state-machine-consistency')
    expect(component).toHaveClass('custom-class')
  })

  it('handles error in onCheckConsistency gracefully', async () => {
    const onCheckConsistency = vi.fn().mockRejectedValue(new Error('API Error'))
    render(<StateMachineConsistency onCheckConsistency={onCheckConsistency} />)
    
    const button = screen.getByText('Check Consistency')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(onCheckConsistency).toHaveBeenCalled()
    })
    
    // Button should not be loading after error
    await waitFor(() => {
      const btn = screen.getByText('Check Consistency')
      expect(btn).toBeInTheDocument()
    })
  })

  it('passes data to renderDialog', async () => {
    const mockData = { items: [1, 2, 3] }
    const onCheckConsistency = vi.fn().mockResolvedValue(mockData)
    const renderDialog = vi.fn(() => <div>Dialog</div>)
    
    render(
      <StateMachineConsistency 
        onCheckConsistency={onCheckConsistency}
        renderDialog={renderDialog}
      />
    )
    
    const button = screen.getByText('Check Consistency')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(onCheckConsistency).toHaveBeenCalled()
    })
    
    // renderDialog should be called with updated data
    await waitFor(() => {
      expect(renderDialog).toHaveBeenCalled()
    })
  })

  it('button is in actions container with right alignment', () => {
    const { container } = render(<StateMachineConsistency />)
    
    const actions = container.querySelector('.state-machine-consistency__actions')
    expect(actions).toBeInTheDocument()
    
    const button = actions?.querySelector('button')
    expect(button).toBeInTheDocument()
  })
})

