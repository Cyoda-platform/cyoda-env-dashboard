import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DividerLine } from './DividerLine'

describe('DividerLine', () => {
  it('renders without crashing', () => {
    const { container } = render(<DividerLine />)
    
    expect(container.querySelector('.ant-divider')).toBeInTheDocument()
  })

  it('renders with text', () => {
    render(<DividerLine>Divider Text</DividerLine>)
    
    expect(screen.getByText('Divider Text')).toBeInTheDocument()
  })

  it('renders as horizontal by default', () => {
    const { container } = render(<DividerLine />)
    
    const divider = container.querySelector('.ant-divider-horizontal')
    expect(divider).toBeInTheDocument()
  })

  it('renders as vertical', () => {
    const { container } = render(<DividerLine type="vertical" />)
    
    const divider = container.querySelector('.ant-divider-vertical')
    expect(divider).toBeInTheDocument()
  })

  it('renders with dashed style', () => {
    const { container } = render(<DividerLine dashed />)
    
    const divider = container.querySelector('.ant-divider-dashed')
    expect(divider).toBeInTheDocument()
  })

  it('renders with left orientation', () => {
    render(<DividerLine orientation="left">Left</DividerLine>)

    expect(screen.getByText('Left')).toBeInTheDocument()
  })

  it('renders with right orientation', () => {
    render(<DividerLine orientation="right">Right</DividerLine>)

    expect(screen.getByText('Right')).toBeInTheDocument()
  })

  it('renders with center orientation by default', () => {
    const { container } = render(<DividerLine>Center</DividerLine>)
    
    const divider = container.querySelector('.ant-divider-with-text-center')
    expect(divider).toBeInTheDocument()
  })

  it('renders with plain style', () => {
    const { container } = render(<DividerLine plain>Plain</DividerLine>)
    
    const divider = container.querySelector('.ant-divider-plain')
    expect(divider).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<DividerLine className="custom-class" />)
    
    const divider = container.querySelector('.divider-line')
    expect(divider).toHaveClass('custom-class')
  })

  it('renders without text', () => {
    const { container } = render(<DividerLine />)
    
    const divider = container.querySelector('.ant-divider')
    expect(divider).toBeInTheDocument()
  })

  it('renders with all props combined', () => {
    render(
      <DividerLine
        orientation="left"
        dashed
        plain
        type="horizontal"
        className="test-divider"
      >
        Test Text
      </DividerLine>
    )
    
    expect(screen.getByText('Test Text')).toBeInTheDocument()
  })
})

