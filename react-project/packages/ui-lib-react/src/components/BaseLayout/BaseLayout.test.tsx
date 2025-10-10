import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '../../test-utils'
import { BaseLayout } from './BaseLayout'

describe('BaseLayout', () => {
  beforeEach(() => {
    // Mock offsetHeight
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 80
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders header, main, and footer slots', () => {
    render(
      <BaseLayout
        header={<div>Header Content</div>}
        main={<div>Main Content</div>}
        footer={<div>Footer Content</div>}
      />
    )

    expect(screen.getByText('Header Content')).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
    expect(screen.getByText('Footer Content')).toBeInTheDocument()
  })

  it('renders portal slot', () => {
    render(
      <BaseLayout
        portals={<div>Portal Content</div>}
      />
    )

    expect(screen.getByText('Portal Content')).toBeInTheDocument()
  })

  it('applies sticky class to header', () => {
    const { container } = render(
      <BaseLayout header={<div>Header</div>} />
    )

    const header = container.querySelector('header')
    expect(header).toHaveClass('sticky')
  })

  it('applies main class to main element', () => {
    const { container } = render(
      <BaseLayout main={<div>Main</div>} />
    )

    const main = container.querySelector('main')
    expect(main).toHaveClass('main')
  })

  it('renders modal portal target', () => {
    const { container } = render(<BaseLayout />)
    
    const portalTarget = container.querySelector('#modal-portal-target')
    expect(portalTarget).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <BaseLayout className="custom-wrapper" />
    )

    const wrapper = container.querySelector('.app-wrapper')
    expect(wrapper).toHaveClass('custom-wrapper')
  })

  it('handles resize events', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = render(
      <BaseLayout
        header={<div>Header</div>}
        main={<div>Main</div>}
      />
    )

    // Check that resize listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    )

    // Unmount and check cleanup
    unmount()
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    )
  })
})

