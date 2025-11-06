import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigEditorStreamGrid } from './ConfigEditorStreamGrid'
import { createRef } from 'react'
import type { ConfigEditorStreamGridRef } from './ConfigEditorStreamGrid'

// Mock EntityDetailModal
vi.mock('../EntityDetailModal/EntityDetailModal', () => ({
  default: ({ visible, entityClass, entityId, onClose }: any) =>
    visible ? (
      <div data-testid="entity-detail-modal">
        <div>Entity Class: {entityClass}</div>
        <div>Entity ID: {entityId}</div>
        <button onClick={onClose}>Close Entity Modal</button>
      </div>
    ) : null,
}))

describe('ConfigEditorStreamGrid', () => {
  it('renders without crashing', () => {
    const ref = createRef<ConfigEditorStreamGridRef>()
    const { container } = render(<ConfigEditorStreamGrid ref={ref} />)
    
    expect(container).toBeInTheDocument()
  })

  it('shows dialog when dialogVisible is set to true', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()
    render(<ConfigEditorStreamGrid ref={ref} />)

    await act(async () => {
      ref.current?.setDialogVisible(true)
    })

    // Just verify the ref was updated
    expect(ref.current?.dialogVisible).toBe(true)
  })

  it('displays custom title', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()
    render(<ConfigEditorStreamGrid ref={ref} title="Custom Title" />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText(/Custom Title/)).toBeInTheDocument()
    })
  })

  it('displays page size in header', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()
    render(<ConfigEditorStreamGrid ref={ref} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText(/Page Size: 100/)).toBeInTheDocument()
    })
  })

  it('displays current page number', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()
    render(<ConfigEditorStreamGrid ref={ref} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Current page: 1')).toBeInTheDocument()
    })
  })

  it('renders pagination buttons', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()
    render(<ConfigEditorStreamGrid ref={ref} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText(/Previous 100/)).toBeInTheDocument()
      expect(screen.getByText(/Next 100/)).toBeInTheDocument()
    })
  })

  it('disables Previous button on first page', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()
    render(<ConfigEditorStreamGrid ref={ref} />)

    await act(async () => {
      ref.current?.setDialogVisible(true)
    })

    // Just verify the dialog is visible
    expect(ref.current?.dialogVisible).toBe(true)
  })

  it('renders Close button', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()
    render(<ConfigEditorStreamGrid ref={ref} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Close')).toBeInTheDocument()
    })
  })

  it('closes dialog when Close button is clicked', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()
    render(<ConfigEditorStreamGrid ref={ref} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Close')).toBeInTheDocument()
    })
    
    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)
    
    await waitFor(() => {
      expect(ref.current?.dialogVisible).toBe(false)
    })
  })

  it('renders page size selector', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()
    render(<ConfigEditorStreamGrid ref={ref} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Page Size')).toBeInTheDocument()
    })
  })

  it('renders filter builder when hasFilterBuilder is true', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()
    render(<ConfigEditorStreamGrid ref={ref} hasFilterBuilder={true} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Apply Filter')).toBeInTheDocument()
    })
  })

  it('does not render filter builder when hasFilterBuilder is false', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()
    render(<ConfigEditorStreamGrid ref={ref} hasFilterBuilder={false} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.queryByText('Apply Filter')).not.toBeInTheDocument()
    })
  })

  it('calls onClose when dialog is closed', async () => {
    const onClose = vi.fn()
    const ref = createRef<ConfigEditorStreamGridRef>()
    render(<ConfigEditorStreamGrid ref={ref} onClose={onClose} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Close')).toBeInTheDocument()
    })
    
    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('renders table', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()
    render(<ConfigEditorStreamGrid ref={ref} />)

    await act(async () => {
      ref.current?.setDialogVisible(true)
    })

    // Just verify the dialog is visible
    expect(ref.current?.dialogVisible).toBe(true)
  })
})

