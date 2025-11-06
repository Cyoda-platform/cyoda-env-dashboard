import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import { BrowserRouter } from 'react-router-dom'
import { Home } from './Home'
import type { MenuItem } from './types'

describe('Home', () => {
  const mockMenus: MenuItem[] = [
    {
      name: 'Test Menu 1',
      link: '/test1',
      description: 'Test description 1',
      isRouterLink: true
    },
    {
      name: 'Test Menu 2',
      link: '/test2',
      description: 'Test description 2',
      isRouterLink: false
    },
    {
      name: 'delimiter'
    }
  ]

  const renderHome = (props = {}) => {
    return render(
      <BrowserRouter>
        <Home {...props} />
      </BrowserRouter>
    )
  }

  it('renders without crashing', () => {
    renderHome()
    expect(screen.getByText('Entity Viewer')).toBeInTheDocument()
  })

  it('renders custom menus', () => {
    renderHome({ menus: mockMenus })
    expect(screen.getByText('Test Menu 1')).toBeInTheDocument()
    expect(screen.getByText('Test Menu 2')).toBeInTheDocument()
  })

  it('renders delimiter as hr', () => {
    const { container } = renderHome({ menus: mockMenus })
    const hr = container.querySelector('hr')
    expect(hr).toBeInTheDocument()
  })

  it('applies wrap-home class', () => {
    const { container } = renderHome()
    expect(container.querySelector('.wrap-home')).toBeInTheDocument()
  })

  it('renders menu descriptions', () => {
    renderHome({ menus: mockMenus })
    expect(screen.getByText('Test description 1')).toBeInTheDocument()
    expect(screen.getByText('Test description 2')).toBeInTheDocument()
  })
})

