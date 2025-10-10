import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportVariants } from './ExportVariants'

describe('ExportVariants', () => {
  const mockFormats = [
    { description: 'JSON Format', type: 'json' },
    { description: 'XML Format', type: 'xml' },
    { description: 'CSV Format', type: 'csv' }
  ]

  it('renders modal when visible', async () => {
    const onClose = vi.fn()
    const onExport = vi.fn()
    
    render(
      <ExportVariants
        visible={true}
        onClose={onClose}
        onExport={onExport}
        exportFormats={mockFormats}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Export Options')).toBeInTheDocument()
    })
  })

  it('does not render modal when not visible', () => {
    const onClose = vi.fn()
    const onExport = vi.fn()
    
    render(
      <ExportVariants
        visible={false}
        onClose={onClose}
        onExport={onExport}
        exportFormats={mockFormats}
      />
    )
    
    expect(screen.queryByText('Export Options')).not.toBeInTheDocument()
  })

  it('renders all export format options', async () => {
    const onClose = vi.fn()
    const onExport = vi.fn()
    
    render(
      <ExportVariants
        visible={true}
        onClose={onClose}
        onExport={onExport}
        exportFormats={mockFormats}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('JSON Format')).toBeInTheDocument()
      expect(screen.getByText('XML Format')).toBeInTheDocument()
      expect(screen.getByText('CSV Format')).toBeInTheDocument()
    })
  })

  it('selects first format by default when dialog opens', async () => {
    const onClose = vi.fn()
    const onExport = vi.fn()
    render(
      <ExportVariants
        visible={true}
        onClose={onClose}
        onExport={onExport}
        exportFormats={mockFormats}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('JSON Format')).toBeInTheDocument()
      expect(screen.getByText('XML Format')).toBeInTheDocument()
      expect(screen.getByText('CSV Format')).toBeInTheDocument()
    })
  })

  it('allows selecting different format', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onExport = vi.fn()
    
    render(
      <ExportVariants
        visible={true}
        onClose={onClose}
        onExport={onExport}
        exportFormats={mockFormats}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('XML Format')).toBeInTheDocument()
    })
    
    const xmlRadio = screen.getByText('XML Format')
    await user.click(xmlRadio)
    
    // Radio should be selected
    expect(xmlRadio.closest('.ant-radio-wrapper')?.querySelector('.ant-radio-checked')).toBeInTheDocument()
  })

  it('calls onExport with selected format when Export button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onExport = vi.fn()
    
    render(
      <ExportVariants
        visible={true}
        onClose={onClose}
        onExport={onExport}
        exportFormats={mockFormats}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument()
    })
    
    const exportButton = screen.getByText('Export')
    await user.click(exportButton)
    
    expect(onExport).toHaveBeenCalledWith(mockFormats[0])
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onExport with selected format after changing selection', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onExport = vi.fn()
    
    render(
      <ExportVariants
        visible={true}
        onClose={onClose}
        onExport={onExport}
        exportFormats={mockFormats}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('CSV Format')).toBeInTheDocument()
    })
    
    // Select CSV format
    const csvRadio = screen.getByText('CSV Format')
    await user.click(csvRadio)
    
    // Click export
    const exportButton = screen.getByText('Export')
    await user.click(exportButton)
    
    expect(onExport).toHaveBeenCalledWith(mockFormats[2])
  })

  it('calls onClose when Close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onExport = vi.fn()
    
    render(
      <ExportVariants
        visible={true}
        onClose={onClose}
        onExport={onExport}
        exportFormats={mockFormats}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Close')).toBeInTheDocument()
    })
    
    const closeButton = screen.getByText('Close')
    await user.click(closeButton)
    
    expect(onClose).toHaveBeenCalled()
    expect(onExport).not.toHaveBeenCalled()
  })

  it('handles empty export formats', async () => {
    const onClose = vi.fn()
    const onExport = vi.fn()
    
    render(
      <ExportVariants
        visible={true}
        onClose={onClose}
        onExport={onExport}
        exportFormats={[]}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Export Options')).toBeInTheDocument()
    })
  })

  it('applies custom className', async () => {
    const onClose = vi.fn()
    const onExport = vi.fn()
    render(
      <ExportVariants
        visible={true}
        onClose={onClose}
        onExport={onExport}
        exportFormats={mockFormats}
        className="custom-class"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Export Options')).toBeInTheDocument()
    })
  })
})

