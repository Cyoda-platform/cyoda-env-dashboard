import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StateMachineLegend } from './StateMachineLegend'

describe('StateMachineLegend', () => {
  it('renders all legend items', () => {
    render(<StateMachineLegend />)
    
    expect(screen.getByText('State')).toBeInTheDocument()
    expect(screen.getByText('Automated Transition')).toBeInTheDocument()
    expect(screen.getByText('Manual Transition')).toBeInTheDocument()
    expect(screen.getByText('Transition with Criteria')).toBeInTheDocument()
    expect(screen.getByText('Process')).toBeInTheDocument()
  })

  it('renders state icon', () => {
    const { container } = render(<StateMachineLegend />)
    
    const stateIcon = container.querySelector('.icon-state')
    expect(stateIcon).toBeInTheDocument()
  })

  it('renders automated transition icon', () => {
    const { container } = render(<StateMachineLegend />)
    
    const transitionIcons = container.querySelectorAll('.icon-transition')
    expect(transitionIcons.length).toBeGreaterThan(0)
  })

  it('renders manual transition icon', () => {
    const { container } = render(<StateMachineLegend />)
    
    const manualIcon = container.querySelector('.icon-transition-manual')
    expect(manualIcon).toBeInTheDocument()
  })

  it('renders criteria icon', () => {
    const { container } = render(<StateMachineLegend />)
    
    const criteriaIcon = container.querySelector('.icon-criteria')
    expect(criteriaIcon).toBeInTheDocument()
  })

  it('renders process icon', () => {
    const { container } = render(<StateMachineLegend />)
    
    const processIcon = container.querySelector('.icon-process')
    expect(processIcon).toBeInTheDocument()
  })

  it('renders process edge icon', () => {
    const { container } = render(<StateMachineLegend />)
    
    const processEdgeIcon = container.querySelector('.icon-process-edge')
    expect(processEdgeIcon).toBeInTheDocument()
  })

  it('renders all figures', () => {
    const { container } = render(<StateMachineLegend />)
    
    const figures = container.querySelectorAll('figure')
    expect(figures.length).toBe(5)
  })

  it('applies custom className', () => {
    const { container } = render(
      <StateMachineLegend className="custom-class" />
    )
    
    const legend = container.querySelector('.legend')
    expect(legend).toHaveClass('custom-class')
  })

  it('renders transition with criteria showing three elements', () => {
    const { container } = render(<StateMachineLegend />)
    
    const figures = container.querySelectorAll('figure')
    // Fourth figure should have transition + criteria + transition
    const criteriaFigure = figures[3]
    const transitions = criteriaFigure.querySelectorAll('.icon-transition')
    const criteria = criteriaFigure.querySelectorAll('.icon-criteria')
    
    expect(transitions.length).toBe(2)
    expect(criteria.length).toBe(1)
  })
})

