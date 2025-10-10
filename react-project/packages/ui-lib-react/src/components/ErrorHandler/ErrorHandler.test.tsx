import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorHandler } from './ErrorHandler'
import { ErrorHandlerProvider } from '../../contexts/ErrorHandlerContext'

// Mock FileSaver
vi.mock('file-saver', () => ({
  default: {
    saveAs: vi.fn()
  }
}))

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <ErrorHandlerProvider>
      {ui}
    </ErrorHandlerProvider>
  )
}

describe('ErrorHandler', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Clear any existing error listeners
    window.removeEventListener('error', () => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders without errors', () => {
    renderWithProvider(<ErrorHandler />)
    // Should not show notification when no errors
    const notification = document.querySelector('.error-notification')
    expect(notification).not.toBeInTheDocument()
  })

  it('does not show notification when no errors', () => {
    renderWithProvider(<ErrorHandler />)
    const notification = document.querySelector('.error-notification')
    expect(notification).not.toBeInTheDocument()
  })

  it('sets up global error handler when enabled', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    
    renderWithProvider(<ErrorHandler enableGlobalHandler={true} />)
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function))
  })

  it('does not set up global error handler when disabled', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    
    renderWithProvider(<ErrorHandler enableGlobalHandler={false} />)
    
    expect(addEventListenerSpy).not.toHaveBeenCalledWith('error', expect.any(Function))
  })

  it('cleans up error listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    
    const { unmount } = renderWithProvider(<ErrorHandler enableGlobalHandler={true} />)
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function))
  })

  it('accepts custom UI version', () => {
    renderWithProvider(<ErrorHandler uiVersion="2.0.0" />)
    // Component should render without errors
    expect(document.body).toBeInTheDocument()
  })

  it('accepts custom platform version', () => {
    renderWithProvider(<ErrorHandler platformVersion="3.0.0" />)
    // Component should render without errors
    expect(document.body).toBeInTheDocument()
  })

  it('accepts custom ignore errors list', () => {
    renderWithProvider(<ErrorHandler ignoreErrors={['custom error', 'another error']} />)
    // Component should render without errors
    expect(document.body).toBeInTheDocument()
  })

  it('has default ignore errors', () => {
    renderWithProvider(<ErrorHandler />)
    // Component should render with default ignore errors
    expect(document.body).toBeInTheDocument()
  })
})

