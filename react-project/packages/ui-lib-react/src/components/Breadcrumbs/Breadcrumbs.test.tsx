import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import { BrowserRouter } from 'react-router-dom'
import { Breadcrumbs } from './Breadcrumbs'
import type { BreadcrumbItem } from './Breadcrumbs'

describe('Breadcrumbs', () => {
  const mockBreadcrumbs: BreadcrumbItem[] = [
    { id: '1', title: 'Home', route: '/' },
    { id: '2', title: 'Products', route: '/products' },
    { id: '3', title: 'Details', route: '/products/123' }
  ]

  const renderBreadcrumbs = (props = {}) => {
    return render(
      <BrowserRouter>
        <Breadcrumbs {...props} />
      </BrowserRouter>
    )
  }

  it('renders breadcrumb items', () => {
    renderBreadcrumbs({ breadcrumbs: mockBreadcrumbs })
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
  })

  it('renders links with correct routes', () => {
    renderBreadcrumbs({ breadcrumbs: mockBreadcrumbs })
    
    const homeLink = screen.getByText('Home').closest('a')
    const productsLink = screen.getByText('Products').closest('a')
    const detailsLink = screen.getByText('Details').closest('a')
    
    expect(homeLink).toHaveAttribute('href', '/')
    expect(productsLink).toHaveAttribute('href', '/products')
    expect(detailsLink).toHaveAttribute('href', '/products/123')
  })

  it('returns null when breadcrumbs array is empty', () => {
    const { container } = renderBreadcrumbs({ breadcrumbs: [] })
    expect(container.firstChild).toBeNull()
  })

  it('returns null when breadcrumbs is undefined', () => {
    const { container } = renderBreadcrumbs()
    expect(container.firstChild).toBeNull()
  })

  it('uses title as key when id is not provided', () => {
    const breadcrumbsWithoutId: BreadcrumbItem[] = [
      { title: 'Home', route: '/' },
      { title: 'Products', route: '/products' }
    ]
    
    renderBreadcrumbs({ breadcrumbs: breadcrumbsWithoutId })
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  it('applies correct CSS class', () => {
    const { container } = renderBreadcrumbs({ breadcrumbs: mockBreadcrumbs })
    expect(container.querySelector('.cyoda-breadcrumbs')).toBeInTheDocument()
  })

  it('renders correct number of breadcrumb items', () => {
    const { container } = renderBreadcrumbs({ breadcrumbs: mockBreadcrumbs })
    const items = container.querySelectorAll('.cyoda-breadcrumbs li')
    expect(items).toHaveLength(3)
  })
})

