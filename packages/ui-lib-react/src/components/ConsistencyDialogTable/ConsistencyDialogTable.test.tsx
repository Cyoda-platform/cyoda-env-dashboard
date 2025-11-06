import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConsistencyDialogTable } from './ConsistencyDialogTable'

const mockRows = [
  { field1: 'value1', field2: 'value2' },
  { field1: 'value3', field2: 'value4' },
  { field1: 'value5', field2: 'value6' }
]

describe('ConsistencyDialogTable', () => {
  it('renders without crashing', () => {
    const { container } = render(<ConsistencyDialogTable />)
    
    expect(container.querySelector('.consistency-dialog-table')).toBeInTheDocument()
  })

  it('renders with title', () => {
    render(<ConsistencyDialogTable title="Test Title" />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('does not render title when not provided', () => {
    const { container } = render(<ConsistencyDialogTable rows={mockRows} />)
    
    const title = container.querySelector('.consistency-dialog-table__title')
    expect(title).not.toBeInTheDocument()
  })

  it('renders with empty title', () => {
    const { container } = render(<ConsistencyDialogTable title="" rows={mockRows} />)
    
    const title = container.querySelector('.consistency-dialog-table__title')
    expect(title).not.toBeInTheDocument()
  })

  it('renders rows', () => {
    const { container } = render(<ConsistencyDialogTable rows={mockRows} />)
    
    const rows = container.querySelectorAll('.consistency-table-row')
    expect(rows.length).toBe(3)
  })

  it('renders dividers between rows', () => {
    const { container } = render(<ConsistencyDialogTable rows={mockRows} />)
    
    const dividers = container.querySelectorAll('.ant-divider')
    expect(dividers.length).toBe(2) // 3 rows = 2 dividers
  })

  it('does not render divider after last row', () => {
    const { container } = render(<ConsistencyDialogTable rows={[mockRows[0]]} />)
    
    const dividers = container.querySelectorAll('.ant-divider')
    expect(dividers.length).toBe(0)
  })

  it('renders with empty rows array', () => {
    const { container } = render(<ConsistencyDialogTable rows={[]} />)
    
    const rows = container.querySelectorAll('.consistency-table-row')
    expect(rows.length).toBe(0)
  })

  it('applies custom className', () => {
    const { container } = render(<ConsistencyDialogTable className="custom-class" />)
    
    const table = container.querySelector('.consistency-dialog-table')
    expect(table).toHaveClass('custom-class')
  })

  it('renders with title and rows', () => {
    render(<ConsistencyDialogTable title="Results" rows={mockRows} />)
    
    expect(screen.getByText('Results')).toBeInTheDocument()
  })

  it('renders single row without divider', () => {
    const { container } = render(
      <ConsistencyDialogTable 
        title="Single Row" 
        rows={[{ field: 'value' }]} 
      />
    )
    
    const dividers = container.querySelectorAll('.ant-divider')
    expect(dividers.length).toBe(0)
  })

  it('renders multiple rows with correct number of dividers', () => {
    const rows = [
      { a: '1' },
      { a: '2' },
      { a: '3' },
      { a: '4' }
    ]
    const { container } = render(<ConsistencyDialogTable rows={rows} />)
    
    const dividers = container.querySelectorAll('.ant-divider')
    expect(dividers.length).toBe(3) // 4 rows = 3 dividers
  })
})

