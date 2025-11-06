import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ModalComponent } from './ModalComponent'

describe('ModalComponent', () => {
  it('renders without crashing when open', async () => {
    render(<ModalComponent open={true} title="Test Modal" />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Modal')).toBeInTheDocument()
    })
  })

  it('does not render when closed', () => {
    render(<ModalComponent open={false} title="Test Modal" />)
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('renders with title', async () => {
    render(<ModalComponent open={true} title="Modal Title" />)
    
    await waitFor(() => {
      expect(screen.getByText('Modal Title')).toBeInTheDocument()
    })
  })

  it('renders with children content', async () => {
    render(
      <ModalComponent open={true} title="Test">
        <div>Modal Content</div>
      </ModalComponent>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Modal Content')).toBeInTheDocument()
    })
  })

  it('calls onCancel when close button is clicked', async () => {
    const onCancel = vi.fn()
    render(<ModalComponent open={true} title="Test" onCancel={onCancel} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
    
    const closeButton = document.querySelector('.ant-modal-close')
    if (closeButton) {
      fireEvent.click(closeButton)
    }
    
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onOk when OK button is clicked', async () => {
    const onOk = vi.fn()
    render(<ModalComponent open={true} title="Test" onOk={onOk} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
    
    const okButton = screen.getByText('OK')
    fireEvent.click(okButton)
    
    expect(onOk).toHaveBeenCalled()
  })

  it('renders with custom footer', async () => {
    render(
      <ModalComponent
        open={true}
        title="Test"
        footer={<button>Custom Button</button>}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Custom Button')).toBeInTheDocument()
    })
  })

  it('renders without footer when footer is null', async () => {
    render(<ModalComponent open={true} title="Test" footer={null} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
    
    expect(screen.queryByText('OK')).not.toBeInTheDocument()
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
  })

  it('applies custom className', async () => {
    render(<ModalComponent open={true} title="Test" className="custom-class" />)
    
    await waitFor(() => {
      const modal = document.querySelector('.modal-component')
      expect(modal).toHaveClass('custom-class')
    })
  })

  it('renders with custom width', async () => {
    render(<ModalComponent open={true} title="Test" width={800} />)
    
    await waitFor(() => {
      const modal = document.querySelector('.ant-modal')
      expect(modal).toBeInTheDocument()
    })
  })

  it('renders with centered position', async () => {
    render(<ModalComponent open={true} title="Test" centered />)
    
    await waitFor(() => {
      const wrapper = document.querySelector('.ant-modal-centered')
      expect(wrapper).toBeInTheDocument()
    })
  })

  it('renders with closable false', async () => {
    render(<ModalComponent open={true} title="Test" closable={false} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
    
    const closeButton = document.querySelector('.ant-modal-close')
    expect(closeButton).not.toBeInTheDocument()
  })

  it('renders with maskClosable prop', async () => {
    render(<ModalComponent open={true} title="Test" maskClosable={true} />)

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument()
    })

    const mask = document.querySelector('.ant-modal-mask')
    expect(mask).toBeInTheDocument()
  })
})

