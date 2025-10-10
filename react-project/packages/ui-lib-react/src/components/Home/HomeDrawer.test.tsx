import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { HomeDrawer } from './HomeDrawer'
import type { MenuItem } from './types'

describe('HomeDrawer', () => {
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
    }
  ]

  const renderHomeDrawer = (props = {}, initialPath = '/test') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="*" element={<HomeDrawer {...props} />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders menu icon when not on home page', () => {
    const { container } = renderHomeDrawer({}, '/test')
    const menuIcon = container.querySelector('.wrap-bars')
    expect(menuIcon).toBeInTheDocument()
  })

  it('does not render menu icon on home page', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomeDrawer />} />
        </Routes>
      </MemoryRouter>
    )
    const menuIcon = container.querySelector('.wrap-bars')
    expect(menuIcon).not.toBeInTheDocument()
  })

  it('opens drawer when menu icon is clicked', async () => {
    const user = userEvent.setup()
    const { container } = renderHomeDrawer({}, '/test')

    const menuIcon = container.querySelector('.wrap-bars')
    expect(menuIcon).toBeInTheDocument()
    await user.click(menuIcon!)

    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('renders custom menus in drawer', async () => {
    const user = userEvent.setup()
    const { container } = renderHomeDrawer({ menus: mockMenus }, '/test')

    const menuIcon = container.querySelector('.wrap-bars')
    expect(menuIcon).toBeInTheDocument()
    await user.click(menuIcon!)

    expect(screen.getByText('Test Menu 1')).toBeInTheDocument()
    expect(screen.getByText('Test Menu 2')).toBeInTheDocument()
  })

  it('does not display descriptions in drawer', async () => {
    const user = userEvent.setup()
    const { container } = renderHomeDrawer({ menus: mockMenus }, '/test')

    const menuIcon = container.querySelector('.wrap-bars')
    expect(menuIcon).toBeInTheDocument()
    await user.click(menuIcon!)

    expect(screen.queryByText('Test description 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Test description 2')).not.toBeInTheDocument()
  })
})

