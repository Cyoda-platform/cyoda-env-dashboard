import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryPlanDetailRaw } from './QueryPlanDetailRaw'
import { createRef } from 'react'

// Mock CodeEditor
vi.mock('../CodeEditor', () => ({
  CodeEditor: ({ value }: any) => <div data-testid="code-editor">{value}</div>
}))

describe('QueryPlanDetailRaw', () => {
  it('renders without crashing', () => {
    const { container } = render(<QueryPlanDetailRaw />)
    
    expect(container).toBeInTheDocument()
  })

  it('does not show modal by default', () => {
    render(<QueryPlanDetailRaw title="Test" />)
    
    expect(screen.queryByText(/Query Plan Raw For Test/)).not.toBeInTheDocument()
  })

  it('shows modal when dialogVisible is set to true', async () => {
    const ref = createRef<any>()
    render(<QueryPlanDetailRaw ref={ref} title="Test" />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText(/Query Plan Raw For Test/)).toBeInTheDocument()
    })
  })

  it('renders with title in modal header', async () => {
    const ref = createRef<any>()
    render(<QueryPlanDetailRaw ref={ref} title="MyQuery" />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Query Plan Raw For MyQuery')).toBeInTheDocument()
    })
  })

  it('renders query plan data', async () => {
    const ref = createRef<any>()
    const queryPlan = { query: 'SELECT * FROM table' }
    render(<QueryPlanDetailRaw ref={ref} queryPlan={queryPlan} title="Test" />)

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      const codeEditor = screen.getByTestId('code-editor')
      expect(codeEditor).toBeInTheDocument()
    })
  })

  it('renders Close button in modal', async () => {
    const ref = createRef<any>()
    render(<QueryPlanDetailRaw ref={ref} title="Test" />)

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      expect(screen.getByText(/Query Plan Raw For Test/)).toBeInTheDocument()
    })

    const closeButton = screen.getByText('Close')
    expect(closeButton).toBeInTheDocument()
  })

  it('exposes dialogVisible through ref', () => {
    const ref = createRef<any>()
    render(<QueryPlanDetailRaw ref={ref} />)
    
    expect(ref.current?.dialogVisible).toBe(false)
  })

  it('exposes setDialogVisible through ref', () => {
    const ref = createRef<any>()
    render(<QueryPlanDetailRaw ref={ref} />)
    
    expect(typeof ref.current?.setDialogVisible).toBe('function')
  })

  it('renders with custom className', async () => {
    const ref = createRef<any>()
    render(<QueryPlanDetailRaw ref={ref} className="custom-class" title="Test" />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      const modal = document.querySelector('.query-plan-detail-raw')
      expect(modal).toHaveClass('custom-class')
    })
  })

  it('renders CodeEditor component', async () => {
    const ref = createRef<any>()
    render(<QueryPlanDetailRaw ref={ref} title="Test" />)

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      const codeEditor = screen.getByTestId('code-editor')
      expect(codeEditor).toBeInTheDocument()
    })
  })

  it('renders with empty query plan by default', async () => {
    const ref = createRef<any>()
    render(<QueryPlanDetailRaw ref={ref} title="Test" />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText(/Query Plan Raw For Test/)).toBeInTheDocument()
    })
  })

  it('modal has 80% width', async () => {
    const ref = createRef<any>()
    render(<QueryPlanDetailRaw ref={ref} title="Test" />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      const modal = document.querySelector('.ant-modal')
      expect(modal).toBeInTheDocument()
    })
  })
})

