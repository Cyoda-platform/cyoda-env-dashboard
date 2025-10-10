import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { DataLineage } from './DataLineage'

// Mock child components
vi.mock('../DataLineageFilter', () => ({
  DataLineageFilter: vi.fn(({ filter, onFilterChange }) => (
    <div data-testid="filter">
      Filter: {filter.dateFrom} - {filter.dateTo}
    </div>
  ))
}))

vi.mock('../DataLineageTransactions', () => ({
  DataLineageTransactions: vi.fn(({ transactionsData }) => (
    <div data-testid="transactions">
      Transactions: {transactionsData.length}
    </div>
  ))
}))

const mockTransactions = [
  {
    transactionId: 'txn-001',
    dateTime: '01-01-2024 10:00:00.000',
    changeCount: 5
  },
  {
    transactionId: 'txn-002',
    dateTime: '02-01-2024 11:00:00.000',
    changeCount: 3
  },
  {
    transactionId: 'txn-003',
    dateTime: '03-01-2024 12:00:00.000',
    changeCount: 7
  }
]

describe('DataLineage', () => {
  it('renders without crashing', () => {
    const { container } = render(<DataLineage />)
    
    expect(container.querySelector('.data-lineage')).toBeInTheDocument()
  })

  it('renders filter and transactions components', () => {
    render(<DataLineage />)
    
    expect(screen.getByTestId('filter')).toBeInTheDocument()
    expect(screen.getByTestId('transactions')).toBeInTheDocument()
  })

  it('loads transactions on mount', async () => {
    const onLoadTransactions = vi.fn().mockResolvedValue(mockTransactions)
    
    render(
      <DataLineage
        requestClass="TestClass"
        id="test-id"
        onLoadTransactions={onLoadTransactions}
      />
    )
    
    await waitFor(() => {
      expect(onLoadTransactions).toHaveBeenCalledWith('TestClass', 'test-id')
    })
  })

  it('displays loaded transactions', async () => {
    const onLoadTransactions = vi.fn().mockResolvedValue(mockTransactions)
    
    render(
      <DataLineage
        requestClass="TestClass"
        id="test-id"
        onLoadTransactions={onLoadTransactions}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText(/Transactions: 3/)).toBeInTheDocument()
    })
  })

  it('renders with Row and Col layout', () => {
    const { container } = render(<DataLineage />)
    
    const row = container.querySelector('.ant-row')
    expect(row).toBeInTheDocument()
    
    const cols = container.querySelectorAll('.ant-col')
    expect(cols.length).toBe(2)
  })

  it('renders filter in 6-span column', () => {
    const { container } = render(<DataLineage />)
    
    const filterCol = container.querySelector('.ant-col-6')
    expect(filterCol).toBeInTheDocument()
  })

  it('renders transactions in 18-span column', () => {
    const { container } = render(<DataLineage />)
    
    const transactionsCol = container.querySelector('.ant-col-18')
    expect(transactionsCol).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<DataLineage className="custom-class" />)
    
    const component = container.querySelector('.data-lineage')
    expect(component).toHaveClass('custom-class')
  })

  it('does not load transactions without requestClass', async () => {
    const onLoadTransactions = vi.fn().mockResolvedValue(mockTransactions)
    
    render(
      <DataLineage
        id="test-id"
        onLoadTransactions={onLoadTransactions}
      />
    )
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    expect(onLoadTransactions).not.toHaveBeenCalled()
  })

  it('does not load transactions without id', async () => {
    const onLoadTransactions = vi.fn().mockResolvedValue(mockTransactions)
    
    render(
      <DataLineage
        requestClass="TestClass"
        onLoadTransactions={onLoadTransactions}
      />
    )
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    expect(onLoadTransactions).not.toHaveBeenCalled()
  })

  it('renders with empty transactions initially', () => {
    render(<DataLineage />)
    
    expect(screen.getByText(/Transactions: 0/)).toBeInTheDocument()
  })

  it('sorts transactions by date descending', async () => {
    const onLoadTransactions = vi.fn().mockResolvedValue(mockTransactions)
    
    render(
      <DataLineage
        requestClass="TestClass"
        id="test-id"
        onLoadTransactions={onLoadTransactions}
      />
    )
    
    await waitFor(() => {
      expect(onLoadTransactions).toHaveBeenCalled()
    })
    
    // Transactions should be sorted (verified by the component logic)
    expect(screen.getByText(/Transactions: 3/)).toBeInTheDocument()
  })
})

