import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorDetailView } from './ErrorDetailView'
import { ErrorData } from '../../contexts/ErrorHandlerContext'

const mockError: ErrorData = {
  message: 'Test error message',
  info: 'Component error',
  stack: 'Error: Test error\n  at Component',
  createdAt: '1704110400000', // 2024-01-01 12:00:00
  pageUrl: 'http://localhost:3000/test',
  uiVersion: '1.0.0'
}

describe('ErrorDetailView', () => {
  it('renders modal when visible', async () => {
    render(
      <ErrorDetailView
        error={mockError}
        visible={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Error: Test error message/)).toBeInTheDocument()
    })
  })

  it('does not render when not visible', () => {
    render(
      <ErrorDetailView
        error={mockError}
        visible={false}
        onClose={vi.fn()}
      />
    )

    expect(screen.queryByText(/Error: Test error message/)).not.toBeInTheDocument()
  })

  it('displays error details', async () => {
    render(
      <ErrorDetailView
        error={mockError}
        visible={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Last error')).toBeInTheDocument()
    })

    await waitFor(() => {
      const modalBody = document.querySelector('.ant-modal-body')
      expect(modalBody?.textContent).toContain('2024-01-01')
      expect(modalBody?.textContent).toContain('Component error')
      expect(modalBody?.textContent).toContain('http://localhost:3000/test')
      expect(modalBody?.textContent).toContain('1.0.0')
    })
  })

  it('displays events count', async () => {
    render(
      <ErrorDetailView
        error={mockError}
        visible={true}
        onClose={vi.fn()}
        eventsCount={5}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Events')).toBeInTheDocument()
    })

    await waitFor(() => {
      const modalBody = document.querySelector('.ant-modal-body')
      expect(modalBody?.textContent).toContain('5')
    })
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(
      <ErrorDetailView
        error={mockError}
        visible={true}
        onClose={onClose}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Error: Test error message/)).toBeInTheDocument()
    })

    const closeButtons = screen.getAllByRole('button', { name: /close/i })
    await user.click(closeButtons[closeButtons.length - 1])

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onExport when export button is clicked', async () => {
    const user = userEvent.setup()
    const onExport = vi.fn()
    
    render(
      <ErrorDetailView
        error={mockError}
        visible={true}
        onClose={vi.fn()}
        onExport={onExport}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Error: Test error message/)).toBeInTheDocument()
    })

    const exportButton = screen.getByRole('button', { name: /export/i })
    await user.click(exportButton)

    expect(onExport).toHaveBeenCalledWith(mockError)
  })

  it('handles error without optional fields', async () => {
    const minimalError: ErrorData = {
      message: 'Minimal error',
      createdAt: '1704110400000'
    }

    render(
      <ErrorDetailView
        error={minimalError}
        visible={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Error: Minimal error/)).toBeInTheDocument()
    })

    await waitFor(() => {
      const modalBody = document.querySelector('.ant-modal-body')
      expect(modalBody?.textContent).toContain('Last error')
      expect(modalBody?.textContent).toContain('Events')
      // Optional fields should not be present
      expect(modalBody?.textContent).not.toContain('Info')
      expect(modalBody?.textContent).not.toContain('Page')
      expect(modalBody?.textContent).not.toContain('UI version')
      expect(modalBody?.textContent).not.toContain('Stack')
    })
  })

  it('displays stack trace when available', async () => {
    render(
      <ErrorDetailView
        error={mockError}
        visible={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Stack')).toBeInTheDocument()
    })

    await waitFor(() => {
      const modalBody = document.querySelector('.ant-modal-body')
      expect(modalBody?.textContent).toContain('Error: Test error')
    })
  })
})

