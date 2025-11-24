import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExportImportResult } from './ExportImportResult'

describe('ExportImportResult', () => {
  it('renders without crashing', () => {
    const { container } = render(<ExportImportResult />)
    
    expect(container.querySelector('.export-import-result')).toBeInTheDocument()
  })

  it('renders with string name', () => {
    const instance = { name: 'Test Item' }
    render(<ExportImportResult instance={instance} />)
    
    expect(screen.getByText('Test Item')).toBeInTheDocument()
  })

  it('renders with array of names', () => {
    const instance = { name: ['Item 1', 'Item 2', 'Item 3'] }
    render(<ExportImportResult instance={instance} />)
    
    expect(screen.getByText(/1\) Item 1/)).toBeInTheDocument()
    expect(screen.getByText(/2\) Item 2/)).toBeInTheDocument()
    expect(screen.getByText(/3\) Item 3/)).toBeInTheDocument()
  })

  it('renders success tag when isSuccess is true', () => {
    const instance = { name: 'Test', isSuccess: true }
    render(<ExportImportResult instance={instance} />)
    
    expect(screen.getByText('Success')).toBeInTheDocument()
  })

  it('renders fail tag when isSuccess is false', () => {
    const instance = { name: 'Test', isSuccess: false, errorDesc: 'Error message' }
    render(<ExportImportResult instance={instance} />)
    
    expect(screen.getByText('Fail')).toBeInTheDocument()
  })

  it('renders info button when isSuccess is false', () => {
    const instance = { name: 'Test', isSuccess: false, errorDesc: 'Error message' }
    const { container } = render(<ExportImportResult instance={instance} />)

    const infoButton = container.querySelector('.anticon-info-circle')
    expect(infoButton).toBeInTheDocument()
  })

  it('renders solve problem button when doSolveProblem exists', () => {
    const instance = {
      name: 'Test',
      isSuccess: false,
      errorDesc: 'Error',
      doSolveProblem: vi.fn()
    }
    const { container } = render(<ExportImportResult instance={instance} />)

    const syncButton = container.querySelector('.anticon-sync')
    expect(syncButton).toBeInTheDocument()
  })

  it('does not render solve problem button when doSolveProblem is not provided', () => {
    const instance = { name: 'Test', isSuccess: false, errorDesc: 'Error' }
    const { container } = render(<ExportImportResult instance={instance} />)

    const syncButton = container.querySelector('.anticon-sync')
    expect(syncButton).not.toBeInTheDocument()
  })

  it('calls doImport on mount', () => {
    const doImport = vi.fn()
    const instance = { name: 'Test', doImport }
    render(<ExportImportResult instance={instance} />)
    
    expect(doImport).toHaveBeenCalledTimes(1)
  })

  it('shows spinning icon when isSolveLoading is true', () => {
    const instance = {
      name: 'Test',
      isSuccess: false,
      isSolveLoading: true,
      doSolveProblem: vi.fn()
    }
    const { container } = render(<ExportImportResult instance={instance} />)

    const button = container.querySelector('button[disabled]')
    expect(button).toBeInTheDocument()
  })

  it('opens confirmation modal when solve problem button is clicked', async () => {
    const doSolveProblem = vi.fn()
    const instance = {
      name: 'Test',
      isSuccess: false,
      errorDesc: 'Error',
      doSolveProblem
    }
    const { container } = render(<ExportImportResult instance={instance} />)

    const syncButton = container.querySelector('.anticon-sync')?.closest('button')
    if (syncButton) {
      fireEvent.click(syncButton)

      await waitFor(() => {
        // Multiple "Confirm!" elements may exist (modal title and confirm button)
        expect(screen.getAllByText('Confirm!').length).toBeGreaterThan(0)
      })
    }
  })

  it('applies custom className', () => {
    const { container } = render(<ExportImportResult className="custom-class" />)
    
    const component = container.querySelector('.export-import-result')
    expect(component).toHaveClass('custom-class')
  })

  it('renders without name', () => {
    const instance = { isSuccess: true }
    const { container } = render(<ExportImportResult instance={instance} />)
    
    expect(container.querySelector('.export-import-result')).toBeInTheDocument()
  })

  it('renders result box', () => {
    const instance = { name: 'Test', isSuccess: true }
    const { container } = render(<ExportImportResult instance={instance} />)
    
    const resultBox = container.querySelector('.export-import-result__result-box')
    expect(resultBox).toBeInTheDocument()
  })

  it('renders multiple names with correct numbering', () => {
    const instance = { name: ['First', 'Second'] }
    render(<ExportImportResult instance={instance} />)
    
    expect(screen.getByText(/1\) First/)).toBeInTheDocument()
    expect(screen.getByText(/2\) Second/)).toBeInTheDocument()
  })
})

