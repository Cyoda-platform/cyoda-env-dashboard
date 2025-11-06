import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionDivider } from './SectionDivider'

describe('SectionDivider', () => {
  it('renders without text', () => {
    const { container } = render(<SectionDivider />)
    
    const divider = container.querySelector('.section-divider')
    expect(divider).toBeInTheDocument()
  })

  it('renders with text', () => {
    render(<SectionDivider text="Section Title" />)
    
    expect(screen.getByText('Section Title')).toBeInTheDocument()
  })

  it('renders with left orientation', () => {
    render(<SectionDivider text="Left" orientation="left" />)

    expect(screen.getByText('Left')).toBeInTheDocument()
  })

  it('renders with right orientation', () => {
    render(<SectionDivider text="Right" orientation="right" />)

    expect(screen.getByText('Right')).toBeInTheDocument()
  })

  it('renders with center orientation by default', () => {
    render(<SectionDivider text="Center" />)

    expect(screen.getByText('Center')).toBeInTheDocument()
  })

  it('renders as dashed', () => {
    const { container } = render(<SectionDivider dashed />)
    
    const divider = container.querySelector('.ant-divider-dashed')
    expect(divider).toBeInTheDocument()
  })

  it('renders as solid by default', () => {
    const { container } = render(<SectionDivider />)
    
    const divider = container.querySelector('.ant-divider-dashed')
    expect(divider).not.toBeInTheDocument()
  })

  it('renders as horizontal by default', () => {
    const { container } = render(<SectionDivider />)
    
    const divider = container.querySelector('.ant-divider-horizontal')
    expect(divider).toBeInTheDocument()
  })

  it('renders as vertical', () => {
    const { container } = render(<SectionDivider type="vertical" />)
    
    const divider = container.querySelector('.ant-divider-vertical')
    expect(divider).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<SectionDivider className="custom-class" />)
    
    const divider = container.querySelector('.section-divider')
    expect(divider).toHaveClass('custom-class')
  })

  it('renders with orientation margin', () => {
    const { container } = render(
      <SectionDivider text="Text" orientationMargin={20} />
    )
    
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('renders with all props combined', () => {
    render(
      <SectionDivider
        text="Complete Divider"
        orientation="left"
        orientationMargin={10}
        dashed={true}
        type="horizontal"
        className="test-divider"
      />
    )
    
    expect(screen.getByText('Complete Divider')).toBeInTheDocument()
  })

  it('renders with long text', () => {
    const longText = 'This is a very long divider text that should still render correctly'
    render(<SectionDivider text={longText} />)
    
    expect(screen.getByText(longText)).toBeInTheDocument()
  })
})

