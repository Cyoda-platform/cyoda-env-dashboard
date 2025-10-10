import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ChatMessageText } from './ChatMessageText'

describe('ChatMessageText', () => {
  it('renders without crashing', () => {
    const { container } = render(<ChatMessageText />)
    
    expect(container.querySelector('.chat-message-text')).toBeInTheDocument()
  })

  it('renders with text message', async () => {
    const message = { text: 'Hello world' }
    const renderMarkdown = (text: string) => `<p>${text}</p>`
    
    render(<ChatMessageText message={message} renderMarkdown={renderMarkdown} />)
    
    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })
  })

  it('calls onReady when message is ready', async () => {
    const onReady = vi.fn()
    const message = { text: 'Test' }
    
    render(<ChatMessageText message={message} onReady={onReady} />)
    
    await waitFor(() => {
      expect(onReady).toHaveBeenCalled()
    }, { timeout: 200 })
  })

  it('sets message.ready to true when ready', async () => {
    const message = { text: 'Test', ready: false }
    
    render(<ChatMessageText message={message} />)
    
    await waitFor(() => {
      expect(message.ready).toBe(true)
    }, { timeout: 200 })
  })

  it('renders markdown content when renderMarkdown is provided', async () => {
    const message = { text: '# Heading' }
    const renderMarkdown = (text: string) => '<h1>Heading</h1>'
    
    render(<ChatMessageText message={message} renderMarkdown={renderMarkdown} />)
    
    await waitFor(() => {
      const heading = screen.getByText('Heading')
      expect(heading.tagName).toBe('H1')
    })
  })

  it('renders plain text when renderMarkdown is not provided', async () => {
    const message = { text: 'Plain text' }
    
    const { container } = render(<ChatMessageText message={message} />)
    
    await waitFor(() => {
      expect(container.textContent).toContain('Plain text')
    })
  })

  it('applies custom className', () => {
    const { container } = render(<ChatMessageText className="custom-class" />)
    
    const component = container.querySelector('.chat-message-text')
    expect(component).toHaveClass('custom-class')
  })

  it('renders with empty message', () => {
    const { container } = render(<ChatMessageText message={{}} />)
    
    expect(container.querySelector('.chat-message-text')).toBeInTheDocument()
  })

  it('handles message with code blocks', async () => {
    const message = { text: 'Code example' }
    const renderMarkdown = (text: string) => '<pre><code>const x = 1;</code></pre>'
    
    render(<ChatMessageText message={message} renderMarkdown={renderMarkdown} />)
    
    await waitFor(() => {
      const code = screen.getByText('const x = 1;')
      expect(code).toBeInTheDocument()
    })
  })

  it('renders with links in markdown', async () => {
    const message = { text: '[Link](http://example.com)' }
    const renderMarkdown = (text: string) => '<a href="http://example.com">Link</a>'
    
    render(<ChatMessageText message={message} renderMarkdown={renderMarkdown} />)
    
    await waitFor(() => {
      const link = screen.getByText('Link')
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', 'http://example.com')
    })
  })

  it('renders with tables in markdown', async () => {
    const message = { text: 'Table' }
    const renderMarkdown = (text: string) => '<table><tr><th>Header</th></tr><tr><td>Cell</td></tr></table>'
    
    render(<ChatMessageText message={message} renderMarkdown={renderMarkdown} />)
    
    await waitFor(() => {
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Cell')).toBeInTheDocument()
    })
  })

  it('handles multiple paragraphs', async () => {
    const message = { text: 'Para 1\n\nPara 2' }
    const renderMarkdown = (text: string) => '<p>Para 1</p><p>Para 2</p>'
    
    render(<ChatMessageText message={message} renderMarkdown={renderMarkdown} />)
    
    await waitFor(() => {
      expect(screen.getByText('Para 1')).toBeInTheDocument()
      expect(screen.getByText('Para 2')).toBeInTheDocument()
    })
  })
})

