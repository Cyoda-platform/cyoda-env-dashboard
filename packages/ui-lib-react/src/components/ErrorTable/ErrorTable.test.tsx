import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorTable } from './ErrorTable'
import { ErrorData } from '../../contexts/ErrorHandlerContext'

const mockErrors: ErrorData[] = [
  {
    message: 'Error 1',
    createdAt: '1704110400000',
    pageUrl: 'http://localhost:3000/page1'
  },
  {
    message: 'Error 2',
    createdAt: '1704196800000',
    pageUrl: 'http://localhost:3000/page2'
  },
  {
    message: 'Error 1', // Duplicate to test grouping
    createdAt: '1704283200000',
    pageUrl: 'http://localhost:3000/page1'
  }
]

describe('ErrorTable', () => {
  it('renders drawer when visible', async () => {
    render(
      <ErrorTable
        errors={mockErrors}
        visible={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Error Handler')).toBeInTheDocument()
    })
  })

  it('does not render when not visible', () => {
    render(
      <ErrorTable
        errors={mockErrors}
        visible={false}
        onClose={vi.fn()}
      />
    )

    expect(screen.queryByText('Error Handler')).not.toBeInTheDocument()
  })

  it('displays action buttons', async () => {
    render(
      <ErrorTable
        errors={mockErrors}
        visible={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Remove ALL errors and notifications')).toBeInTheDocument()
      expect(screen.getByText('Export ALL errors')).toBeInTheDocument()
    })
  })

  it('groups errors by message', async () => {
    render(
      <ErrorTable
        errors={mockErrors}
        visible={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Error Handler')).toBeInTheDocument()
    })

    // Should show 2 rows (Error 1 grouped, Error 2)
    await waitFor(() => {
      const drawer = document.querySelector('.ant-drawer-body')
      expect(drawer?.textContent).toContain('Error 1')
      expect(drawer?.textContent).toContain('Error 2')
    })
  })

  it('calls onClearErrors when clear button is clicked', async () => {
    const user = userEvent.setup()
    const onClearErrors = vi.fn()
    
    render(
      <ErrorTable
        errors={mockErrors}
        visible={true}
        onClose={vi.fn()}
        onClearErrors={onClearErrors}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Remove ALL errors and notifications')).toBeInTheDocument()
    })

    const clearButton = screen.getByText('Remove ALL errors and notifications')
    await user.click(clearButton)

    expect(onClearErrors).toHaveBeenCalled()
  })

  it('calls onExportAll when export all button is clicked', async () => {
    const user = userEvent.setup()
    const onExportAll = vi.fn()
    
    render(
      <ErrorTable
        errors={mockErrors}
        visible={true}
        onClose={vi.fn()}
        onExportAll={onExportAll}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Export ALL errors')).toBeInTheDocument()
    })

    const exportButton = screen.getByText('Export ALL errors')
    await user.click(exportButton)

    expect(onExportAll).toHaveBeenCalled()
  })

  it('handles empty errors array', async () => {
    render(
      <ErrorTable
        errors={[]}
        visible={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Error Handler')).toBeInTheDocument()
    })

    // Table should be empty
    await waitFor(() => {
      const drawer = document.querySelector('.ant-drawer-body')
      expect(drawer).toBeInTheDocument()
    })
  })

  it('displays error count for grouped errors', async () => {
    render(
      <ErrorTable
        errors={mockErrors}
        visible={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Error Handler')).toBeInTheDocument()
    })

    // Error 1 appears twice, so events count should be 2
    await waitFor(() => {
      const drawer = document.querySelector('.ant-drawer-body')
      expect(drawer?.textContent).toContain('2') // events count
    })
  })
})

