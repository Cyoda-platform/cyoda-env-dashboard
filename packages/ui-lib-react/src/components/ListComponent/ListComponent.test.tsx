import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ListComponent } from './ListComponent'

const data = [
  { id: 1, title: 'Item 1' },
  { id: 2, title: 'Item 2' },
  { id: 3, title: 'Item 3' },
]

describe('ListComponent', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ListComponent
        dataSource={data}
        renderItem={(item) => <div>{item.title}</div>}
      />
    )
    
    expect(container.querySelector('.ant-list')).toBeInTheDocument()
  })

  it('renders list items', () => {
    render(
      <ListComponent
        dataSource={data}
        renderItem={(item) => <div>{item.title}</div>}
      />
    )
    
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ListComponent
        className="custom-class"
        dataSource={data}
        renderItem={(item) => <div>{item.title}</div>}
      />
    )
    
    const list = container.querySelector('.list-component')
    expect(list).toHaveClass('custom-class')
  })

  it('renders with header', () => {
    render(
      <ListComponent
        header={<div>List Header</div>}
        dataSource={data}
        renderItem={(item) => <div>{item.title}</div>}
      />
    )
    
    expect(screen.getByText('List Header')).toBeInTheDocument()
  })

  it('renders with footer', () => {
    render(
      <ListComponent
        footer={<div>List Footer</div>}
        dataSource={data}
        renderItem={(item) => <div>{item.title}</div>}
      />
    )
    
    expect(screen.getByText('List Footer')).toBeInTheDocument()
  })

  it('renders with bordered style', () => {
    const { container } = render(
      <ListComponent
        bordered
        dataSource={data}
        renderItem={(item) => <div>{item.title}</div>}
      />
    )
    
    expect(container.querySelector('.ant-list-bordered')).toBeInTheDocument()
  })

  it('renders with size small', () => {
    const { container } = render(
      <ListComponent
        size="small"
        dataSource={data}
        renderItem={(item) => <div>{item.title}</div>}
      />
    )
    
    expect(container.querySelector('.ant-list-sm')).toBeInTheDocument()
  })

  it('renders with size large', () => {
    const { container } = render(
      <ListComponent
        size="large"
        dataSource={data}
        renderItem={(item) => <div>{item.title}</div>}
      />
    )
    
    expect(container.querySelector('.ant-list-lg')).toBeInTheDocument()
  })

  it('renders with loading state', () => {
    const { container } = render(
      <ListComponent
        loading
        dataSource={data}
        renderItem={(item) => <div>{item.title}</div>}
      />
    )
    
    expect(container.querySelector('.ant-spin')).toBeInTheDocument()
  })

  it('renders with pagination', () => {
    render(
      <ListComponent
        dataSource={data}
        renderItem={(item) => <div>{item.title}</div>}
        pagination={{ pageSize: 2 }}
      />
    )
    
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('renders with grid layout', () => {
    const { container } = render(
      <ListComponent
        grid={{ gutter: 16, column: 2 }}
        dataSource={data}
        renderItem={(item) => <div>{item.title}</div>}
      />
    )
    
    expect(container.querySelector('.ant-list-grid')).toBeInTheDocument()
  })
})

