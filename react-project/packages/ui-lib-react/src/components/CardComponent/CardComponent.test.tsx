import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CardComponent } from './CardComponent'

describe('CardComponent', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <CardComponent>
        <div>Content</div>
      </CardComponent>
    )
    
    expect(container.querySelector('.ant-card')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <CardComponent>
        <div>Test Content</div>
      </CardComponent>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <CardComponent className="custom-class">
        <div>Content</div>
      </CardComponent>
    )
    
    const card = container.querySelector('.card-component')
    expect(card).toHaveClass('custom-class')
  })

  it('renders with title', () => {
    render(
      <CardComponent title="Card Title">
        <div>Content</div>
      </CardComponent>
    )
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
  })

  it('renders with bordered style', () => {
    const { container } = render(
      <CardComponent bordered>
        <div>Content</div>
      </CardComponent>
    )
    
    expect(container.querySelector('.ant-card-bordered')).toBeInTheDocument()
  })

  it('renders without border', () => {
    const { container } = render(
      <CardComponent bordered={false}>
        <div>Content</div>
      </CardComponent>
    )
    
    const card = container.querySelector('.ant-card')
    expect(card).not.toHaveClass('ant-card-bordered')
  })

  it('renders with hoverable style', () => {
    const { container } = render(
      <CardComponent hoverable>
        <div>Content</div>
      </CardComponent>
    )
    
    expect(container.querySelector('.ant-card-hoverable')).toBeInTheDocument()
  })

  it('renders with loading state', () => {
    const { container } = render(
      <CardComponent loading>
        <div>Content</div>
      </CardComponent>
    )
    
    expect(container.querySelector('.ant-card-loading')).toBeInTheDocument()
  })

  it('renders with size small', () => {
    const { container } = render(
      <CardComponent size="small">
        <div>Content</div>
      </CardComponent>
    )
    
    expect(container.querySelector('.ant-card-small')).toBeInTheDocument()
  })

  it('renders with extra content', () => {
    render(
      <CardComponent title="Title" extra={<a href="#">More</a>}>
        <div>Content</div>
      </CardComponent>
    )
    
    expect(screen.getByText('More')).toBeInTheDocument()
  })

  it('renders with actions', () => {
    const actions = [
      <button key="edit">Edit</button>,
      <button key="delete">Delete</button>,
    ]
    
    render(
      <CardComponent actions={actions}>
        <div>Content</div>
      </CardComponent>
    )
    
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })
})

