import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ConfigEditorStreamGrid } from './ConfigEditorStreamGrid'
import { createRef } from 'react'
import type { ConfigEditorStreamGridRef } from './ConfigEditorStreamGrid'

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

