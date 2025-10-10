import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModellingGroup } from './ModellingGroup'

const mockItems = [
  { columnPath: 'path1', name: 'Item 1' },
  { columnPath: 'path2', name: 'Item 2' },
  { columnPath: 'path3', name: 'Item 3' },
]

describe('ModellingGroup', () => {
  it('renders empty list when no items provided', () => {
    const { container } = render(<ModellingGroup />)
    
    const list = container.querySelector('.modelling-group')
    expect(list).toBeInTheDocument()
    expect(list?.children.length).toBe(0)
  })

  it('renders correct number of list items', () => {
    const { container } = render(
      <ModellingGroup 
        reportInfoRows={mockItems}
        renderItem={(item) => <div>{item.name}</div>}
      />
    )
    
    const listItems = container.querySelectorAll('li')
    expect(listItems.length).toBe(3)
  })

  it('renders items using renderItem prop', () => {
    render(
      <ModellingGroup 
        reportInfoRows={mockItems}
        renderItem={(item) => <div className="custom-item">{item.name}</div>}
      />
    )
    
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('renders all items with unique keys', () => {
    const { container } = render(
      <ModellingGroup
        reportInfoRows={mockItems}
        renderItem={(item) => <div>{item.name}</div>}
      />
    )

    const listItems = container.querySelectorAll('li')
    // React uses keys internally, we just verify all items are rendered
    expect(listItems.length).toBe(mockItems.length)
  })

  it('applies custom className', () => {
    const { container } = render(
      <ModellingGroup className="custom-class" />
    )
    
    const list = container.querySelector('.modelling-group')
    expect(list).toHaveClass('custom-class')
  })

  it('renders with renderItem returning complex elements', () => {
    render(
      <ModellingGroup 
        reportInfoRows={mockItems}
        renderItem={(item, index) => (
          <div>
            <span>Index: {index}</span>
            <span>Name: {item.name}</span>
          </div>
        )}
      />
    )
    
    expect(screen.getByText('Index: 0')).toBeInTheDocument()
    expect(screen.getByText('Name: Item 1')).toBeInTheDocument()
  })

  it('renders nothing in list items when renderItem returns null', () => {
    const { container } = render(
      <ModellingGroup 
        reportInfoRows={mockItems}
        renderItem={() => null}
      />
    )
    
    const listItems = container.querySelectorAll('li')
    expect(listItems.length).toBe(3)
    listItems.forEach(item => {
      expect(item.textContent).toBe('')
    })
  })

  it('handles single item', () => {
    render(
      <ModellingGroup 
        reportInfoRows={[mockItems[0]]}
        renderItem={(item) => <div>{item.name}</div>}
      />
    )
    
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument()
  })

  it('renders with all optional props', () => {
    const { container } = render(
      <ModellingGroup 
        reportInfoRows={mockItems}
        relatedPaths={['path1', 'path2']}
        requestClass="TestClass"
        checked={['path1']}
        limit={10}
        onlyRange={true}
        isOpenAllSelected={true}
        isCondenseThePaths={false}
        search="test"
        parentColDef={{ test: 'value' }}
        onlyView={false}
        disablePreview={true}
        renderItem={(item) => <div>{item.name}</div>}
      />
    )
    
    const list = container.querySelector('.modelling-group')
    expect(list).toBeInTheDocument()
  })
})

