import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DrawerComponent } from './DrawerComponent'

describe('DrawerComponent', () => {
  it('renders without crashing when open', async () => {
    render(<DrawerComponent open={true} title="Test Drawer" />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Drawer')).toBeInTheDocument()
    })
  })

  it('does not render when closed', () => {
    render(<DrawerComponent open={false} title="Test Drawer" />)
    
    expect(screen.queryByText('Test Drawer')).not.toBeInTheDocument()
  })

  it('renders with title', async () => {
    render(<DrawerComponent open={true} title="Drawer Title" />)
    
    await waitFor(() => {
      expect(screen.getByText('Drawer Title')).toBeInTheDocument()
    })
  })

  it('renders with children content', async () => {
    render(
      <DrawerComponent open={true} title="Test">
        <div>Drawer Content</div>
      </DrawerComponent>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Drawer Content')).toBeInTheDocument()
    })
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(<DrawerComponent open={true} title="Test" onClose={onClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
    
    const closeButton = document.querySelector('.ant-drawer-close')
    if (closeButton) {
      fireEvent.click(closeButton)
    }
    
    expect(onClose).toHaveBeenCalled()
  })

  it('renders with placement right by default', async () => {
    render(<DrawerComponent open={true} title="Test" />)
    
    await waitFor(() => {
      const drawer = document.querySelector('.ant-drawer-right')
      expect(drawer).toBeInTheDocument()
    })
  })

  it('renders with placement left', async () => {
    render(<DrawerComponent open={true} title="Test" placement="left" />)
    
    await waitFor(() => {
      const drawer = document.querySelector('.ant-drawer-left')
      expect(drawer).toBeInTheDocument()
    })
  })

  it('applies custom className', async () => {
    render(<DrawerComponent open={true} title="Test" className="custom-class" />)
    
    await waitFor(() => {
      const drawer = document.querySelector('.drawer-component')
      expect(drawer).toHaveClass('custom-class')
    })
  })

  it('renders with custom width', async () => {
    render(<DrawerComponent open={true} title="Test" width={500} />)
    
    await waitFor(() => {
      const drawer = document.querySelector('.ant-drawer')
      expect(drawer).toBeInTheDocument()
    })
  })

  it('renders without close button when closable is false', async () => {
    render(<DrawerComponent open={true} title="Test" closable={false} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
    
    const closeButton = document.querySelector('.ant-drawer-close')
    expect(closeButton).not.toBeInTheDocument()
  })

  it('renders with footer', async () => {
    render(
      <DrawerComponent
        open={true}
        title="Test"
        footer={<button>Custom Footer</button>}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Custom Footer')).toBeInTheDocument()
    })
  })

  it('renders with extra actions', async () => {
    render(
      <DrawerComponent
        open={true}
        title="Test"
        extra={<button>Extra Action</button>}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Extra Action')).toBeInTheDocument()
    })
  })
})

