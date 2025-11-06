import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DividerComponent } from './DividerComponent'

describe('DividerComponent', () => {
  it('renders without crashing', () => {
    const { container } = render(<DividerComponent />)
    
    expect(container.querySelector('.ant-divider')).toBeInTheDocument()
  })

  it('renders with text', () => {
    render(<DividerComponent>Text</DividerComponent>)
    
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<DividerComponent className="custom-class" />)
    
    const divider = container.querySelector('.divider-component')
    expect(divider).toHaveClass('custom-class')
  })

  it('renders with type vertical', () => {
    const { container } = render(<DividerComponent type="vertical" />)
    
    expect(container.querySelector('.ant-divider-vertical')).toBeInTheDocument()
  })

  it('renders with type horizontal', () => {
    const { container } = render(<DividerComponent type="horizontal" />)
    
    expect(container.querySelector('.ant-divider-horizontal')).toBeInTheDocument()
  })

  it('renders with orientation left', () => {
    const { container } = render(<DividerComponent orientation="left">Text</DividerComponent>)

    expect(container.querySelector('.ant-divider')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('renders with orientation right', () => {
    const { container } = render(<DividerComponent orientation="right">Text</DividerComponent>)

    expect(container.querySelector('.ant-divider')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('renders with orientation center', () => {
    const { container } = render(<DividerComponent orientation="center">Text</DividerComponent>)

    expect(container.querySelector('.ant-divider')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('renders with dashed style', () => {
    const { container } = render(<DividerComponent dashed />)
    
    expect(container.querySelector('.ant-divider-dashed')).toBeInTheDocument()
  })

  it('renders with plain style', () => {
    const { container } = render(<DividerComponent plain>Text</DividerComponent>)
    
    expect(container.querySelector('.ant-divider-plain')).toBeInTheDocument()
  })
})

