import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import { List } from './List'

describe('List', () => {
  const mockOptions = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
    { label: 'Option 4', value: '4' }
  ]

  it('renders list with title', () => {
    render(<List name="Test List" options={mockOptions} />)
    expect(screen.getByText('Test List')).toBeInTheDocument()
  })

  it('renders all options', () => {
    render(<List options={mockOptions} />)
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
    expect(screen.getByText('Option 4')).toBeInTheDocument()
  })

  it('renders without title when name is not provided', () => {
    const { container } = render(<List options={mockOptions} />)
    const h2 = container.querySelector('h2')
    expect(h2).not.toBeInTheDocument()
  })

  it('renders checkboxes for all options', () => {
    const { container } = render(<List options={mockOptions} />)
    const checkboxes = container.querySelectorAll('.ant-checkbox-wrapper')
    expect(checkboxes).toHaveLength(4)
  })

  it('respects controlled value', () => {
    const { container } = render(<List options={mockOptions} value={['1', '2']} />)

    const checkedBoxes = container.querySelectorAll('.ant-checkbox-wrapper-checked')
    expect(checkedBoxes).toHaveLength(2)
  })

  it('renders with empty options array', () => {
    const { container } = render(<List options={[]} name="Empty List" />)
    expect(screen.getByText('Empty List')).toBeInTheDocument()
    const checkboxes = container.querySelectorAll('.ant-checkbox-wrapper')
    expect(checkboxes).toHaveLength(0)
  })

  it('applies custom styling classes', () => {
    const { container } = render(<List options={mockOptions} name="Styled List" />)
    expect(container.querySelector('.list-component')).toBeInTheDocument()
    expect(container.querySelector('.box-list')).toBeInTheDocument()
  })
})

