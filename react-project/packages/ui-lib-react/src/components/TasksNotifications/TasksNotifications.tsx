import React, { useEffect, useRef, useState } from 'react'
import { notification } from 'antd'
import { EventSourcePolyfill } from 'event-source-polyfill'
import _ from 'lodash'
import './TasksNotifications.scss'

export interface Task {
  id: string
  createdDatetime: string
  previousState?: string
  [key: string]: any
}

export interface TasksNotificationsProps {
  /** Whether to enable real-time notifications */
  enabled?: boolean
  /** Authentication token for SSE connection */
  token?: string
  /** Base API URL */
  apiBase?: string
  /** Callback to fetch all tasks */
  onFetchTasks?: (params: { from?: string }) => Promise<Task[]>
  /** Callback when new task is received */
  onNewTask?: (task: Task) => void
  /** Current route ID (to avoid showing notification for current task) */
  currentTaskId?: string
  /** Polling interval in milliseconds (fallback when SSE fails) */
  pollingInterval?: number
}

/**
 * TasksNotifications Component
 * Handles real-time task notifications via Server-Sent Events (SSE)
 * Falls back to polling if SSE connection fails
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/TasksNotifications/TasksNotifications.vue
 */
export const TasksNotifications: React.FC<TasksNotificationsProps> = ({
  enabled = false,
  token,
  apiBase = import.meta.env.VITE_APP_API_BASE || '',
  onFetchTasks,
  onNewTask,
  currentTaskId,
  pollingInterval = 5000
}) => {
  const [allTasks, setAllTasks] = useState<Task[] | undefined>(undefined)
  const [lastTaskTime, setLastTaskTime] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch all tasks
  const getAllTasksRequests = async () => {
    if (!onFetchTasks) return

    const data = await onFetchTasks({ from: lastTaskTime })
    if (data.length === 0) return

    setLastTaskTime(data[data.length - 1].createdDatetime)

    if (allTasks === undefined) {
      setAllTasks(data)
    } else {
      const differences = _.differenceBy(data, allTasks, 'id')
      setAllTasks(data)

      if (differences.length > 0) {
        notification.success({
          message: 'Tasks',
          description: (
            <div>
              Was added {differences.length} new task(s)
              <br />
              <strong
                className="task-strong-link-notification"
                onClick={() => window.open('/tasks', '_blank')}
              >
                Open All Tasks
              </strong>
            </div>
          ),
          onClick: () => window.open('/tasks', '_blank')
        })

        differences.forEach(task => {
          onNewTask?.(task)
        })
      }
    }
  }

  // Start polling (fallback when SSE fails)
  const startPolling = async () => {
    if (intervalRef.current) return

    await getAllTasksRequests()

    intervalRef.current = setInterval(async () => {
      if (isLoading) return

      setIsLoading(true)
      await getAllTasksRequests()
      setIsLoading(false)
    }, pollingInterval)
  }

  // Stop polling
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Start SSE connection
  const startEventSource = () => {
    if (!token) return

    const url = `${_.trimEnd(apiBase, '/')}/alerts/tasks/emit`
    
    eventSourceRef.current = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: '*/*'
      }
    })

    // Handle errors - fall back to polling
    eventSourceRef.current.addEventListener('error', () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      startPolling()
    })

    // Handle messages
    const debouncedNotification = _.debounce((task: Task) => {
      if (currentTaskId === task.id) return

      notification.success({
        message: 'Tasks',
        description: (
          <div>
            Was added new task(s)
            <br />
            <strong
              className="task-strong-link-notification"
              onClick={() => window.open(`/tasks/${task.id}`, '_blank')}
            >
              Open task
            </strong>
          </div>
        ),
        onClick: () => window.open(`/tasks/${task.id}`, '_blank')
      })
    }, 500)

    eventSourceRef.current.addEventListener('message', (event: any) => {
      const task = JSON.parse(event.data)
      
      if (task.previousState === 'None') {
        debouncedNotification(task)
      }
      
      onNewTask?.(task)
    })
  }

  // Stop SSE connection
  const stopEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }

  // Main effect - start/stop based on enabled flag
  useEffect(() => {
    if (enabled) {
      startEventSource()
    } else {
      stopEventSource()
      stopPolling()
    }

    return () => {
      stopEventSource()
      stopPolling()
    }
  }, [enabled, token, apiBase])

  // This component doesn't render anything visible
  return null
}

