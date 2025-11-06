import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StateForm } from './StateForm'

describe('StateForm', () => {
  it('renders without crashing', () => {
    const { container } = render(<StateForm />)
    
    expect(container.querySelector('.state-form')).toBeInTheDocument()
  })

  it('renders form fields', () => {
    render(<StateForm />)
    
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('renders Update State button', () => {
    render(<StateForm />)
    
    expect(screen.getByText('Update State')).toBeInTheDocument()
  })

  it('loads state data on mount', async () => {
    const mockData = {
      name: 'Test State',
      description: 'Test Description'
    }
    const onLoadState = vi.fn().mockResolvedValue(mockData)
    
    render(
      <StateForm
        workflowId="workflow-1"
        stateId="state-1"
        persistedType="test"
        onLoadState={onLoadState}
      />
    )
    
    await waitFor(() => {
      expect(onLoadState).toHaveBeenCalledWith('test', 'workflow-1', 'state-1')
    })
  })

  it('displays loaded state data', async () => {
    const mockData = {
      name: 'Test State',
      description: 'Test Description'
    }
    const onLoadState = vi.fn().mockResolvedValue(mockData)
    
    render(
      <StateForm
        workflowId="workflow-1"
        stateId="state-1"
        persistedType="test"
        onLoadState={onLoadState}
      />
    )
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText('Name') as HTMLInputElement
      expect(nameInput.value).toBe('Test State')
    })
  })

  it('calls onSubmit when Update State button is clicked', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const mockData = {
      name: 'Test State',
      description: 'Test Description'
    }
    const onLoadState = vi.fn().mockResolvedValue(mockData)
    
    render(
      <StateForm
        workflowId="workflow-1"
        stateId="state-1"
        persistedType="test"
        onLoadState={onLoadState}
        onSubmit={onSubmit}
      />
    )
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText('Name') as HTMLInputElement
      expect(nameInput.value).toBe('Test State')
    })
    
    const submitButton = screen.getByText('Update State')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  it('validates required name field', async () => {
    render(<StateForm />)
    
    const submitButton = screen.getByText('Update State')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please input name')).toBeInTheDocument()
    })
  })

  it('calls onSubmitted after successful submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onSubmitted = vi.fn()
    const mockData = {
      name: 'Test State',
      description: 'Test Description'
    }
    const onLoadState = vi.fn().mockResolvedValue(mockData)
    
    render(
      <StateForm
        workflowId="workflow-1"
        stateId="state-1"
        persistedType="test"
        onLoadState={onLoadState}
        onSubmit={onSubmit}
        onSubmitted={onSubmitted}
      />
    )
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText('Name') as HTMLInputElement
      expect(nameInput.value).toBe('Test State')
    })
    
    const submitButton = screen.getByText('Update State')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(onSubmitted).toHaveBeenCalled()
    })
  })

  it('displays page title with state name', async () => {
    const mockData = {
      name: 'My State',
      description: 'Description'
    }
    const onLoadState = vi.fn().mockResolvedValue(mockData)
    
    render(
      <StateForm
        workflowId="workflow-1"
        stateId="state-1"
        persistedType="test"
        onLoadState={onLoadState}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('State My State')).toBeInTheDocument()
    })
  })

  it('calls onStateTitle with state title', async () => {
    const onStateTitle = vi.fn()
    const mockData = {
      name: 'Test State',
      description: 'Description'
    }
    const onLoadState = vi.fn().mockResolvedValue(mockData)
    
    render(
      <StateForm
        workflowId="workflow-1"
        stateId="state-1"
        persistedType="test"
        onLoadState={onLoadState}
        onStateTitle={onStateTitle}
      />
    )
    
    await waitFor(() => {
      expect(onStateTitle).toHaveBeenCalledWith('State Test State')
    })
  })

  it('calls onWorkflowTitle with workflow title', () => {
    const onWorkflowTitle = vi.fn()
    
    render(<StateForm onWorkflowTitle={onWorkflowTitle} />)
    
    expect(onWorkflowTitle).toHaveBeenCalledWith('Workflow')
  })

  it('applies custom className', () => {
    const { container } = render(<StateForm className="custom-class" />)
    
    const component = container.querySelector('.state-form')
    expect(component).toHaveClass('custom-class')
  })

  it('shows loading state on submit', async () => {
    const onSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    const mockData = {
      name: 'Test State',
      description: 'Description'
    }
    const onLoadState = vi.fn().mockResolvedValue(mockData)
    
    render(
      <StateForm
        workflowId="workflow-1"
        stateId="state-1"
        persistedType="test"
        onLoadState={onLoadState}
        onSubmit={onSubmit}
      />
    )
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText('Name') as HTMLInputElement
      expect(nameInput.value).toBe('Test State')
    })
    
    const submitButton = screen.getByText('Update State')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /Update State/i })
      expect(button).toHaveClass('ant-btn-loading')
    })
  })
})

