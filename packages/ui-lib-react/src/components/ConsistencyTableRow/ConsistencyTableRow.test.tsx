import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConsistencyTableRow } from './ConsistencyTableRow'

describe('ConsistencyTableRow', () => {
  it('renders process ID when provided', () => {
    const row = { processId: 'PROC-123' }
    render(<ConsistencyTableRow row={row} />)
    
    expect(screen.getByText('Process ID:')).toBeInTheDocument()
    expect(screen.getByText('PROC-123')).toBeInTheDocument()
  })

  it('renders transition ID when provided', () => {
    const row = { transitionId: 'TRANS-456', transition: 'Transition Name' }
    render(<ConsistencyTableRow row={row} />)
    
    expect(screen.getByText('Transition ID:')).toBeInTheDocument()
    expect(screen.getByText('Transition Name')).toBeInTheDocument()
  })

  it('renders workflow ID when provided', () => {
    const row = { workflowId: 'WF-789' }
    render(<ConsistencyTableRow row={row} />)
    
    expect(screen.getByText('WorkflowId:')).toBeInTheDocument()
    expect(screen.getByText('WF-789')).toBeInTheDocument()
  })

  it('renders unknown criterias list', () => {
    const row = {
      processId: 'PROC-1',
      unknownCriterias: ['criteria1', 'criteria2', 'criteria3']
    }
    render(<ConsistencyTableRow row={row} />)
    
    expect(screen.getByText('Unknown Criterias:')).toBeInTheDocument()
    expect(screen.getByText('criteria1')).toBeInTheDocument()
    expect(screen.getByText('criteria2')).toBeInTheDocument()
    expect(screen.getByText('criteria3')).toBeInTheDocument()
  })

  it('renders unknown params list', () => {
    const row = {
      processId: 'PROC-1',
      unknownParams: ['param1', 'param2']
    }
    render(<ConsistencyTableRow row={row} />)
    
    expect(screen.getByText('Unknown Params:')).toBeInTheDocument()
    expect(screen.getByText('param1')).toBeInTheDocument()
    expect(screen.getByText('param2')).toBeInTheDocument()
  })

  it('renders unknown workflows list', () => {
    const row = {
      processId: 'PROC-1',
      unknownWorkflows: ['workflow1']
    }
    render(<ConsistencyTableRow row={row} />)
    
    expect(screen.getByText('Unknown Workflows:')).toBeInTheDocument()
    expect(screen.getByText('workflow1')).toBeInTheDocument()
  })

  it('renders unknown states list', () => {
    const row = {
      processId: 'PROC-1',
      unknownStates: ['state1', 'state2']
    }
    render(<ConsistencyTableRow row={row} />)
    
    expect(screen.getByText('Unknown States:')).toBeInTheDocument()
    expect(screen.getByText('state1')).toBeInTheDocument()
    expect(screen.getByText('state2')).toBeInTheDocument()
  })

  it('renders unknown process IDs list', () => {
    const row = {
      processId: 'PROC-1',
      unknownProcessIds: ['PROC-X', 'PROC-Y']
    }
    render(<ConsistencyTableRow row={row} />)
    
    expect(screen.getByText('Unknown Process IDs:')).toBeInTheDocument()
    expect(screen.getByText('PROC-X')).toBeInTheDocument()
    expect(screen.getByText('PROC-Y')).toBeInTheDocument()
  })

  it('renders unknown transitions list', () => {
    const row = {
      processId: 'PROC-1',
      unknownTransitions: ['trans1', 'trans2', 'trans3']
    }
    render(<ConsistencyTableRow row={row} />)
    
    expect(screen.getByText('Unknown Transitions:')).toBeInTheDocument()
    expect(screen.getByText('trans1')).toBeInTheDocument()
    expect(screen.getByText('trans2')).toBeInTheDocument()
    expect(screen.getByText('trans3')).toBeInTheDocument()
  })

  it('does not render empty lists', () => {
    const row = {
      processId: 'PROC-1',
      unknownCriterias: [],
      unknownParams: []
    }
    render(<ConsistencyTableRow row={row} />)
    
    expect(screen.queryByText('Unknown Criterias:')).not.toBeInTheDocument()
    expect(screen.queryByText('Unknown Params:')).not.toBeInTheDocument()
  })

  it('renders multiple sections together', () => {
    const row = {
      processId: 'PROC-1',
      unknownCriterias: ['crit1'],
      unknownParams: ['param1'],
      unknownStates: ['state1']
    }
    render(<ConsistencyTableRow row={row} />)
    
    expect(screen.getByText('Unknown Criterias:')).toBeInTheDocument()
    expect(screen.getByText('Unknown Params:')).toBeInTheDocument()
    expect(screen.getByText('Unknown States:')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const row = { processId: 'PROC-1' }
    const { container } = render(
      <ConsistencyTableRow row={row} className="custom-class" />
    )
    
    const element = container.querySelector('.consistency-table-row')
    expect(element).toHaveClass('custom-class')
  })
})

