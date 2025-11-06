import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DataLineageTransactions } from './DataLineageTransactions'

// Mock DataLineageCompare
vi.mock('../DataLineageCompare', () => ({
  DataLineageCompare: vi.fn(() => <div data-testid="compare-dialog">Compare Dialog</div>)
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

describe('DataLineageTransactions', () => {
  it('renders without crashing', () => {
    const { container } = render(<DataLineageTransactions />)
    
    expect(container.querySelector('.data-lineage-transactions')).toBeInTheDocument()
  })

  it('renders header with "Current version"', () => {
    render(<DataLineageTransactions />)
    
    expect(screen.getByText('Current version')).toBeInTheDocument()
  })

  it('renders transactions in timeline', () => {
    render(<DataLineageTransactions transactionsData={mockTransactions} />)
    
    expect(screen.getByText(/01\/01\/2024/)).toBeInTheDocument()
    expect(screen.getByText(/02\/01\/2024/)).toBeInTheDocument()
    expect(screen.getByText(/03\/01\/2024/)).toBeInTheDocument()
  })

  it('renders change count for each transaction', () => {
    render(<DataLineageTransactions transactionsData={mockTransactions} />)
    
    expect(screen.getByText(/No\. changed fields \[5\]/)).toBeInTheDocument()
    expect(screen.getByText(/No\. changed fields \[3\]/)).toBeInTheDocument()
    expect(screen.getByText(/No\. changed fields \[7\]/)).toBeInTheDocument()
  })

  it('renders checkboxes for transactions', () => {
    const { container } = render(<DataLineageTransactions transactionsData={mockTransactions} />)
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]')
    expect(checkboxes.length).toBe(3)
  })

  it('renders Compare button', () => {
    render(<DataLineageTransactions transactionsData={mockTransactions} />)
    
    expect(screen.getByText('Compare')).toBeInTheDocument()
  })

  it('Compare button is disabled when less than 2 transactions are selected', () => {
    render(<DataLineageTransactions transactionsData={mockTransactions} />)

    const button = screen.getByRole('button', { name: 'Compare' })
    expect(button).toBeDisabled()
  })

  it('allows selecting up to 2 transactions', () => {
    const { container } = render(<DataLineageTransactions transactionsData={mockTransactions} />)
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]')
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])
    
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).toBeChecked()
  })

  it('disables other checkboxes when 2 are selected', () => {
    const { container } = render(<DataLineageTransactions transactionsData={mockTransactions} />)
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]')
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])
    
    expect(checkboxes[2]).toBeDisabled()
  })

  it('enables Compare button when 2 transactions are selected', () => {
    const { container } = render(<DataLineageTransactions transactionsData={mockTransactions} />)
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]')
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])
    
    const button = screen.getByText('Compare')
    expect(button).not.toBeDisabled()
  })

  it('calls onCompare when Compare button is clicked', async () => {
    const onCompare = vi.fn().mockResolvedValue({ data: 'compare result' })
    const { container } = render(
      <DataLineageTransactions 
        transactionsData={mockTransactions}
        onCompare={onCompare}
      />
    )
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]')
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])
    
    const button = screen.getByText('Compare')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(onCompare).toHaveBeenCalledTimes(1)
    })
  })

  it('applies custom className', () => {
    const { container } = render(<DataLineageTransactions className="custom-class" />)
    
    const component = container.querySelector('.data-lineage-transactions')
    expect(component).toHaveClass('custom-class')
  })

  it('renders with empty transactions array', () => {
    render(<DataLineageTransactions transactionsData={[]} />)
    
    expect(screen.getByText('Current version')).toBeInTheDocument()
  })

  it('allows unchecking selected transactions', () => {
    const { container } = render(<DataLineageTransactions transactionsData={mockTransactions} />)
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]')
    fireEvent.click(checkboxes[0])
    expect(checkboxes[0]).toBeChecked()
    
    fireEvent.click(checkboxes[0])
    expect(checkboxes[0]).not.toBeChecked()
  })
})

