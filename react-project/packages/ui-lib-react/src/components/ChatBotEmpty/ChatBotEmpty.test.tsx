import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatBotEmpty } from './ChatBotEmpty'

describe('ChatBotEmpty', () => {
  it('renders with default message', () => {
    render(<ChatBotEmpty />)
    expect(screen.getByText('How can I help you today?')).toBeInTheDocument()
  })

  it('renders with custom message', () => {
    render(<ChatBotEmpty message="Welcome to AI Assistant!" />)
    expect(screen.getByText('Welcome to AI Assistant!')).toBeInTheDocument()
  })

  it('applies default className', () => {
    const { container } = render(<ChatBotEmpty />)
    expect(container.querySelector('.ai-chat-bot-empty')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ChatBotEmpty className="custom-class" />)
    const element = container.querySelector('.ai-chat-bot-empty')
    expect(element).toHaveClass('custom-class')
  })

  it('renders robot icon', () => {
    const { container } = render(<ChatBotEmpty />)
    expect(container.querySelector('.anticon-robot')).toBeInTheDocument()
  })
})

