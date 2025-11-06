import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConsistencyTable } from './ConsistencyTable'

describe('ConsistencyTable', () => {
  it('renders title when provided', () => {
    render(<ConsistencyTable title="Test Title" rows={[]} />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('does not render title when not provided', () => {
    const { container } = render(<ConsistencyTable rows={[]} />)
    
    const title = container.querySelector('.title')
    expect(title).not.toBeInTheDocument()
  })

  it('renders empty table when no rows provided', () => {
    const { container } = render(<ConsistencyTable title="Empty Table" />)
    
    expect(screen.getByText('Empty Table')).toBeInTheDocument()
    const rows = container.querySelectorAll('.consistency-table-row')
    expect(rows.length).toBe(0)
  })

  it('renders single row', () => {
    const rows = [
      { processId: 'PROC-1', unknownCriterias: ['crit1'] }
    ]
    render(<ConsistencyTable title="Single Row" rows={rows} />)
    
    expect(screen.getByText('PROC-1')).toBeInTheDocument()
    expect(screen.getByText('crit1')).toBeInTheDocument()
  })

  it('renders multiple rows', () => {
    const rows = [
      { processId: 'PROC-1', unknownCriterias: ['crit1'] },
      { processId: 'PROC-2', unknownParams: ['param1'] },
      { processId: 'PROC-3', unknownStates: ['state1'] }
    ]
    render(<ConsistencyTable title="Multiple Rows" rows={rows} />)
    
    expect(screen.getByText('PROC-1')).toBeInTheDocument()
    expect(screen.getByText('PROC-2')).toBeInTheDocument()
    expect(screen.getByText('PROC-3')).toBeInTheDocument()
  })

  it('renders dividers between rows', () => {
    const rows = [
      { processId: 'PROC-1' },
      { processId: 'PROC-2' },
      { processId: 'PROC-3' }
    ]
    const { container } = render(<ConsistencyTable rows={rows} />)
    
    const dividers = container.querySelectorAll('.ant-divider')
    // Should have 2 dividers for 3 rows
    expect(dividers.length).toBe(2)
  })

  it('does not render divider after last row', () => {
    const rows = [
      { processId: 'PROC-1' }
    ]
    const { container } = render(<ConsistencyTable rows={rows} />)
    
    const dividers = container.querySelectorAll('.ant-divider')
    expect(dividers.length).toBe(0)
  })

  it('renders complex row data', () => {
    const rows = [
      {
        processId: 'PROC-1',
        unknownCriterias: ['crit1', 'crit2'],
        unknownParams: ['param1'],
        unknownStates: ['state1', 'state2', 'state3']
      }
    ]
    render(<ConsistencyTable title="Complex Data" rows={rows} />)
    
    expect(screen.getByText('Unknown Criterias:')).toBeInTheDocument()
    expect(screen.getByText('Unknown Params:')).toBeInTheDocument()
    expect(screen.getByText('Unknown States:')).toBeInTheDocument()
    expect(screen.getByText('crit1')).toBeInTheDocument()
    expect(screen.getByText('param1')).toBeInTheDocument()
    expect(screen.getByText('state1')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ConsistencyTable title="Test" rows={[]} className="custom-class" />
    )
    
    const element = container.querySelector('.consistency-table')
    expect(element).toHaveClass('custom-class')
  })
})

