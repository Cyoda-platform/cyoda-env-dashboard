import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StateMachineMapControls } from './StateMachineMapControls'

describe('StateMachineMapControls', () => {
  it('renders without crashing', () => {
    const { container } = render(<StateMachineMapControls />)
    
    expect(container.querySelector('.state-machine-map-controls')).toBeInTheDocument()
  })

  it('renders fit graph button', () => {
    render(<StateMachineMapControls />)
    
    const button = screen.getByTitle('Fit graph')
    expect(button).toBeInTheDocument()
  })

  it('renders zoom in button', () => {
    render(<StateMachineMapControls />)
    
    const button = screen.getByTitle('Zoom in')
    expect(button).toBeInTheDocument()
  })

  it('renders zoom out button', () => {
    render(<StateMachineMapControls />)
    
    const button = screen.getByTitle('Zoom out')
    expect(button).toBeInTheDocument()
  })

  it('renders pan left button', () => {
    render(<StateMachineMapControls />)
    
    const button = screen.getByTitle('Move left')
    expect(button).toBeInTheDocument()
  })

  it('renders pan up button', () => {
    render(<StateMachineMapControls />)
    
    const button = screen.getByTitle('Move up')
    expect(button).toBeInTheDocument()
  })

  it('renders pan right button', () => {
    render(<StateMachineMapControls />)
    
    const button = screen.getByTitle('Move right')
    expect(button).toBeInTheDocument()
  })

  it('renders pan down button', () => {
    render(<StateMachineMapControls />)
    
    const button = screen.getByTitle('Move down')
    expect(button).toBeInTheDocument()
  })

  it('renders Add button when isAvailableAddButton is true', () => {
    render(<StateMachineMapControls isAvailableAddButton={true} />)
    
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('does not render Add button when isAvailableAddButton is false', () => {
    render(<StateMachineMapControls isAvailableAddButton={false} />)
    
    expect(screen.queryByText('Add')).not.toBeInTheDocument()
  })

  it('calls onFitGraph when fit graph button is clicked', () => {
    const onFitGraph = vi.fn()
    render(<StateMachineMapControls onFitGraph={onFitGraph} />)
    
    const button = screen.getByTitle('Fit graph')
    fireEvent.click(button)
    
    expect(onFitGraph).toHaveBeenCalled()
  })

  it('calls onZoomIn when zoom in button is clicked', () => {
    const onZoomIn = vi.fn()
    render(<StateMachineMapControls onZoomIn={onZoomIn} />)
    
    const button = screen.getByTitle('Zoom in')
    fireEvent.click(button)
    
    expect(onZoomIn).toHaveBeenCalled()
  })

  it('calls onZoomOut when zoom out button is clicked', () => {
    const onZoomOut = vi.fn()
    render(<StateMachineMapControls onZoomOut={onZoomOut} />)
    
    const button = screen.getByTitle('Zoom out')
    fireEvent.click(button)
    
    expect(onZoomOut).toHaveBeenCalled()
  })

  it('calls onPanLeft when move left button is clicked', () => {
    const onPanLeft = vi.fn()
    render(<StateMachineMapControls onPanLeft={onPanLeft} />)
    
    const button = screen.getByTitle('Move left')
    fireEvent.click(button)
    
    expect(onPanLeft).toHaveBeenCalled()
  })

  it('calls onPanTop when move up button is clicked', () => {
    const onPanTop = vi.fn()
    render(<StateMachineMapControls onPanTop={onPanTop} />)
    
    const button = screen.getByTitle('Move up')
    fireEvent.click(button)
    
    expect(onPanTop).toHaveBeenCalled()
  })

  it('calls onPanRight when move right button is clicked', () => {
    const onPanRight = vi.fn()
    render(<StateMachineMapControls onPanRight={onPanRight} />)
    
    const button = screen.getByTitle('Move right')
    fireEvent.click(button)
    
    expect(onPanRight).toHaveBeenCalled()
  })

  it('calls onPanBottom when move down button is clicked', () => {
    const onPanBottom = vi.fn()
    render(<StateMachineMapControls onPanBottom={onPanBottom} />)
    
    const button = screen.getByTitle('Move down')
    fireEvent.click(button)
    
    expect(onPanBottom).toHaveBeenCalled()
  })

  it('calls onCreateTransition when Add button is clicked', () => {
    const onCreateTransition = vi.fn()
    render(<StateMachineMapControls onCreateTransition={onCreateTransition} />)
    
    const button = screen.getByText('Add')
    fireEvent.click(button)
    
    expect(onCreateTransition).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const { container } = render(<StateMachineMapControls className="custom-class" />)
    
    const component = container.querySelector('.state-machine-map-controls')
    expect(component).toHaveClass('custom-class')
  })
})

