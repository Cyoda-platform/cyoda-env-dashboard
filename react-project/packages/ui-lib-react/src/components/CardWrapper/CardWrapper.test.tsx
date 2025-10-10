import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CardWrapper } from './CardWrapper'

describe('CardWrapper', () => {
  it('renders without crashing', () => {
    const { container } = render(<CardWrapper />)
    
    expect(container.querySelector('.ant-card')).toBeInTheDocument()
  })

  it('renders with title', () => {
    render(<CardWrapper title="Card Title" />)
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
  })

  it('renders with children', () => {
    render(<CardWrapper>Card Content</CardWrapper>)
    
    expect(screen.getByText('Card Content')).toBeInTheDocument()
  })

  it('renders with extra content', () => {
    render(<CardWrapper extra={<button>Extra</button>} />)
    
    expect(screen.getByText('Extra')).toBeInTheDocument()
  })

  it('renders with bordered by default', () => {
    const { container } = render(<CardWrapper />)
    
    const card = container.querySelector('.ant-card-bordered')
    expect(card).toBeInTheDocument()
  })

  it('renders without border when bordered is false', () => {
    const { container } = render(<CardWrapper bordered={false} />)
    
    const card = container.querySelector('.ant-card-bordered')
    expect(card).not.toBeInTheDocument()
  })

  it('renders as hoverable', () => {
    const { container } = render(<CardWrapper hoverable />)
    
    const card = container.querySelector('.ant-card-hoverable')
    expect(card).toBeInTheDocument()
  })

  it('renders in loading state', () => {
    const { container } = render(<CardWrapper loading />)
    
    const loading = container.querySelector('.ant-card-loading')
    expect(loading).toBeInTheDocument()
  })

  it('renders with small size', () => {
    const { container } = render(<CardWrapper size="small" />)
    
    const card = container.querySelector('.ant-card-small')
    expect(card).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<CardWrapper className="custom-class" />)
    
    const card = container.querySelector('.card-wrapper')
    expect(card).toHaveClass('custom-class')
  })

  it('renders with title and children', () => {
    render(
      <CardWrapper title="Test Title">
        <div>Test Content</div>
      </CardWrapper>
    )
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders with all props combined', () => {
    render(
      <CardWrapper
        title="Full Card"
        extra={<span>Extra</span>}
        bordered={true}
        hoverable={true}
        size="default"
        className="test-card"
      >
        Content
      </CardWrapper>
    )
    
    expect(screen.getByText('Full Card')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})

