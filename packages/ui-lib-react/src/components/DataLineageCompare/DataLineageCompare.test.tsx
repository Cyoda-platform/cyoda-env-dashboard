import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { DataLineageCompare } from './DataLineageCompare'
import { createRef } from 'react'
import type { DataLineageCompareRef } from './DataLineageCompare'

// Mock CodeEditor to avoid monaco-editor issues in tests
vi.mock('../CodeEditor', () => ({
  CodeEditor: ({ value, original, language, oldString, newString, diff }: any) => (
    <div data-testid="code-editor">
      <div data-testid="editor-value">{value}</div>
      {original && <div data-testid="editor-original">{original}</div>}
      {language && <div data-testid="editor-language">{language}</div>}
      {diff && <div data-testid="editor-diff">diff</div>}
      {oldString && <div data-testid="editor-old-string">{oldString}</div>}
      {newString && <div data-testid="editor-new-string">{newString}</div>}
    </div>
  )
}))

// Mock getCyodaCloudEntity
const mockGetCyodaCloudEntity = vi.fn()

// Mock HelperFeatureFlags
const mockIsCyodaCloud = vi.fn()

vi.mock('@cyoda/http-api-react', () => ({
  getCyodaCloudEntity: (...args: any[]) => mockGetCyodaCloudEntity(...args),
  HelperFeatureFlags: {
    isCyodaCloud: () => mockIsCyodaCloud(),
  },
}))

const mockTransactions = [
  {
    transactionId: 'txn-001',
    dateTime: '01-01-2024 10:30:00.000'
  },
  {
    transactionId: 'txn-002',
    dateTime: '02-01-2024 14:45:00.000'
  }
]

const mockCompareData = {
  changedFields: [
    {
      columnPath: 'field1',
      columnPathContainer: {
        prevValue: 'old value 1',
        currValue: 'new value 1'
      }
    },
    {
      columnPath: 'field2',
      columnPathContainer: {
        prevValue: 'old value 2',
        currValue: 'new value 2'
      }
    }
  ]
}

