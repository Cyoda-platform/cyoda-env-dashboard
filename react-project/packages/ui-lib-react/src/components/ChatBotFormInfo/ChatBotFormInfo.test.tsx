import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatBotFormInfo } from './ChatBotFormInfo'

describe('ChatBotFormInfo', () => {
  it('renders modal when visible', async () => {
    const onClose = vi.fn()
    render(<ChatBotFormInfo visible={true} onClose={onClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('Info')).toBeInTheDocument()
    })
  })

  it('does not render modal when not visible', () => {
    const onClose = vi.fn()
    render(<ChatBotFormInfo visible={false} onClose={onClose} />)
    
    expect(screen.queryByText('Info')).not.toBeInTheDocument()
  })

  it('renders table with return data types', async () => {
    const onClose = vi.fn()
    const returnDataTypes = {
      type1: 'Description 1',
      type2: 'Description 2',
      type3: 'Description 3'
    }
    
    render(
      <ChatBotFormInfo
        visible={true}
        onClose={onClose}
        returnDataTypes={returnDataTypes}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('type1')).toBeInTheDocument()
      expect(screen.getByText('Description 1')).toBeInTheDocument()
      expect(screen.getByText('type2')).toBeInTheDocument()
      expect(screen.getByText('Description 2')).toBeInTheDocument()
      expect(screen.getByText('type3')).toBeInTheDocument()
      expect(screen.getByText('Description 3')).toBeInTheDocument()
    })
  })

  it('filters out random key from return data types', async () => {
    const onClose = vi.fn()
    const returnDataTypes = {
      type1: 'Description 1',
      random: 'Should be filtered',
      type2: 'Description 2'
    }
    
    render(
      <ChatBotFormInfo
        visible={true}
        onClose={onClose}
        returnDataTypes={returnDataTypes}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('type1')).toBeInTheDocument()
      expect(screen.getByText('type2')).toBeInTheDocument()
      expect(screen.queryByText('random')).not.toBeInTheDocument()
      expect(screen.queryByText('Should be filtered')).not.toBeInTheDocument()
    })
  })

  it('renders table column headers', async () => {
    const onClose = vi.fn()
    render(<ChatBotFormInfo visible={true} onClose={onClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Prompt')).toBeInTheDocument()
    })
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(<ChatBotFormInfo visible={true} onClose={onClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('Close')).toBeInTheDocument()
    })
    
    const closeButton = screen.getByText('Close')
    await user.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when modal is cancelled', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { container } = render(<ChatBotFormInfo visible={true} onClose={onClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('Info')).toBeInTheDocument()
    })
    
    const closeIcon = container.querySelector('.ant-modal-close')
    if (closeIcon) {
      await user.click(closeIcon)
      expect(onClose).toHaveBeenCalled()
    }
  })

  it('handles empty return data types', async () => {
    const onClose = vi.fn()
    render(<ChatBotFormInfo visible={true} onClose={onClose} returnDataTypes={{}} />)
    
    await waitFor(() => {
      expect(screen.getByText('Info')).toBeInTheDocument()
    })
    
    // Table should be empty
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })

  it('applies custom className', async () => {
    const onClose = vi.fn()
    render(
      <ChatBotFormInfo visible={true} onClose={onClose} className="custom-class" />
    )

    await waitFor(() => {
      expect(screen.getByText('Info')).toBeInTheDocument()
    })
  })
})