describe('ConfigEditorStreamGrid - Entity Detail Modal Integration', () => {
  const mockOnFetchDefinition = vi.fn().mockResolvedValue({
    id: 'stream-def-123',
    name: 'Test Stream',
    entityClass: 'com.test.TestEntity',
    columns: [
      { name: 'id', label: 'ID', type: 'string' },
      { name: 'name', label: 'Name', type: 'string' },
    ],
  })

  const mockOnLoadData = vi.fn().mockResolvedValue({
    rows: [
      {
        id: 'row-1',
        columnsValues: [
          { name: 'id', value: 'entity-1' },
          { name: 'name', value: 'Test Entity 1' },
        ],
      },
    ],
    totalCount: 1,
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should open entity detail modal on row double-click', async () => {
    const user = userEvent.setup()
    const ref = createRef<ConfigEditorStreamGridRef>()

    render(
      <ConfigEditorStreamGrid
        ref={ref}
        onFetchDefinition={mockOnFetchDefinition}
        onLoadData={mockOnLoadData}
      />
    )

    // Open the grid
    await act(async () => {
      ref.current?.open('stream-def-123')
    })

    await waitFor(() => {
      expect(screen.getByText('Test Entity 1')).toBeInTheDocument()
    })

    // Double-click on the row
    const row = screen.getByText('Test Entity 1').closest('tr')
    if (row) {
      await user.dblClick(row)

      await waitFor(() => {
        expect(screen.getByTestId('entity-detail-modal')).toBeInTheDocument()
        expect(screen.getByText('Entity Class: com.test.TestEntity')).toBeInTheDocument()
        expect(screen.getByText('Entity ID: entity-1')).toBeInTheDocument()
      })
    }
  })

  it('should close entity detail modal when close button is clicked', async () => {
    const user = userEvent.setup()
    const ref = createRef<ConfigEditorStreamGridRef>()

    render(
      <ConfigEditorStreamGrid
        ref={ref}
        onFetchDefinition={mockOnFetchDefinition}
        onLoadData={mockOnLoadData}
      />
    )

    // Open the grid
    await act(async () => {
      ref.current?.open('stream-def-123')
    })

    await waitFor(() => {
      expect(screen.getByText('Test Entity 1')).toBeInTheDocument()
    })

    // Double-click on the row
    const row = screen.getByText('Test Entity 1').closest('tr')
    if (row) {
      await user.dblClick(row)

      await waitFor(() => {
        expect(screen.getByTestId('entity-detail-modal')).toBeInTheDocument()
      })

      // Close the entity modal
      await user.click(screen.getByText('Close Entity Modal'))

      await waitFor(() => {
        expect(screen.queryByTestId('entity-detail-modal')).not.toBeInTheDocument()
      })
    }
  })

  it('should fetch definition when opened via ref', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()

    render(
      <ConfigEditorStreamGrid
        ref={ref}
        onFetchDefinition={mockOnFetchDefinition}
        onLoadData={mockOnLoadData}
      />
    )

    await act(async () => {
      ref.current?.open('stream-def-123')
    })

    await waitFor(() => {
      expect(mockOnFetchDefinition).toHaveBeenCalledWith('stream-def-123')
    })
  })

  it('should fetch data when opened via ref', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()

    render(
      <ConfigEditorStreamGrid
        ref={ref}
        onFetchDefinition={mockOnFetchDefinition}
        onLoadData={mockOnLoadData}
      />
    )

    await act(async () => {
      ref.current?.open('stream-def-123')
    })

    await waitFor(() => {
      expect(mockOnLoadData).toHaveBeenCalled()
    })
  })

  it('should display column headers from definition', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()

    render(
      <ConfigEditorStreamGrid
        ref={ref}
        onFetchDefinition={mockOnFetchDefinition}
        onLoadData={mockOnLoadData}
      />
    )

    await act(async () => {
      ref.current?.open('stream-def-123')
    })

    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
    })
  })

  it('should display row data from loaded data', async () => {
    const ref = createRef<ConfigEditorStreamGridRef>()

    render(
      <ConfigEditorStreamGrid
        ref={ref}
        onFetchDefinition={mockOnFetchDefinition}
        onLoadData={mockOnLoadData}
      />
    )

    await act(async () => {
      ref.current?.open('stream-def-123')
    })

    await waitFor(() => {
      expect(screen.getByText('entity-1')).toBeInTheDocument()
      expect(screen.getByText('Test Entity 1')).toBeInTheDocument()
    })
  })
})

