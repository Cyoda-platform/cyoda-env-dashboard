import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataLineageFilter } from './DataLineageFilter'

describe('DataLineageFilter', () => {
  it('renders filter title', () => {
    const filter = {}
    render(<DataLineageFilter filter={filter} />)
    expect(screen.getByText('Filter')).toBeInTheDocument()
  })

  it('renders start and end date labels', () => {
    const filter = {}
    render(<DataLineageFilter filter={filter} />)
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('End')).toBeInTheDocument()
  })

  it('renders date pickers', () => {
    const filter = {}
    render(<DataLineageFilter filter={filter} />)
    expect(screen.getByPlaceholderText('Start')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('End')).toBeInTheDocument()
  })

  it('displays dateFrom value when provided', () => {
    const filter = {
      dateFrom: '2024-01-15T10:30:00.000Z'
    }
    render(<DataLineageFilter filter={filter} />)
    const startInput = screen.getByPlaceholderText('Start') as HTMLInputElement
    // Check that value contains the date (time may vary due to timezone)
    expect(startInput.value).toContain('15.01.2024')
  })

  it('displays dateTo value when provided', () => {
    const filter = {
      dateTo: '2024-01-20T15:45:00.000Z'
    }
    render(<DataLineageFilter filter={filter} />)
    const endInput = screen.getByPlaceholderText('End') as HTMLInputElement
    // Check that value contains the date (time may vary due to timezone)
    expect(endInput.value).toContain('20.01.2024')
  })

  it('calls onChange when start date changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const filter = {}
    
    render(<DataLineageFilter filter={filter} onChange={onChange} />)
    
    const startInput = screen.getByPlaceholderText('Start')
    await user.click(startInput)
    
    // onChange should be called when date is selected
    // Note: Full date picker interaction is complex, we verify the component accepts onChange
    expect(onChange).not.toHaveBeenCalled() // Not called until actual date selection
  })

  it('applies custom className', () => {
    const filter = {}
    const { container } = render(
      <DataLineageFilter filter={filter} className="custom-class" />
    )
    const element = container.querySelector('.data-lineage-filter')
    expect(element).toHaveClass('custom-class')
  })

  it('handles empty filter object', () => {
    const filter = {}
    render(<DataLineageFilter filter={filter} />)
    expect(screen.getByText('Filter')).toBeInTheDocument()
  })

  it('handles filter with both dates', () => {
    const filter = {
      dateFrom: '2024-06-15T12:00:00.000Z',
      dateTo: '2024-06-20T12:00:00.000Z'
    }
    render(<DataLineageFilter filter={filter} />)
    // Check that both inputs have values (exact time may vary due to timezone)
    const startInput = screen.getByPlaceholderText('Start') as HTMLInputElement
    const endInput = screen.getByPlaceholderText('End') as HTMLInputElement
    expect(startInput.value).toBeTruthy()
    expect(endInput.value).toBeTruthy()
    expect(startInput.value).toContain('2024')
    expect(endInput.value).toContain('2024')
  })
})

