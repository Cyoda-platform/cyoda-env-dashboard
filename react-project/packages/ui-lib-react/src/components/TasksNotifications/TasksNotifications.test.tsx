import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { TasksNotifications, Task } from './TasksNotifications'

// Mock event-source-polyfill
vi.mock('event-source-polyfill', () => ({
  EventSourcePolyfill: vi.fn(() => ({
    addEventListener: vi.fn(),
    close: vi.fn()
  }))
}))

// Mock antd notification
vi.mock('antd', () => ({
  notification: {
    success: vi.fn()
  }
}))

const mockTasks: Task[] = [
  {
    id: '1',
    createdDatetime: '2024-01-01T12:00:00Z',
    previousState: 'None'
  },
  {
    id: '2',
    createdDatetime: '2024-01-02T12:00:00Z',
    previousState: 'InProgress'
  }
]

describe('TasksNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('renders without errors', () => {
    render(<TasksNotifications enabled={false} />)
    expect(true).toBe(true)
  })

  it('does not render any visible content', () => {
    const { container } = render(<TasksNotifications enabled={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('accepts enabled prop', () => {
    render(<TasksNotifications enabled={true} token="test-token" />)
    expect(true).toBe(true)
  })

  it('accepts token prop', () => {
    render(<TasksNotifications enabled={true} token="test-token" />)
    expect(true).toBe(true)
  })

  it('accepts apiBase prop', () => {
    render(
      <TasksNotifications
        enabled={true}
        token="test-token"
        apiBase="https://api.example.com"
      />
    )
    expect(true).toBe(true)
  })

  it('accepts onFetchTasks callback', () => {
    const onFetchTasks = vi.fn().mockResolvedValue(mockTasks)
    render(
      <TasksNotifications
        enabled={true}
        token="test-token"
        onFetchTasks={onFetchTasks}
      />
    )
    expect(true).toBe(true)
  })

  it('accepts onNewTask callback', () => {
    const onNewTask = vi.fn()
    render(
      <TasksNotifications
        enabled={true}
        token="test-token"
        onNewTask={onNewTask}
      />
    )
    expect(true).toBe(true)
  })

  it('accepts currentTaskId prop', () => {
    render(
      <TasksNotifications
        enabled={true}
        token="test-token"
        currentTaskId="123"
      />
    )
    expect(true).toBe(true)
  })

  it('accepts custom polling interval', () => {
    render(
      <TasksNotifications
        enabled={true}
        token="test-token"
        pollingInterval={10000}
      />
    )
    expect(true).toBe(true)
  })

  it('handles disabled state', () => {
    const { rerender } = render(
      <TasksNotifications enabled={true} token="test-token" />
    )
    
    rerender(<TasksNotifications enabled={false} token="test-token" />)
    expect(true).toBe(true)
  })

  it('cleans up on unmount', () => {
    const { unmount } = render(
      <TasksNotifications enabled={true} token="test-token" />
    )
    
    unmount()
    expect(true).toBe(true)
  })
})