describe('DataLineageCompare', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default to non-Cyoda Cloud mode
    mockIsCyodaCloud.mockReturnValue(false)
  })

  it('renders without crashing', () => {
    const { container } = render(<DataLineageCompare />)
    expect(container).toBeInTheDocument()
  })

  it('does not show modal by default', () => {
    render(<DataLineageCompare />)

    const modal = document.querySelector('.data-lineage-compare')
    expect(modal).not.toBeInTheDocument()
  })

  it('shows modal when dialogVisible is set to true via ref', async () => {
    const ref = createRef<DataLineageCompareRef>()
    render(<DataLineageCompare ref={ref} />)

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      expect(screen.getByText('Compare')).toBeInTheDocument()
    })
  })

  it('displays transaction information when visible', async () => {
    const ref = createRef<DataLineageCompareRef>()
    render(
      <DataLineageCompare
        ref={ref}
        checkedTransactions={mockTransactions}
      />
    )

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      expect(screen.getByText('Compare')).toBeInTheDocument()
    })

    // Check that transaction IDs are in the document
    await waitFor(() => {
      const content = document.body.textContent || ''
      expect(content).toContain('txn-001')
      expect(content).toContain('txn-002')
    })
  })

  it('formats dates correctly', async () => {
    const ref = createRef<DataLineageCompareRef>()
    render(
      <DataLineageCompare
        ref={ref}
        checkedTransactions={mockTransactions}
      />
    )

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      const content = document.body.textContent || ''
      expect(content).toContain('01/01/2024')
      expect(content).toContain('02/01/2024')
    })
  })

  it('renders with compare data', async () => {
    const ref = createRef<DataLineageCompareRef>()
    render(
      <DataLineageCompare
        ref={ref}
        compareData={mockCompareData}
        checkedTransactions={mockTransactions}
      />
    )

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      expect(screen.getByText('Compare')).toBeInTheDocument()
    })
  })

  it('handles empty compare data', async () => {
    const ref = createRef<DataLineageCompareRef>()
    render(
      <DataLineageCompare
        ref={ref}
        compareData={{}}
        checkedTransactions={mockTransactions}
      />
    )

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      expect(screen.getByText('Compare')).toBeInTheDocument()
    })
  })

  it('handles empty transactions array', async () => {
    const ref = createRef<DataLineageCompareRef>()
    render(
      <DataLineageCompare
        ref={ref}
        checkedTransactions={[]}
      />
    )

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      expect(screen.getByText('Compare')).toBeInTheDocument()
    })
  })

  it('applies custom className', async () => {
    const ref = createRef<DataLineageCompareRef>()
    render(
      <DataLineageCompare
        ref={ref}
        className="custom-class"
      />
    )

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      const modal = document.querySelector('.data-lineage-compare')
      expect(modal).toHaveClass('custom-class')
    })
  })

  it('exposes dialogVisible state via ref', () => {
    const ref = createRef<DataLineageCompareRef>()
    render(<DataLineageCompare ref={ref} />)

    expect(ref.current?.dialogVisible).toBe(false)
  })

  it('exposes setDialogVisible method via ref', () => {
    const ref = createRef<DataLineageCompareRef>()
    render(<DataLineageCompare ref={ref} />)

    expect(typeof ref.current?.setDialogVisible).toBe('function')
  })

  describe('Cyoda Cloud Mode', () => {
    const mockOldEntity = { id: '123', name: 'Old Entity', field: 'old value' }
    const mockNewEntity = { id: '123', name: 'New Entity', field: 'new value' }

    beforeEach(() => {
      mockIsCyodaCloud.mockReturnValue(true)
      mockGetCyodaCloudEntity.mockReset()
    })

    it('should fetch both entity versions when dialog opens', async () => {
      mockGetCyodaCloudEntity
        .mockResolvedValueOnce({ data: mockOldEntity })
        .mockResolvedValueOnce({ data: mockNewEntity })

      const ref = createRef<DataLineageCompareRef>()
      render(
        <DataLineageCompare
          ref={ref}
          entityId="entity-123"
          checkedTransactions={mockTransactions}
        />
      )

      ref.current?.setDialogVisible(true)

      await waitFor(() => {
        expect(mockGetCyodaCloudEntity).toHaveBeenCalledTimes(2)
        expect(mockGetCyodaCloudEntity).toHaveBeenCalledWith('entity-123', 'txn-001')
        expect(mockGetCyodaCloudEntity).toHaveBeenCalledWith('entity-123', 'txn-002')
      })
    })

    it('should use json language for diff editor in Cyoda Cloud mode', async () => {
      mockGetCyodaCloudEntity
        .mockResolvedValueOnce({ data: mockOldEntity })
        .mockResolvedValueOnce({ data: mockNewEntity })

      const ref = createRef<DataLineageCompareRef>()
      render(
        <DataLineageCompare
          ref={ref}
          entityId="entity-123"
          checkedTransactions={mockTransactions}
        />
      )

      ref.current?.setDialogVisible(true)

      await waitFor(() => {
        const languageElement = screen.getByTestId('editor-language')
        expect(languageElement).toHaveTextContent('json')
      })
    })

    it('should display loading state while fetching entities', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: any) => void
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      mockGetCyodaCloudEntity.mockReturnValue(pendingPromise)

      const ref = createRef<DataLineageCompareRef>()
      render(
        <DataLineageCompare
          ref={ref}
          entityId="entity-123"
          checkedTransactions={mockTransactions}
        />
      )

      ref.current?.setDialogVisible(true)

      await waitFor(() => {
        // Check for loading spinner (Ant Design Spin component)
        const spinner = document.querySelector('.ant-spin')
        expect(spinner).toBeInTheDocument()
      })

      // Resolve the promise to clean up
      resolvePromise!({ data: mockOldEntity })
    })

    it('should display error message when fetch fails', async () => {
      mockGetCyodaCloudEntity.mockRejectedValue(new Error('Network error'))

      const ref = createRef<DataLineageCompareRef>()
      render(
        <DataLineageCompare
          ref={ref}
          entityId="entity-123"
          checkedTransactions={mockTransactions}
        />
      )

      ref.current?.setDialogVisible(true)

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch entity versions/i)).toBeInTheDocument()
      })
    })

    it('should not fetch entities when entityId is not provided', async () => {
      const ref = createRef<DataLineageCompareRef>()
      render(
        <DataLineageCompare
          ref={ref}
          checkedTransactions={mockTransactions}
        />
      )

      ref.current?.setDialogVisible(true)

      await waitFor(() => {
        expect(screen.getByText('Compare')).toBeInTheDocument()
      })

      expect(mockGetCyodaCloudEntity).not.toHaveBeenCalled()
    })

    it('should not fetch entities when less than 2 transactions are selected', async () => {
      const ref = createRef<DataLineageCompareRef>()
      render(
        <DataLineageCompare
          ref={ref}
          entityId="entity-123"
          checkedTransactions={[mockTransactions[0]]}
        />
      )

      ref.current?.setDialogVisible(true)

      await waitFor(() => {
        expect(screen.getByText('Compare')).toBeInTheDocument()
      })

      expect(mockGetCyodaCloudEntity).not.toHaveBeenCalled()
    })

    it('should display JSON stringified entity data in diff editor', async () => {
      mockGetCyodaCloudEntity
        .mockResolvedValueOnce({ data: mockOldEntity })
        .mockResolvedValueOnce({ data: mockNewEntity })

      const ref = createRef<DataLineageCompareRef>()
      render(
        <DataLineageCompare
          ref={ref}
          entityId="entity-123"
          checkedTransactions={mockTransactions}
        />
      )

      ref.current?.setDialogVisible(true)

      await waitFor(() => {
        // Check that the new entity JSON is passed to the diff editor's newString prop
        const editorNewString = screen.getByTestId('editor-new-string')
        expect(editorNewString.textContent).toContain('New Entity')

        // Also verify the old entity is passed to oldString prop
        const editorOldString = screen.getByTestId('editor-old-string')
        expect(editorOldString.textContent).toContain('Old Entity')
      })
    })
  })

  describe('Standard Mode (non-Cyoda Cloud)', () => {
    beforeEach(() => {
      mockIsCyodaCloud.mockReturnValue(false)
    })

    it('should use plain language for diff editor', async () => {
      const ref = createRef<DataLineageCompareRef>()
      render(
        <DataLineageCompare
          ref={ref}
          compareData={mockCompareData}
          checkedTransactions={mockTransactions}
        />
      )

      ref.current?.setDialogVisible(true)

      await waitFor(() => {
        const languageElement = screen.getByTestId('editor-language')
        expect(languageElement).toHaveTextContent('plain')
      })
    })

    it('should not call getCyodaCloudEntity', async () => {
      const ref = createRef<DataLineageCompareRef>()
      render(
        <DataLineageCompare
          ref={ref}
          entityId="entity-123"
          compareData={mockCompareData}
          checkedTransactions={mockTransactions}
        />
      )

      ref.current?.setDialogVisible(true)

      await waitFor(() => {
        expect(screen.getByText('Compare')).toBeInTheDocument()
      })

      expect(mockGetCyodaCloudEntity).not.toHaveBeenCalled()
    })
  })
})

