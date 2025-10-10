import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ColComponent } from './ColComponent'

describe('ColComponent', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ColComponent>
        <div>Content</div>
      </ColComponent>
    )
    
    expect(container.querySelector('.ant-col')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <ColComponent>
        <div>Test Content</div>
      </ColComponent>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ColComponent className="custom-class">
        <div>Content</div>
      </ColComponent>
    )
    
    const col = container.querySelector('.col-component')
    expect(col).toHaveClass('custom-class')
  })

  it('renders with span', () => {
    const { container } = render(
      <ColComponent span={12}>
        <div>Content</div>
      </ColComponent>
    )
    
    expect(container.querySelector('.ant-col-12')).toBeInTheDocument()
  })

  it('renders with offset', () => {
    const { container } = render(
      <ColComponent offset={4}>
        <div>Content</div>
      </ColComponent>
    )
    
    expect(container.querySelector('.ant-col-offset-4')).toBeInTheDocument()
  })

  it('renders with pull', () => {
    const { container } = render(
      <ColComponent pull={2}>
        <div>Content</div>
      </ColComponent>
    )
    
    expect(container.querySelector('.ant-col-pull-2')).toBeInTheDocument()
  })

  it('renders with push', () => {
    const { container } = render(
      <ColComponent push={2}>
        <div>Content</div>
      </ColComponent>
    )
    
    expect(container.querySelector('.ant-col-push-2')).toBeInTheDocument()
  })

  it('renders with order', () => {
    const { container } = render(
      <ColComponent order={1}>
        <div>Content</div>
      </ColComponent>
    )
    
    expect(container.querySelector('.ant-col-order-1')).toBeInTheDocument()
  })

  it('renders with flex', () => {
    const { container } = render(
      <ColComponent flex="auto">
        <div>Content</div>
      </ColComponent>
    )
    
    expect(container.querySelector('.ant-col')).toBeInTheDocument()
  })
})

