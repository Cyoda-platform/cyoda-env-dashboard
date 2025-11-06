import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatMessageQuestion } from './ChatMessageQuestion'

describe('ChatMessageQuestion', () => {
  it('renders with message text', () => {
    const message = { text: 'What is the weather today?' }
    render(<ChatMessageQuestion message={message} />)
    expect(screen.getByText('What is the weather today?')).toBeInTheDocument()
  })

  it('renders default text when no message text provided', () => {
    const message = {}
    render(<ChatMessageQuestion message={message} />)
    expect(screen.getByText("You didn't ask a question")).toBeInTheDocument()
  })

  it('renders return object when provided', () => {
    const message = {
      text: 'Show me the data',
      return_object: 'WeatherData'
    }
    render(<ChatMessageQuestion message={message} />)
    expect(screen.getByText(/Return object: WeatherData/)).toBeInTheDocument()
  })

  it('does not render return object section when not provided', () => {
    const message = { text: 'Simple question' }
    const { container } = render(<ChatMessageQuestion message={message} />)
    expect(container.querySelector('.return-object')).not.toBeInTheDocument()
  })

  it('applies default className', () => {
    const message = { text: 'Test' }
    const { container } = render(<ChatMessageQuestion message={message} />)
    expect(container.querySelector('.ai-chat-bot-messages-question')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const message = { text: 'Test' }
    const { container } = render(
      <ChatMessageQuestion message={message} className="custom-class" />
    )
    const element = container.querySelector('.ai-chat-bot-messages-question')
    expect(element).toHaveClass('custom-class')
  })

  it('handles empty message object', () => {
    const message = {}
    render(<ChatMessageQuestion message={message} />)
    expect(screen.getByText("You didn't ask a question")).toBeInTheDocument()
  })

  it('renders both text and return object', () => {
    const message = {
      text: 'Get user data',
      return_object: 'UserProfile'
    }
    render(<ChatMessageQuestion message={message} />)
    expect(screen.getByText('Get user data')).toBeInTheDocument()
    expect(screen.getByText(/Return object: UserProfile/)).toBeInTheDocument()
  })
})

