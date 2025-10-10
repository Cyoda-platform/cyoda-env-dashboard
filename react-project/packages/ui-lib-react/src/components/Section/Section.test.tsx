import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Section } from './Section'
import { Button } from 'antd'

describe('Section', () => {
  it('renders children', () => {
    render(
      <Section>
        <div>Content</div>
      </Section>
    )
    
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders with title', () => {
    render(
      <Section title="Section Title">
        <div>Content</div>
      </Section>
    )
    
    expect(screen.getByText('Section Title')).toBeInTheDocument()
  })

  it('renders with title and subtitle', () => {
    render(
      <Section title="Section Title" subtitle="Section Subtitle">
        <div>Content</div>
      </Section>
    )
    
    expect(screen.getByText('Section Title')).toBeInTheDocument()
    expect(screen.getByText('Section Subtitle')).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    const { container } = render(
      <Section title="Section Title">
        <div>Content</div>
      </Section>
    )
    
    const subtitle = container.querySelector('.section-subtitle')
    expect(subtitle).not.toBeInTheDocument()
  })

  it('renders with extra content', () => {
    render(
      <Section title="Section Title" extra={<Button>Action</Button>}>
        <div>Content</div>
      </Section>
    )
    
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('renders with bordered true by default', () => {
    const { container } = render(
      <Section>
        <div>Content</div>
      </Section>
    )
    
    const card = container.querySelector('.ant-card-bordered')
    expect(card).toBeInTheDocument()
  })

  it('renders without border when bordered is false', () => {
    const { container } = render(
      <Section bordered={false}>
        <div>Content</div>
      </Section>
    )
    
    const card = container.querySelector('.ant-card-bordered')
    expect(card).not.toBeInTheDocument()
  })

  it('renders in loading state', () => {
    const { container } = render(
      <Section loading>
        <div>Content</div>
      </Section>
    )
    
    const loading = container.querySelector('.ant-card-loading')
    expect(loading).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Section className="custom-class">
        <div>Content</div>
      </Section>
    )
    
    const section = container.querySelector('.section')
    expect(section).toHaveClass('custom-class')
  })

  it('renders without title', () => {
    const { container } = render(
      <Section>
        <div>Content</div>
      </Section>
    )
    
    const header = container.querySelector('.section-header')
    expect(header).not.toBeInTheDocument()
  })

  it('renders with all props combined', () => {
    render(
      <Section
        title="Test Section"
        subtitle="Test Subtitle"
        extra={<Button>Extra</Button>}
        bordered={true}
        loading={false}
        className="test-class"
      >
        <div>Test Content</div>
      </Section>
    )
    
    expect(screen.getByText('Test Section')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
    expect(screen.getByText('Extra')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders multiple children', () => {
    render(
      <Section title="Section">
        <div>First</div>
        <div>Second</div>
        <div>Third</div>
      </Section>
    )
    
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()
  })
})

