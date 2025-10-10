import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { DataTable } from './DataTable'
import { Table } from 'antd'

const { Column } = Table

describe('DataTable', () => {
  const mockData = [
    { id: 1, name: 'John Doe', age: 30, city: 'New York' },
    { id: 2, name: 'Jane Smith', age: 25, city: 'Los Angeles' },
    { id: 3, name: 'Bob Johnson', age: 35, city: 'Chicago' },
    { id: 4, name: 'Alice Williams', age: 28, city: 'Houston' },
    { id: 5, name: 'Charlie Brown', age: 32, city: 'Phoenix' },
  ]

  it('renders table with data', () => {
    render(
      <DataTable data={mockData}>
        <Column title="Name" dataIndex="name" key="name" />
        <Column title="Age" dataIndex="age" key="age" />
        <Column title="City" dataIndex="city" key="city" />
      </DataTable>
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('renders pagination', () => {
    render(
      <DataTable data={mockData} pageSize={2}>
        <Column title="Name" dataIndex="name" key="name" />
      </DataTable>
    )

    // Should show pagination
    expect(screen.getByText(/Total 5 items/i)).toBeInTheDocument()
  })

  it('handles page size change', async () => {
    const user = userEvent.setup()
    const onPageSizeChange = vi.fn()

    render(
      <DataTable 
        data={mockData} 
        pageSize={2}
        onPageSizeChange={onPageSizeChange}
      >
        <Column title="Name" dataIndex="name" key="name" />
      </DataTable>
    )

    // Find and click the page size selector
    const pageSizeSelector = screen.getByTitle('2 / page')
    await user.click(pageSizeSelector)

    // Wait for dropdown to appear and select different size
    await waitFor(() => {
      const option = screen.getByTitle('10 / page')
      expect(option).toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    const { container } = render(
      <DataTable data={mockData} loading={true}>
        <Column title="Name" dataIndex="name" key="name" />
      </DataTable>
    )

    expect(container.querySelector('.ant-spin')).toBeInTheDocument()
  })

  it('renders toolbar when provided', () => {
    render(
      <DataTable 
        data={mockData}
        toolBar={<div>Custom Toolbar</div>}
      >
        <Column title="Name" dataIndex="name" key="name" />
      </DataTable>
    )

    expect(screen.getByText('Custom Toolbar')).toBeInTheDocument()
  })

  it('filters data correctly', () => {
    const filters = [
      { prop: 'city', value: 'New York' }
    ]

    render(
      <DataTable data={mockData} filters={filters} pageSize={10}>
        <Column title="Name" dataIndex="name" key="name" />
        <Column title="City" dataIndex="city" key="city" />
      </DataTable>
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('uses custom filter function', () => {
    const filters = [
      { 
        prop: 'age', 
        filterFn: (row: any) => row.age > 30 
      }
    ]

    render(
      <DataTable data={mockData} filters={filters} pageSize={10}>
        <Column title="Name" dataIndex="name" key="name" />
        <Column title="Age" dataIndex="age" key="age" />
      </DataTable>
    )

    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('handles remote mode', () => {
    render(
      <DataTable 
        data={mockData.slice(0, 2)} 
        remote={true}
        paginationProps={{ total: 100 }}
        pageSize={2}
      >
        <Column title="Name" dataIndex="name" key="name" />
      </DataTable>
    )

    // Should show total from props, not data length
    expect(screen.getByText(/Total 100 items/i)).toBeInTheDocument()
  })

  it('calls onQueryChange on mount', async () => {
    const onQueryChange = vi.fn()

    render(
      <DataTable data={mockData} onQueryChange={onQueryChange}>
        <Column title="Name" dataIndex="name" key="name" />
      </DataTable>
    )

    await waitFor(() => {
      expect(onQueryChange).toHaveBeenCalled()
    }, { timeout: 500 })

    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        pageSize: 20,
        filters: []
      })
    )
  })

  it('applies table props correctly', () => {
    const { container } = render(
      <DataTable 
        data={mockData}
        tableProps={{ border: true, height: 400 }}
      >
        <Column title="Name" dataIndex="name" key="name" />
      </DataTable>
    )

    const table = container.querySelector('.ant-table-bordered')
    expect(table).toBeInTheDocument()
  })
})

