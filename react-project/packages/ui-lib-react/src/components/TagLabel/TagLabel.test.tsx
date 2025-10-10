import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TagLabel } from './TagLabel'
import { CheckCircleOutlined } from '@ant-design/icons'

describe('TagLabel', () => {
  it('renders children', () => {
    render(<TagLabel>Test Tag</TagLabel>)
    
    expect(screen.getByText('Test Tag')).toBeInTheDocument()
  })

  it('renders with color', () => {
    const { container } = render(<TagLabel color="blue">Blue Tag</TagLabel>)
    
    const tag = container.querySelector('.ant-tag-blue')
    expect(tag).toBeInTheDocument()
  })

  it('renders with success color', () => {
    const { container } = render(<TagLabel color="success">Success</TagLabel>)
    
    const tag = container.querySelector('.ant-tag-success')
    expect(tag).toBeInTheDocument()
  })

  it('renders with error color', () => {
    const { container } = render(<TagLabel color="error">Error</TagLabel>)
    
    const tag = container.querySelector('.ant-tag-error')
    expect(tag).toBeInTheDocument()
  })

  it('renders as closable', () => {
    const { container } = render(<TagLabel closable>Closable</TagLabel>)
    
    const closeIcon = container.querySelector('.anticon-close')
    expect(closeIcon).toBeInTheDocument()
  })

  it('calls onClose when close icon is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(
      <TagLabel closable onClose={onClose}>
        Closable Tag
      </TagLabel>
    )
    
    const closeIcon = container.querySelector('.anticon-close')
    if (closeIcon) {
      fireEvent.click(closeIcon)
      expect(onClose).toHaveBeenCalledTimes(1)
    }
  })

  it('renders with icon', () => {
    const { container } = render(
      <TagLabel icon={<CheckCircleOutlined />}>
        With Icon
      </TagLabel>
    )
    
    const icon = container.querySelector('.anticon-check-circle')
    expect(icon).toBeInTheDocument()
  })

  it('renders with bordered by default', () => {
    const { container } = render(<TagLabel>Bordered</TagLabel>)
    
    const tag = container.querySelector('.ant-tag')
    expect(tag).toBeInTheDocument()
  })

  it('renders without border when bordered is false', () => {
    const { container } = render(<TagLabel bordered={false}>No Border</TagLabel>)
    
    const tag = container.querySelector('.ant-tag-borderless')
    expect(tag).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<TagLabel className="custom-class">Custom</TagLabel>)
    
    const tag = container.querySelector('.tag-label')
    expect(tag).toHaveClass('custom-class')
  })

  it('renders with all props combined', () => {
    const onClose = vi.fn()
    render(
      <TagLabel
        color="blue"
        closable
        onClose={onClose}
        icon={<CheckCircleOutlined />}
        bordered={true}
        className="test-tag"
      >
        Complete Tag
      </TagLabel>
    )
    
    expect(screen.getByText('Complete Tag')).toBeInTheDocument()
  })

  it('renders multiple tags', () => {
    render(
      <>
        <TagLabel>Tag 1</TagLabel>
        <TagLabel>Tag 2</TagLabel>
        <TagLabel>Tag 3</TagLabel>
      </>
    )
    
    expect(screen.getByText('Tag 1')).toBeInTheDocument()
    expect(screen.getByText('Tag 2')).toBeInTheDocument()
    expect(screen.getByText('Tag 3')).toBeInTheDocument()
  })

  it('renders with different colors', () => {
    const colors = ['blue', 'green', 'red', 'orange', 'purple']
    
    colors.forEach(color => {
      const { unmount } = render(<TagLabel color={color}>{color}</TagLabel>)
      expect(screen.getByText(color)).toBeInTheDocument()
      unmount()
    })
  })

  it('renders with long text', () => {
    const longText = 'This is a very long tag text that should still render correctly'
    render(<TagLabel>{longText}</TagLabel>)
    
    expect(screen.getByText(longText)).toBeInTheDocument()
  })
})

