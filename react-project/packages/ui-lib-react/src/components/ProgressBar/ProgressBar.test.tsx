import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('renders with percent', () => {
    const { container } = render(<ProgressBar percent={50} />)
    
    const progress = container.querySelector('.ant-progress')
    expect(progress).toBeInTheDocument()
  })

  it('displays percent text by default', () => {
    render(<ProgressBar percent={75} />)
    
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('hides percent text when showInfo is false', () => {
    render(<ProgressBar percent={75} showInfo={false} />)
    
    expect(screen.queryByText('75%')).not.toBeInTheDocument()
  })

  it('renders with success status', () => {
    const { container } = render(<ProgressBar percent={100} status="success" />)
    
    const progress = container.querySelector('.ant-progress-status-success')
    expect(progress).toBeInTheDocument()
  })

  it('renders with exception status', () => {
    const { container } = render(<ProgressBar percent={50} status="exception" />)
    
    const progress = container.querySelector('.ant-progress-status-exception')
    expect(progress).toBeInTheDocument()
  })

  it('renders with active status', () => {
    const { container } = render(<ProgressBar percent={50} status="active" />)
    
    const progress = container.querySelector('.ant-progress-status-active')
    expect(progress).toBeInTheDocument()
  })

  it('renders as line type by default', () => {
    const { container } = render(<ProgressBar percent={50} />)
    
    const line = container.querySelector('.ant-progress-line')
    expect(line).toBeInTheDocument()
  })

  it('renders as circle type', () => {
    const { container } = render(<ProgressBar percent={50} type="circle" />)
    
    const circle = container.querySelector('.ant-progress-circle')
    expect(circle).toBeInTheDocument()
  })

  it('renders as dashboard type', () => {
    const { container } = render(<ProgressBar percent={50} type="dashboard" />)
    
    const dashboard = container.querySelector('.ant-progress-circle')
    expect(dashboard).toBeInTheDocument()
  })

  it('renders with custom stroke color', () => {
    const { container } = render(<ProgressBar percent={50} strokeColor="#ff0000" />)
    
    const progress = container.querySelector('.ant-progress')
    expect(progress).toBeInTheDocument()
  })

  it('renders with small size', () => {
    const { container } = render(<ProgressBar percent={50} size="small" />)
    
    const progress = container.querySelector('.ant-progress')
    expect(progress).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ProgressBar percent={50} className="custom-class" />)
    
    const progress = container.querySelector('.progress-bar')
    expect(progress).toHaveClass('custom-class')
  })

  it('renders with 0 percent', () => {
    render(<ProgressBar percent={0} />)
    
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('renders with 100 percent', () => {
    const { container } = render(<ProgressBar percent={100} />)

    const progress = container.querySelector('.ant-progress')
    expect(progress).toBeInTheDocument()
    // At 100%, Ant Design may show a checkmark instead of text
  })

  it('renders with all props combined', () => {
    render(
      <ProgressBar
        percent={75}
        status="active"
        showInfo={true}
        strokeColor="#1890ff"
        type="line"
        size="default"
        className="test-progress"
      />
    )
    
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('renders multiple progress bars', () => {
    render(
      <>
        <ProgressBar percent={25} />
        <ProgressBar percent={50} />
        <ProgressBar percent={75} />
      </>
    )
    
    expect(screen.getByText('25%')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })
})

