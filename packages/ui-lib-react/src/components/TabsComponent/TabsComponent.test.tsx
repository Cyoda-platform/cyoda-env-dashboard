import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TabsComponent } from './TabsComponent'

const items = [
  {
    key: '1',
    label: 'Tab 1',
    children: <div>Content 1</div>,
  },
  {
    key: '2',
    label: 'Tab 2',
    children: <div>Content 2</div>,
  },
  {
    key: '3',
    label: 'Tab 3',
    children: <div>Content 3</div>,
  },
]

describe('TabsComponent', () => {
  it('renders without crashing', () => {
    const { container } = render(<TabsComponent items={items} />)
    
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument()
  })

  it('renders all tab labels', () => {
    render(<TabsComponent items={items} />)
    
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
    expect(screen.getByText('Tab 3')).toBeInTheDocument()
  })

  it('renders first tab content by default', () => {
    render(<TabsComponent items={items} />)
    
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('switches tab content when tab is clicked', () => {
    render(<TabsComponent items={items} />)
    
    const tab2 = screen.getByText('Tab 2')
    fireEvent.click(tab2)
    
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<TabsComponent items={items} className="custom-class" />)
    
    const tabs = container.querySelector('.tabs-component')
    expect(tabs).toHaveClass('custom-class')
  })

  it('calls onChange when tab is changed', () => {
    const onChange = vi.fn()
    render(<TabsComponent items={items} onChange={onChange} />)
    
    const tab2 = screen.getByText('Tab 2')
    fireEvent.click(tab2)
    
    expect(onChange).toHaveBeenCalledWith('2')
  })

  it('renders with default active key', () => {
    render(<TabsComponent items={items} defaultActiveKey="2" />)
    
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('renders with controlled active key', () => {
    render(<TabsComponent items={items} activeKey="3" />)
    
    expect(screen.getByText('Content 3')).toBeInTheDocument()
  })

  it('renders with type card', () => {
    const { container } = render(<TabsComponent items={items} type="card" />)
    
    const tabs = container.querySelector('.ant-tabs-card')
    expect(tabs).toBeInTheDocument()
  })

  it('renders with centered tabs', () => {
    const { container } = render(<TabsComponent items={items} centered />)
    
    const tabs = container.querySelector('.ant-tabs-centered')
    expect(tabs).toBeInTheDocument()
  })

  it('renders with size large', () => {
    const { container } = render(<TabsComponent items={items} size="large" />)
    
    const tabs = container.querySelector('.ant-tabs-large')
    expect(tabs).toBeInTheDocument()
  })

  it('renders with tab position left', () => {
    const { container } = render(<TabsComponent items={items} tabPosition="left" />)
    
    const tabs = container.querySelector('.ant-tabs-left')
    expect(tabs).toBeInTheDocument()
  })
})

