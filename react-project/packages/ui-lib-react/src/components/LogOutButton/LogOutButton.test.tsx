import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { LogOutButton } from './LogOutButton'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('LogOutButton', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  afterEach(() => {
    // Clean up any open modals
    const modals = document.body.querySelectorAll('.ant-modal-root')
    modals.forEach(modal => modal.remove())
  })

  const renderLogOutButton = (props = {}) => {
    return render(
      <BrowserRouter>
        <LogOutButton {...props} />
      </BrowserRouter>
    )
  }

  it('renders logout button', () => {
    renderLogOutButton()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('renders with custom button text', () => {
    renderLogOutButton({ buttonText: 'Sign Out' })
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('shows confirmation modal on click', async () => {
    const user = userEvent.setup()
    const { container } = renderLogOutButton()

    const button = container.querySelector('.ant-btn')
    expect(button).toBeInTheDocument()
    await user.click(button!)

    // Modal is rendered in document.body, not in container
    await waitFor(() => {
      const modal = document.body.querySelector('.ant-modal-confirm')
      expect(modal).toBeInTheDocument()
    })
  })

  it('shows custom confirmation message', async () => {
    const user = userEvent.setup()
    const { container } = renderLogOutButton({ confirmMessage: 'Are you sure you want to leave?' })

    const button = container.querySelector('.ant-btn')
    expect(button).toBeInTheDocument()
    await user.click(button!)

    await waitFor(() => {
      const modal = document.body.querySelector('.ant-modal-confirm')
      expect(modal).toBeInTheDocument()
      expect(modal?.textContent).toContain('Are you sure you want to leave?')
    })
  })

  it('shows OK and Cancel buttons in modal', async () => {
    const user = userEvent.setup()
    const { container } = renderLogOutButton()

    const button = container.querySelector('.ant-btn')
    expect(button).toBeInTheDocument()
    await user.click(button!)

    // Wait for modal to appear
    await waitFor(() => {
      const modal = document.body.querySelector('.ant-modal-confirm')
      expect(modal).toBeInTheDocument()
    })

    // Verify buttons exist
    const buttons = document.body.querySelectorAll('.ant-btn')
    const okButton = Array.from(buttons).find(btn => btn.textContent === 'Logout' && btn.classList.contains('ant-btn-primary'))
    const cancelButton = Array.from(buttons).find(btn => btn.textContent === 'Logout and Clear Data')

    expect(okButton).toBeDefined()
    expect(cancelButton).toBeDefined()
  })

  it('renders with danger styling by default', () => {
    const { container } = renderLogOutButton()
    const button = container.querySelector('.ant-btn-dangerous')
    expect(button).toBeInTheDocument()
  })

  it('renders with custom type', () => {
    const { container } = renderLogOutButton({ type: 'primary' })
    const button = container.querySelector('.ant-btn-primary')
    expect(button).toBeInTheDocument()
  })

  it('renders logout icon', () => {
    const { container } = renderLogOutButton()
    const icon = container.querySelector('.anticon-logout')
    expect(icon).toBeInTheDocument()
  })

  it('renders with custom button props', () => {
    const { container } = renderLogOutButton({
      buttonText: 'Sign Out',
      type: 'primary',
      danger: false
    })

    const button = container.querySelector('.ant-btn-primary')
    expect(button).toBeInTheDocument()
    expect(button?.textContent).toContain('Sign Out')
  })
})

