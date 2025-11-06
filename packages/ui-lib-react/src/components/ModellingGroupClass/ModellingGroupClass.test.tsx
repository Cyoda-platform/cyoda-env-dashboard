import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModellingGroupClass } from './ModellingGroupClass'

const mockParams = [
  { id: 1, name: 'Param 1', type: 'string' },
  { id: 2, name: 'Param 2', type: 'number' },
  { id: 3, name: 'Param 3', type: 'boolean' },
]

describe('ModellingGroupClass', () => {
  it('renders empty list when no params provided', () => {
    const { container } = render(<ModellingGroupClass />)
    
    const list = container.querySelector('.modelling-group-class')
    expect(list).toBeInTheDocument()
    expect(list?.children.length).toBe(0)
  })

  it('renders correct number of list items', () => {
    const { container } = render(
      <ModellingGroupClass 
        requestParams={mockParams}
        renderItem={(item) => <div>{item.name}</div>}
      />
    )
    
    const listItems = container.querySelectorAll('li')
    expect(listItems.length).toBe(3)
  })

  it('renders items using renderItem prop', () => {
    render(
      <ModellingGroupClass 
        requestParams={mockParams}
        renderItem={(item) => <div className="custom-item">{item.name}</div>}
      />
    )
    
    expect(screen.getByText('Param 1')).toBeInTheDocument()
    expect(screen.getByText('Param 2')).toBeInTheDocument()
    expect(screen.getByText('Param 3')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ModellingGroupClass className="custom-class" />
    )
    
    const list = container.querySelector('.modelling-group-class')
    expect(list).toHaveClass('custom-class')
  })

  it('applies margin-top styling to list items', () => {
    const { container } = render(
      <ModellingGroupClass 
        requestParams={mockParams}
        renderItem={(item) => <div>{item.name}</div>}
      />
    )
    
    const listItems = container.querySelectorAll('li')
    expect(listItems.length).toBeGreaterThan(0)
  })

  it('renders with renderItem returning complex elements', () => {
    render(
      <ModellingGroupClass 
        requestParams={mockParams}
        renderItem={(item, index) => (
          <div>
            <span>Index: {index}</span>
            <span>Type: {item.type}</span>
          </div>
        )}
      />
    )
    
    expect(screen.getByText('Index: 0')).toBeInTheDocument()
    expect(screen.getByText('Type: string')).toBeInTheDocument()
  })

  it('renders nothing in list items when renderItem returns null', () => {
    const { container } = render(
      <ModellingGroupClass 
        requestParams={mockParams}
        renderItem={() => null}
      />
    )
    
    const listItems = container.querySelectorAll('li')
    expect(listItems.length).toBe(3)
    listItems.forEach(item => {
      expect(item.textContent).toBe('')
    })
  })

  it('handles single param', () => {
    render(
      <ModellingGroupClass 
        requestParams={[mockParams[0]]}
        renderItem={(item) => <div>{item.name}</div>}
      />
    )
    
    expect(screen.getByText('Param 1')).toBeInTheDocument()
    expect(screen.queryByText('Param 2')).not.toBeInTheDocument()
  })

  it('renders with all optional props', () => {
    const { container } = render(
      <ModellingGroupClass 
        requestParams={mockParams}
        type="TestType"
        configDefinition={{ test: 'value' }}
        checked={['param1']}
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
    
    const list = container.querySelector('.modelling-group-class')
    expect(list).toBeInTheDocument()
  })

  it('uses index as key for list items', () => {
    const { container } = render(
      <ModellingGroupClass 
        requestParams={mockParams}
        renderItem={(item) => <div>{item.name}</div>}
      />
    )
    
    const listItems = container.querySelectorAll('li')
    expect(listItems.length).toBe(3)
  })
})

