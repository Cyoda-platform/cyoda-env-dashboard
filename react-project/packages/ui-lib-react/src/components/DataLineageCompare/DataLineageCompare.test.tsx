import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { DataLineageCompare } from './DataLineageCompare'
import { createRef } from 'react'
import type { DataLineageCompareRef } from './DataLineageCompare'

// Mock CodeEditor to avoid monaco-editor issues in tests
vi.mock('../CodeEditor', () => ({
  CodeEditor: ({ value, originalValue, modifiedValue }: any) => (
    <div data-testid="code-editor">
      <div data-testid="original-value">{originalValue}</div>
      <div data-testid="modified-value">{modifiedValue}</div>
    </div>
  )
}))

const mockTransactions = [
  {
    transactionId: 'txn-001',
    dateTime: '01-01-2024 10:30:00.000'
  },
  {
    transactionId: 'txn-002',
    dateTime: '02-01-2024 14:45:00.000'
  }
]

const mockCompareData = {
  changedFields: [
    {
      columnPath: 'field1',
      columnPathContainer: {
        prevValue: 'old value 1',
        currValue: 'new value 1'
      }
    },
    {
      columnPath: 'field2',
      columnPathContainer: {
        prevValue: 'old value 2',
        currValue: 'new value 2'
      }
    }
  ]
}

describe('DataLineageCompare', () => {
  it('renders without crashing', () => {
    const { container } = render(<DataLineageCompare />)
    expect(container).toBeInTheDocument()
  })

  it('does not show modal by default', () => {
    render(<DataLineageCompare />)
    
    const modal = document.querySelector('.data-lineage-compare')
    expect(modal).not.toBeInTheDocument()
  })

  it('shows modal when dialogVisible is set to true via ref', async () => {
    const ref = createRef<DataLineageCompareRef>()
    render(<DataLineageCompare ref={ref} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Compare')).toBeInTheDocument()
    })
  })

  it('displays transaction information when visible', async () => {
    const ref = createRef<DataLineageCompareRef>()
    render(
      <DataLineageCompare
        ref={ref}
        checkedTransactions={mockTransactions}
      />
    )

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      expect(screen.getByText('Compare')).toBeInTheDocument()
    })

    // Check that transaction IDs are in the document
    await waitFor(() => {
      const content = document.body.textContent || ''
      expect(content).toContain('txn-001')
      expect(content).toContain('txn-002')
    })
  })

  it('formats dates correctly', async () => {
    const ref = createRef<DataLineageCompareRef>()
    render(
      <DataLineageCompare
        ref={ref}
        checkedTransactions={mockTransactions}
      />
    )

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      const content = document.body.textContent || ''
      expect(content).toContain('01/01/2024')
      expect(content).toContain('02/01/2024')
    })
  })

  it('renders with compare data', async () => {
    const ref = createRef<DataLineageCompareRef>()
    render(
      <DataLineageCompare 
        ref={ref}
        compareData={mockCompareData}
        checkedTransactions={mockTransactions}
      />
    )
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Compare')).toBeInTheDocument()
    })
  })

  it('handles empty compare data', async () => {
    const ref = createRef<DataLineageCompareRef>()
    render(
      <DataLineageCompare 
        ref={ref}
        compareData={{}}
        checkedTransactions={mockTransactions}
      />
    )
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Compare')).toBeInTheDocument()
    })
  })

  it('handles empty transactions array', async () => {
    const ref = createRef<DataLineageCompareRef>()
    render(
      <DataLineageCompare 
        ref={ref}
        checkedTransactions={[]}
      />
    )
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Compare')).toBeInTheDocument()
    })
  })

  it('applies custom className', async () => {
    const ref = createRef<DataLineageCompareRef>()
    render(
      <DataLineageCompare 
        ref={ref}
        className="custom-class"
      />
    )
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      const modal = document.querySelector('.data-lineage-compare')
      expect(modal).toHaveClass('custom-class')
    })
  })

  it('exposes dialogVisible state via ref', () => {
    const ref = createRef<DataLineageCompareRef>()
    render(<DataLineageCompare ref={ref} />)
    
    expect(ref.current?.dialogVisible).toBe(false)
  })

  it('exposes setDialogVisible method via ref', () => {
    const ref = createRef<DataLineageCompareRef>()
    render(<DataLineageCompare ref={ref} />)
    
    expect(typeof ref.current?.setDialogVisible).toBe('function')
  })
})

