import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { LoginAuth0Btn } from './LoginAuth0Btn'
import { BrowserRouter } from 'react-router-dom'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('LoginAuth0Btn', () => {
  const renderLoginAuth0Btn = (props = {}) => {
    return render(
      <BrowserRouter>
        <LoginAuth0Btn {...props} />
      </BrowserRouter>
    )
  }

  it('renders button with default text', () => {
    renderLoginAuth0Btn()
    expect(screen.getByText('Login with Auth0')).toBeInTheDocument()
  })

  it('renders button with custom text', () => {
    renderLoginAuth0Btn({ buttonText: 'Sign in with Auth0' })
    expect(screen.getByText('Sign in with Auth0')).toBeInTheDocument()
  })

  it('calls loginWithRedirect when clicked', async () => {
    const user = userEvent.setup()
    const mockLoginWithRedirect = vi.fn()
    
    renderLoginAuth0Btn({ loginWithRedirect: mockLoginWithRedirect })

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockLoginWithRedirect).toHaveBeenCalledTimes(1)
  })

  it('shows loading state when isLoading is true', () => {
    renderLoginAuth0Btn({ isLoading: true })
    const button = screen.getByRole('button')
    expect(button).toHaveClass('ant-btn-loading')
  })

  it('handles authentication flow when user is authenticated', async () => {
    const mockGetAccessTokenSilently = vi.fn().mockResolvedValue('test-token')
    const mockOnAuthSuccess = vi.fn().mockResolvedValue(undefined)
    const mockOnAccountInfo = vi.fn().mockResolvedValue({ data: {} })

    const mockUser = {
      sub: 'auth0|123',
      name: 'Test User',
      email: 'test@example.com'
    }

    renderLoginAuth0Btn({
      isAuthenticated: true,
      user: mockUser,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      onAuthSuccess: mockOnAuthSuccess,
      onAccountInfo: mockOnAccountInfo
    })

    await waitFor(() => {
      expect(mockGetAccessTokenSilently).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockOnAuthSuccess).toHaveBeenCalledWith({
        token: 'test-token',
        refreshToken: null,
        userId: 'auth0|123',
        username: 'Test User',
        type: 'auth0'
      })
    })

    await waitFor(() => {
      expect(mockOnAccountInfo).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('does not trigger auth flow when not authenticated', () => {
    const mockGetAccessTokenSilently = vi.fn()
    const mockOnAuthSuccess = vi.fn()

    renderLoginAuth0Btn({
      isAuthenticated: false,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      onAuthSuccess: mockOnAuthSuccess
    })

    expect(mockGetAccessTokenSilently).not.toHaveBeenCalled()
    expect(mockOnAuthSuccess).not.toHaveBeenCalled()
  })

  it('handles authentication errors gracefully', async () => {
    const mockGetAccessTokenSilently = vi.fn().mockRejectedValue(new Error('Token error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const mockUser = {
      sub: 'auth0|123',
      name: 'Test User'
    }

    renderLoginAuth0Btn({
      isAuthenticated: true,
      user: mockUser,
      getAccessTokenSilently: mockGetAccessTokenSilently
    })

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })

  it('applies custom button type', () => {
    renderLoginAuth0Btn({ buttonType: 'primary' })
    const button = screen.getByRole('button')
    expect(button).toHaveClass('ant-btn-primary')
  })

  it('applies block prop', () => {
    renderLoginAuth0Btn({ block: true })
    const button = screen.getByRole('button')
    expect(button).toHaveClass('ant-btn-block')
  })

  it('applies custom size', () => {
    renderLoginAuth0Btn({ size: 'small' })
    const button = screen.getByRole('button')
    expect(button).toHaveClass('ant-btn-sm')
  })
})

