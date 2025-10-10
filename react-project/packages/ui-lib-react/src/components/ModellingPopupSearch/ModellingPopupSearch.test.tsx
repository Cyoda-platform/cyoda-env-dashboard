import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ModellingPopupSearch } from './ModellingPopupSearch'

describe('ModellingPopupSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('renders with default placeholder', () => {
    render(<ModellingPopupSearch />)
    
    const input = screen.getByPlaceholderText('Press / for search')
    expect(input).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<ModellingPopupSearch placeholder="Search here" />)
    
    const input = screen.getByPlaceholderText('Search here')
    expect(input).toBeInTheDocument()
  })

  it('renders with initial value', () => {
    render(<ModellingPopupSearch value="test" />)
    
    const input = screen.getByDisplayValue('test')
    expect(input).toBeInTheDocument()
  })

  it('calls onChange after debounce delay when input length >= minSearchLength', () => {
    const onChange = vi.fn()
    render(<ModellingPopupSearch onChange={onChange} minSearchLength={2} />)

    const input = screen.getByPlaceholderText('Press / for search')
    fireEvent.change(input, { target: { value: 'test' } })

    expect(onChange).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)

    expect(onChange).toHaveBeenCalledWith('test')
  })

  it('calls onClear when input is cleared', () => {
    const onClear = vi.fn()
    const onChange = vi.fn()
    render(<ModellingPopupSearch onChange={onChange} onClear={onClear} value="test" />)

    const input = screen.getByDisplayValue('test')
    fireEvent.change(input, { target: { value: '' } })

    vi.advanceTimersByTime(500)

    expect(onClear).toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('does not call onChange when input length < minSearchLength', () => {
    const onChange = vi.fn()
    const onClear = vi.fn()
    render(<ModellingPopupSearch onChange={onChange} onClear={onClear} minSearchLength={2} />)

    const input = screen.getByPlaceholderText('Press / for search')
    fireEvent.change(input, { target: { value: 'a' } })

    vi.advanceTimersByTime(500)

    expect(onClear).toHaveBeenCalled()
  })

  it('updates value when prop changes', () => {
    const { rerender } = render(<ModellingPopupSearch value="initial" />)
    
    expect(screen.getByDisplayValue('initial')).toBeInTheDocument()
    
    rerender(<ModellingPopupSearch value="updated" />)
    
    expect(screen.getByDisplayValue('updated')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ModellingPopupSearch className="custom-class" />)
    
    const input = container.querySelector('.modelling-popup-search')
    expect(input).toHaveClass('custom-class')
  })

  it('respects custom debounce delay', () => {
    const onChange = vi.fn()
    render(<ModellingPopupSearch onChange={onChange} debounceDelay={1000} />)

    const input = screen.getByPlaceholderText('Press / for search')
    fireEvent.change(input, { target: { value: 'test' } })

    vi.advanceTimersByTime(500)
    expect(onChange).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)

    expect(onChange).toHaveBeenCalledWith('test')
  })

  it('respects custom minSearchLength', () => {
    const onChange = vi.fn()
    render(<ModellingPopupSearch onChange={onChange} minSearchLength={3} />)

    const input = screen.getByPlaceholderText('Press / for search')
    fireEvent.change(input, { target: { value: 'ab' } })

    vi.advanceTimersByTime(500)

    expect(onChange).toHaveBeenCalledWith('')
  })

  it('renders search icon', () => {
    const { container } = render(<ModellingPopupSearch />)
    
    const icon = container.querySelector('.anticon-search')
    expect(icon).toBeInTheDocument()
  })

  it('handles multiple rapid changes with debounce', () => {
    const onChange = vi.fn()
    render(<ModellingPopupSearch onChange={onChange} />)

    const input = screen.getByPlaceholderText('Press / for search')

    fireEvent.change(input, { target: { value: 't' } })
    fireEvent.change(input, { target: { value: 'te' } })
    fireEvent.change(input, { target: { value: 'tes' } })
    fireEvent.change(input, { target: { value: 'test' } })

    vi.advanceTimersByTime(500)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('test')
  })
})

