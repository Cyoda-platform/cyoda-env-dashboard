import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { ChatMessageJavascript } from './ChatMessageJavascript'

// Mock CodeEditor to avoid monaco-editor issues in tests
vi.mock('../CodeEditor', () => ({
  CodeEditor: ({ value }: any) => (
    <div data-testid="code-editor">{value}</div>
  )
}))

describe('ChatMessageJavascript', () => {
  beforeEach(() => {
    vi.clearAllTimers()
  })

  it('renders without crashing', () => {
    const { container } = render(<ChatMessageJavascript />)
    
    expect(container.querySelector('.chat-message-javascript')).toBeInTheDocument()
  })

  it('renders with message text', () => {
    const message = { text: 'console.log("Hello");' }
    const { getByTestId } = render(<ChatMessageJavascript message={message} />)
    
    expect(getByTestId('code-editor')).toHaveTextContent('console.log("Hello");')
  })

  it('renders with empty message', () => {
    const { getByTestId } = render(<ChatMessageJavascript message={{}} />)
    
    expect(getByTestId('code-editor')).toBeInTheDocument()
  })

  it('renders without message prop', () => {
    const { getByTestId } = render(<ChatMessageJavascript />)
    
    expect(getByTestId('code-editor')).toBeInTheDocument()
  })

  it('calls onReady after component mounts', async () => {
    const onReady = vi.fn()
    render(<ChatMessageJavascript onReady={onReady} />)
    
    await waitFor(() => {
      expect(onReady).toHaveBeenCalledTimes(1)
    }, { timeout: 200 })
  })

  it('applies custom className', () => {
    const { container } = render(<ChatMessageJavascript className="custom-class" />)
    
    const component = container.querySelector('.chat-message-javascript')
    expect(component).toHaveClass('custom-class')
  })

  it('renders code editor with javascript language', () => {
    const message = { text: 'const x = 1;' }
    const { getByTestId } = render(<ChatMessageJavascript message={message} />)
    
    expect(getByTestId('code-editor')).toBeInTheDocument()
  })

  it('renders with multiline code', () => {
    const message = { 
      text: `function test() {
  console.log("test");
  return true;
}` 
    }
    const { getByTestId } = render(<ChatMessageJavascript message={message} />)
    
    expect(getByTestId('code-editor')).toHaveTextContent('function test()')
  })

  it('handles message with ready property', () => {
    const message = { text: 'const x = 1;', ready: true }
    const { getByTestId } = render(<ChatMessageJavascript message={message} />)
    
    expect(getByTestId('code-editor')).toBeInTheDocument()
  })

  it('renders content wrapper', () => {
    const { container } = render(<ChatMessageJavascript />)
    
    const content = container.querySelector('.chat-message-javascript__content')
    expect(content).toBeInTheDocument()
  })
})

