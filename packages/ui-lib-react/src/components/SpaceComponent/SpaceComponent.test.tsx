import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SpaceComponent } from './SpaceComponent'

describe('SpaceComponent', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <SpaceComponent>
        <div>Item 1</div>
        <div>Item 2</div>
      </SpaceComponent>
    )
    
    expect(container.querySelector('.ant-space')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <SpaceComponent>
        <div>Item 1</div>
        <div>Item 2</div>
      </SpaceComponent>
    )
    
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <SpaceComponent className="custom-class">
        <div>Item</div>
      </SpaceComponent>
    )
    
    const space = container.querySelector('.space-component')
    expect(space).toHaveClass('custom-class')
  })

  it('renders with direction vertical', () => {
    const { container } = render(
      <SpaceComponent direction="vertical">
        <div>Item 1</div>
        <div>Item 2</div>
      </SpaceComponent>
    )
    
    expect(container.querySelector('.ant-space-vertical')).toBeInTheDocument()
  })

  it('renders with direction horizontal', () => {
    const { container } = render(
      <SpaceComponent direction="horizontal">
        <div>Item 1</div>
        <div>Item 2</div>
      </SpaceComponent>
    )
    
    expect(container.querySelector('.ant-space-horizontal')).toBeInTheDocument()
  })

  it('renders with size large', () => {
    const { container } = render(
      <SpaceComponent size="large">
        <div>Item 1</div>
        <div>Item 2</div>
      </SpaceComponent>
    )
    
    expect(container.querySelector('.ant-space')).toBeInTheDocument()
  })

  it('renders with size small', () => {
    const { container } = render(
      <SpaceComponent size="small">
        <div>Item 1</div>
        <div>Item 2</div>
      </SpaceComponent>
    )
    
    expect(container.querySelector('.ant-space')).toBeInTheDocument()
  })

  it('renders with align center', () => {
    const { container } = render(
      <SpaceComponent align="center">
        <div>Item 1</div>
        <div>Item 2</div>
      </SpaceComponent>
    )
    
    expect(container.querySelector('.ant-space-align-center')).toBeInTheDocument()
  })

  it('renders with wrap', () => {
    const { container } = render(
      <SpaceComponent wrap>
        <div>Item 1</div>
        <div>Item 2</div>
      </SpaceComponent>
    )
    
    expect(container.querySelector('.ant-space')).toBeInTheDocument()
  })

  it('renders with custom split', () => {
    render(
      <SpaceComponent split={<span>|</span>}>
        <div>Item 1</div>
        <div>Item 2</div>
      </SpaceComponent>
    )
    
    expect(screen.getByText('|')).toBeInTheDocument()
  })
})

