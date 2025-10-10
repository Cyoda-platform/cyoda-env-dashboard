import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CollapseComponent } from './CollapseComponent'

const items = [
  {
    key: '1',
    label: 'Panel 1',
    children: <div>Content 1</div>,
  },
  {
    key: '2',
    label: 'Panel 2',
    children: <div>Content 2</div>,
  },
]

describe('CollapseComponent', () => {
  it('renders without crashing', () => {
    const { container } = render(<CollapseComponent items={items} />)
    
    expect(container.querySelector('.ant-collapse')).toBeInTheDocument()
  })

  it('renders panel labels', () => {
    render(<CollapseComponent items={items} />)
    
    expect(screen.getByText('Panel 1')).toBeInTheDocument()
    expect(screen.getByText('Panel 2')).toBeInTheDocument()
  })

  it('expands panel when clicked', () => {
    render(<CollapseComponent items={items} />)
    
    const panel1 = screen.getByText('Panel 1')
    fireEvent.click(panel1)
    
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<CollapseComponent items={items} className="custom-class" />)
    
    const collapse = container.querySelector('.collapse-component')
    expect(collapse).toHaveClass('custom-class')
  })

  it('renders with default active key', () => {
    render(<CollapseComponent items={items} defaultActiveKey={['1']} />)
    
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('calls onChange when panel is toggled', () => {
    const onChange = vi.fn()
    render(<CollapseComponent items={items} onChange={onChange} />)
    
    const panel1 = screen.getByText('Panel 1')
    fireEvent.click(panel1)
    
    expect(onChange).toHaveBeenCalled()
  })

  it('renders with accordion mode', () => {
    const { container } = render(<CollapseComponent items={items} accordion />)
    
    expect(container.querySelector('.ant-collapse')).toBeInTheDocument()
  })

  it('renders with bordered style', () => {
    const { container } = render(<CollapseComponent items={items} bordered />)

    expect(container.querySelector('.ant-collapse')).toBeInTheDocument()
  })

  it('renders without border', () => {
    const { container } = render(<CollapseComponent items={items} bordered={false} />)
    
    expect(container.querySelector('.ant-collapse-borderless')).toBeInTheDocument()
  })

  it('renders with ghost style', () => {
    const { container } = render(<CollapseComponent items={items} ghost />)
    
    expect(container.querySelector('.ant-collapse-ghost')).toBeInTheDocument()
  })
})

