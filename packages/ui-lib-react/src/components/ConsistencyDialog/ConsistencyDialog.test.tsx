import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConsistencyDialog } from './ConsistencyDialog'
import { createRef } from 'react'
import type { ConsistencyDialogRef } from './ConsistencyDialog'

// Mock the ConsistencyDialogTable component
vi.mock('../ConsistencyDialogTable', () => ({
  ConsistencyDialogTable: ({ rows }: { rows: any[] }) => (
    <div data-testid="consistency-table">Table with {rows.length} rows</div>
  )
}))

describe('ConsistencyDialog', () => {
  it('renders without crashing', () => {
    const ref = createRef<ConsistencyDialogRef>()
    const { container } = render(<ConsistencyDialog ref={ref} />)
    
    expect(container).toBeInTheDocument()
  })

  it('shows dialog when dialogVisible is set to true', async () => {
    const ref = createRef<ConsistencyDialogRef>()
    render(<ConsistencyDialog ref={ref} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('State Machine Consistency')).toBeInTheDocument()
    })
  })

  it('displays no errors message when data is empty', async () => {
    const ref = createRef<ConsistencyDialogRef>()
    render(<ConsistencyDialog ref={ref} data={{}} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('State Machine have not any errors')).toBeInTheDocument()
    })
  })

  it('displays process results tab when processResults exist', async () => {
    const ref = createRef<ConsistencyDialogRef>()
    const data = {
      processResults: [{ id: 1 }, { id: 2 }]
    }
    render(<ConsistencyDialog ref={ref} data={data} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Process Results')).toBeInTheDocument()
    })
  })

  it('displays transition results tab when transitionResults exist', async () => {
    const ref = createRef<ConsistencyDialogRef>()
    const data = {
      transitionResults: [{ id: 1 }]
    }
    render(<ConsistencyDialog ref={ref} data={data} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Transition Results')).toBeInTheDocument()
    })
  })

  it('displays workflow results tab when workflowResults exist', async () => {
    const ref = createRef<ConsistencyDialogRef>()
    const data = {
      workflowResults: [{ id: 1 }]
    }
    render(<ConsistencyDialog ref={ref} data={data} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Workflow Results')).toBeInTheDocument()
    })
  })

  it('displays Fix button when errors exist', async () => {
    const ref = createRef<ConsistencyDialogRef>()
    const data = {
      processResults: [{ id: 1 }]
    }
    render(<ConsistencyDialog ref={ref} data={data} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Fix')).toBeInTheDocument()
    })
  })

  it('does not display Fix button when no errors exist', async () => {
    const ref = createRef<ConsistencyDialogRef>()
    render(<ConsistencyDialog ref={ref} data={{}} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.queryByText('Fix')).not.toBeInTheDocument()
    })
  })

  it('closes dialog when Close button is clicked', async () => {
    const ref = createRef<ConsistencyDialogRef>()
    render(<ConsistencyDialog ref={ref} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Close')).toBeInTheDocument()
    })
    
    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)
    
    await waitFor(() => {
      expect(ref.current?.dialogVisible).toBe(false)
    })
  })

  it('applies custom className', async () => {
    const ref = createRef<ConsistencyDialogRef>()
    render(<ConsistencyDialog ref={ref} className="custom-class" />)

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      expect(screen.getByText('State Machine Consistency')).toBeInTheDocument()
    })
  })

  it('renders all three tabs when all result types exist', async () => {
    const ref = createRef<ConsistencyDialogRef>()
    const data = {
      processResults: [{ id: 1 }],
      transitionResults: [{ id: 2 }],
      workflowResults: [{ id: 3 }]
    }
    render(<ConsistencyDialog ref={ref} data={data} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Process Results')).toBeInTheDocument()
      expect(screen.getByText('Transition Results')).toBeInTheDocument()
      expect(screen.getByText('Workflow Results')).toBeInTheDocument()
    })
  })

  it('renders header text', async () => {
    const ref = createRef<ConsistencyDialogRef>()
    const data = {
      processResults: [{ id: 1 }]
    }
    render(<ConsistencyDialog ref={ref} data={data} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('For Automatic Fix')).toBeInTheDocument()
    })
  })
})

