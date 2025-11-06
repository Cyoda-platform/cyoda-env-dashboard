import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorNotification } from './ErrorNotification'

describe('ErrorNotification', () => {
  it('renders notification when visible', () => {
    render(<ErrorNotification visible={true} />)
    const notification = document.querySelector('.error-notification')
    expect(notification).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    render(<ErrorNotification visible={false} />)
    const notification = document.querySelector('.error-notification')
    expect(notification).not.toBeInTheDocument()
  })

  it('renders bug icon', () => {
    render(<ErrorNotification visible={true} />)
    const icon = document.querySelector('.anticon-bug')
    expect(icon).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<ErrorNotification visible={true} onClick={onClick} />)
    
    const notification = document.querySelector('.error-notification')!
    await user.click(notification)
    
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has correct styling classes', () => {
    render(<ErrorNotification visible={true} />)
    const notification = document.querySelector('.error-notification')
    expect(notification).toHaveClass('error-notification')
  })

  it('is visible by default', () => {
    render(<ErrorNotification />)
    const notification = document.querySelector('.error-notification')
    expect(notification).toBeInTheDocument()
  })
})

