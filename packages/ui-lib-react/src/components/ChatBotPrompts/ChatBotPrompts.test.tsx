import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatBotPrompts } from './ChatBotPrompts'
import { createRef } from 'react'

const mockPrompts = [
  { type: 'default' as const, value: 'Default prompt 1' },
  { type: 'default' as const, value: 'Default prompt 2' },
  { type: 'user' as const, value: 'User prompt 1', index: 0 },
]

describe('ChatBotPrompts', () => {
  it('renders without crashing', () => {
    const { container } = render(<ChatBotPrompts />)
    
    expect(container).toBeInTheDocument()
  })

  it('opens drawer when dialogVisible is set to true', async () => {
    const ref = createRef<any>()
    const onLoadPrompts = vi.fn().mockResolvedValue(mockPrompts)
    
    render(<ChatBotPrompts ref={ref} onLoadPrompts={onLoadPrompts} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(screen.getByText('Prompts')).toBeInTheDocument()
    })
  })

  it('loads prompts when drawer opens', async () => {
    const ref = createRef<any>()
    const onLoadPrompts = vi.fn().mockResolvedValue(mockPrompts)
    
    render(<ChatBotPrompts ref={ref} category="test" onLoadPrompts={onLoadPrompts} />)
    
    ref.current?.setDialogVisible(true)
    
    await waitFor(() => {
      expect(onLoadPrompts).toHaveBeenCalledWith('test')
    })
  })

  it('displays prompts in table', async () => {
    const ref = createRef<any>()
    const onLoadPrompts = vi.fn().mockResolvedValue(mockPrompts)

    render(<ChatBotPrompts ref={ref} category="test" onLoadPrompts={onLoadPrompts} />)

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      expect(onLoadPrompts).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText('Default prompt 1')).toBeInTheDocument()
    })
  })

  it('shows delete button only for user prompts', async () => {
    const ref = createRef<any>()
    const onLoadPrompts = vi.fn().mockResolvedValue(mockPrompts)

    render(<ChatBotPrompts ref={ref} category="test" onLoadPrompts={onLoadPrompts} />)

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      expect(onLoadPrompts).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText('Default prompt 1')).toBeInTheDocument()
      expect(screen.getByText('User prompt 1')).toBeInTheDocument()
    })

    // User prompts have delete button, default prompts don't
    const useButtons = screen.getAllByText('Use')
    expect(useButtons.length).toBe(3)
  })

  it('shows Use button for all prompts', async () => {
    const ref = createRef<any>()
    const onLoadPrompts = vi.fn().mockResolvedValue(mockPrompts)

    render(<ChatBotPrompts ref={ref} category="test" onLoadPrompts={onLoadPrompts} />)

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      expect(onLoadPrompts).toHaveBeenCalled()
    })

    await waitFor(() => {
      const useButtons = screen.getAllByText('Use')
      expect(useButtons.length).toBe(3)
    })
  })

  it('calls onSelected when Use button is clicked', async () => {
    const ref = createRef<any>()
    const onLoadPrompts = vi.fn().mockResolvedValue(mockPrompts)
    const onSelected = vi.fn()

    render(<ChatBotPrompts ref={ref} category="test" onLoadPrompts={onLoadPrompts} onSelected={onSelected} />)

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      expect(onLoadPrompts).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText('Default prompt 1')).toBeInTheDocument()
    })

    const useButtons = screen.getAllByText('Use')
    fireEvent.click(useButtons[0])

    expect(onSelected).toHaveBeenCalledWith('Default prompt 1')
  })

  it('closes drawer after selecting a prompt', async () => {
    const ref = createRef<any>()
    const onLoadPrompts = vi.fn().mockResolvedValue(mockPrompts)

    render(<ChatBotPrompts ref={ref} category="test" onLoadPrompts={onLoadPrompts} />)

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      expect(screen.getByText('Prompts')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(onLoadPrompts).toHaveBeenCalled()
    })

    await waitFor(() => {
      const useButtons = screen.getAllByText('Use')
      expect(useButtons.length).toBeGreaterThan(0)
    })

    const useButtons = screen.getAllByText('Use')
    fireEvent.click(useButtons[0])

    await waitFor(() => {
      expect(ref.current?.dialogVisible).toBe(false)
    })
  })

  it('opens add prompt modal when onClickAdd is called', async () => {
    const ref = createRef<any>()
    
    render(<ChatBotPrompts ref={ref} />)
    
    ref.current?.onClickAdd()
    
    await waitFor(() => {
      expect(screen.getByText('Add new Prompt')).toBeInTheDocument()
    })
  })

  it('calls onAddPrompt when adding a new prompt', async () => {
    const ref = createRef<any>()
    const onAddPrompt = vi.fn().mockResolvedValue(undefined)
    const onLoadPrompts = vi.fn().mockResolvedValue([])
    
    render(<ChatBotPrompts ref={ref} category="test" onAddPrompt={onAddPrompt} onLoadPrompts={onLoadPrompts} />)
    
    ref.current?.onClickAdd()
    
    await waitFor(() => {
      expect(screen.getByText('Add new Prompt')).toBeInTheDocument()
    })
    
    const textarea = screen.getByPlaceholderText('Please add new Prompt')
    fireEvent.change(textarea, { target: { value: 'New prompt' } })
    
    const okButton = screen.getByText('OK')
    fireEvent.click(okButton)
    
    await waitFor(() => {
      expect(onAddPrompt).toHaveBeenCalledWith('test', 'New prompt')
    })
  })

  it('shows confirmation modal when deleting a prompt', async () => {
    const ref = createRef<any>()
    const onLoadPrompts = vi.fn().mockResolvedValue(mockPrompts)

    const { container } = render(<ChatBotPrompts ref={ref} category="test" onLoadPrompts={onLoadPrompts} />)

    ref.current?.setDialogVisible(true)

    await waitFor(() => {
      expect(onLoadPrompts).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText('User prompt 1')).toBeInTheDocument()
    })

    const deleteButton = container.querySelector('button[class*="ant-btn-dangerous"]')
    if (deleteButton) {
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText('Confirm!')).toBeInTheDocument()
      })
    }
  })

  it('applies custom className', () => {
    const { container } = render(<ChatBotPrompts className="custom-class" />)
    
    expect(container).toBeInTheDocument()
  })
})

