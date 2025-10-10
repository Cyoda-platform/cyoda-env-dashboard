import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BooleanSelect } from './BooleanSelect'

describe('BooleanSelect', () => {
  it('renders with placeholder', () => {
    render(<BooleanSelect placeholder="Choose value" />)
    expect(screen.getByText('Choose value')).toBeInTheDocument()
  })

  it('renders with default placeholder', () => {
    render(<BooleanSelect />)
    expect(screen.getByText('Select')).toBeInTheDocument()
  })

  it('displays true and false options', async () => {
    const user = userEvent.setup()
    const { container } = render(<BooleanSelect />)

    // Click on the select element itself, not the text
    const selectElement = container.querySelector('.ant-select-selector')!
    await user.click(selectElement)

    expect(screen.getByText('true')).toBeInTheDocument()
    expect(screen.getByText('false')).toBeInTheDocument()
  })

  it('calls onChange with true when true is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const { container } = render(<BooleanSelect onChange={onChange} />)

    const selectElement = container.querySelector('.ant-select-selector')!
    await user.click(selectElement)

    const trueOption = screen.getByText('true')
    await user.click(trueOption)

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when false is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const { container } = render(<BooleanSelect onChange={onChange} />)

    const selectElement = container.querySelector('.ant-select-selector')!
    await user.click(selectElement)

    const falseOption = screen.getByText('false')
    await user.click(falseOption)

    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('displays selected value', () => {
    const { rerender } = render(<BooleanSelect value={true} />)
    expect(screen.getByText('true')).toBeInTheDocument()
    
    rerender(<BooleanSelect value={false} />)
    expect(screen.getByText('false')).toBeInTheDocument()
  })

  it('can be disabled', () => {
    render(<BooleanSelect disabled={true} />)
    const select = document.querySelector('.ant-select-disabled')
    expect(select).toBeInTheDocument()
  })

  it('is enabled by default', () => {
    render(<BooleanSelect />)
    const select = document.querySelector('.ant-select-disabled')
    expect(select).not.toBeInTheDocument()
  })

  it('supports custom labels', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BooleanSelect
        labels={{ true: 'Yes', false: 'No' }}
      />
    )

    const selectElement = container.querySelector('.ant-select-selector')!
    await user.click(selectElement)

    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('handles null value', () => {
    render(<BooleanSelect value={null} />)
    expect(screen.getByText('Select')).toBeInTheDocument()
  })

  it('passes additional props to Select', () => {
    render(<BooleanSelect style={{ width: 200 }} />)
    const select = document.querySelector('.boolean-select')
    expect(select).toBeInTheDocument()
  })
})

