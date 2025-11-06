import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PopoverComponent } from './PopoverComponent'

describe('PopoverComponent', () => {
  it('renders without crashing', () => {
    render(
      <PopoverComponent content="Popover content">
        <button>Trigger</button>
      </PopoverComponent>
    )
    
    expect(screen.getByText('Trigger')).toBeInTheDocument()
  })

  it('renders trigger element', () => {
    render(
      <PopoverComponent content="Content">
        <button>Click me</button>
      </PopoverComponent>
    )
    
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('shows popover content on hover', async () => {
    render(
      <PopoverComponent content="Popover content" trigger="hover">
        <button>Hover me</button>
      </PopoverComponent>
    )
    
    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)
    
    await waitFor(() => {
      expect(screen.getByText('Popover content')).toBeInTheDocument()
    })
  })

  it('shows popover content on click', async () => {
    render(
      <PopoverComponent content="Popover content" trigger="click">
        <button>Click me</button>
      </PopoverComponent>
    )
    
    const trigger = screen.getByText('Click me')
    fireEvent.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByText('Popover content')).toBeInTheDocument()
    })
  })

  it('renders with title', async () => {
    render(
      <PopoverComponent title="Popover Title" content="Content" trigger="click">
        <button>Click me</button>
      </PopoverComponent>
    )
    
    const trigger = screen.getByText('Click me')
    fireEvent.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByText('Popover Title')).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    const { container } = render(
      <PopoverComponent content="Content" className="custom-class">
        <button>Trigger</button>
      </PopoverComponent>
    )
    
    const popover = container.querySelector('.popover-component')
    expect(popover).toHaveClass('custom-class')
  })

  it('renders with placement top', async () => {
    render(
      <PopoverComponent content="Content" placement="top" trigger="click">
        <button>Click me</button>
      </PopoverComponent>
    )
    
    const trigger = screen.getByText('Click me')
    fireEvent.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  it('accepts onOpenChange callback', () => {
    const onOpenChange = vi.fn()
    render(
      <PopoverComponent content="Content" trigger="click" onOpenChange={onOpenChange}>
        <button>Click me</button>
      </PopoverComponent>
    )

    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renders with custom content', async () => {
    render(
      <PopoverComponent
        content={<div>Custom Content</div>}
        trigger="click"
      >
        <button>Click me</button>
      </PopoverComponent>
    )
    
    const trigger = screen.getByText('Click me')
    fireEvent.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })
  })

  it('renders with trigger element and outside content', () => {
    render(
      <div>
        <PopoverComponent content="Content" trigger="click">
          <button>Click me</button>
        </PopoverComponent>
        <div>Outside</div>
      </div>
    )

    expect(screen.getByText('Click me')).toBeInTheDocument()
    expect(screen.getByText('Outside')).toBeInTheDocument()
  })

  it('renders with arrow', async () => {
    render(
      <PopoverComponent content="Content" trigger="click" arrow={true}>
        <button>Click me</button>
      </PopoverComponent>
    )
    
    const trigger = screen.getByText('Click me')
    fireEvent.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })
})

