import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TableComponent } from './TableComponent'

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
]

const dataSource = [
  {
    key: '1',
    name: 'John',
    age: 32,
  },
  {
    key: '2',
    name: 'Jane',
    age: 28,
  },
]

describe('TableComponent', () => {
  it('renders without crashing', () => {
    const { container } = render(<TableComponent columns={columns} dataSource={dataSource} />)
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument()
  })

  it('renders table with columns', () => {
    render(<TableComponent columns={columns} dataSource={dataSource} />)
    
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
  })

  it('renders table with data', () => {
    render(<TableComponent columns={columns} dataSource={dataSource} />)
    
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
    expect(screen.getByText('32')).toBeInTheDocument()
    expect(screen.getByText('28')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <TableComponent columns={columns} dataSource={dataSource} className="custom-class" />
    )
    
    const table = container.querySelector('.table-component')
    expect(table).toHaveClass('custom-class')
  })

  it('renders with pagination', () => {
    const { container } = render(
      <TableComponent columns={columns} dataSource={dataSource} pagination={{ pageSize: 10 }} />
    )
    
    const pagination = container.querySelector('.ant-pagination')
    expect(pagination).toBeInTheDocument()
  })

  it('renders without pagination when pagination is false', () => {
    const { container } = render(
      <TableComponent columns={columns} dataSource={dataSource} pagination={false} />
    )
    
    const pagination = container.querySelector('.ant-pagination')
    expect(pagination).not.toBeInTheDocument()
  })

  it('renders with loading state', () => {
    const { container } = render(
      <TableComponent columns={columns} dataSource={dataSource} loading={true} />
    )
    
    const spinner = container.querySelector('.ant-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with bordered style', () => {
    const { container } = render(
      <TableComponent columns={columns} dataSource={dataSource} bordered />
    )
    
    const table = container.querySelector('.ant-table-bordered')
    expect(table).toBeInTheDocument()
  })

  it('renders with size small', () => {
    const { container } = render(
      <TableComponent columns={columns} dataSource={dataSource} size="small" />
    )
    
    const table = container.querySelector('.ant-table-small')
    expect(table).toBeInTheDocument()
  })

  it('renders empty table', () => {
    const { container } = render(<TableComponent columns={columns} dataSource={[]} />)

    const emptyText = container.querySelector('.ant-empty-description')
    expect(emptyText).toBeInTheDocument()
  })

  it('renders with row selection', () => {
    const rowSelection = {
      onChange: vi.fn(),
    }
    
    const { container } = render(
      <TableComponent columns={columns} dataSource={dataSource} rowSelection={rowSelection} />
    )
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]')
    expect(checkboxes.length).toBeGreaterThan(0)
  })
})

