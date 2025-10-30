/**
 * TasksNotifications Component
 * Handles real-time task updates via Server-Sent Events (SSE)
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/elements/TasksNotifications/TasksNotifications.vue
 */

import { useEffect, useRef, useCallback } from 'react';
import { notification, App } from 'antd';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { useAuth } from '@cyoda/http-api-react';
import { useTasksStore } from '../stores/tasksStore';
import type { Task } from '../types';

// Task event type matching Vue implementation
export interface TaskEvent {
  alertTask: Task;
  previousState?: string;
}

// Event bus for task updates
export const taskEventBus = {
  listeners: new Set<(event: TaskEvent) => void>(),
  emit(event: TaskEvent) {
    this.listeners.forEach(listener => listener(event));
  },
  on(listener: (event: TaskEvent) => void) {
    this.listeners.add(listener);
  },
  off(listener: (event: TaskEvent) => void) {
    this.listeners.delete(listener);
  },
};

export const TasksNotifications: React.FC = () => {
  const { message } = App.useApp();
  const { getToken } = useAuth();
  const isApplyRealData = useTasksStore((state) => state.isApplyRealData);
  const getAllTasks = useTasksStore((state) => state.getAllTasks);

  const token = getToken();

  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const allTasksRef = useRef<Task[] | undefined>(undefined);
  const lastTaskTimeRef = useRef<string | undefined>(undefined);
  const isLoadingRef = useRef(false);
  const hasPollingErrorRef = useRef(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Poll tasks function - defined first to avoid dependency issues
  const pollTasks = useCallback(async () => {
    // Skip if we already had an error
    if (hasPollingErrorRef.current) return;

    try {
      const data = await getAllTasks({ from: lastTaskTimeRef.current });
      if (!data || data.length === 0) return;

      lastTaskTimeRef.current = data[data.length - 1].createdDatetime;

      if (!allTasksRef.current) {
        allTasksRef.current = data;
      } else {
        // Find new tasks
        const existingIds = new Set(allTasksRef.current.map(t => t.id));
        const newTasks = data.filter(t => !existingIds.has(t.id));
        allTasksRef.current = data;

        if (newTasks.length > 0) {
          notification.success({
            message: 'Tasks',
            description: (
              <div>
                Was added {newTasks.length} new task(s)
                <br />
                <strong
                  style={{ color: '#606266', cursor: 'pointer', borderBottom: '1px solid transparent' }}
                  onClick={() => window.open('/tasks', '_blank')}
                  onMouseEnter={(e) => (e.currentTarget.style.borderBottom = '1px solid #606266')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderBottom = '1px solid transparent')}
                >
                  Open All Tasks
                </strong>
              </div>
            ),
            onClick: () => window.open('/tasks', '_blank'),
          });

          // Emit events for each new task (matching Vue format)
          newTasks.forEach(task => {
            taskEventBus.emit({ alertTask: task });
          });
        }
      }
    } catch (error) {
      // Only log the first error to avoid console spam
      if (!hasPollingErrorRef.current) {
        console.warn('⚠️ Task polling failed - backend may not be available. Stopping polling to avoid console spam.', error);
        hasPollingErrorRef.current = true;
      }

      // Stop polling on errors to avoid spamming the console
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [getAllTasks]);

  // Polling fallback when SSE fails
  const startPolling = useCallback(async () => {
    if (pollingIntervalRef.current) return;

    console.log('🔄 Starting polling fallback for task updates (every 5 seconds)');

    // Initial load
    await pollTasks();

    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(async () => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      await pollTasks();
      isLoadingRef.current = false;
    }, 5000);
  }, [pollTasks]);

  // Start SSE connection
  const startEventSource = useCallback(() => {
    if (!token) {
      console.warn('⚠️ No authentication token available for SSE connection');
      return;
    }

    const apiBase = import.meta.env.VITE_APP_API_BASE?.replace(/\/$/, '') || '';
    const url = `${apiBase}/alerts/tasks/emit`;

    console.log('🔔 Starting SSE connection to:', url);

    try {
      eventSourceRef.current = new EventSourcePolyfill(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
      });

      eventSourceRef.current.addEventListener('error', (e) => {
        console.error('❌ SSE connection error, falling back to polling:', e);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        startPolling();
      });
    } catch (error) {
      console.error('❌ Failed to create SSE connection:', error);
      startPolling();
    }

    eventSourceRef.current.addEventListener('message', (event: any) => {
      try {
        const taskEvent: TaskEvent = JSON.parse(event.data);
        const task = taskEvent.alertTask;

        // Show notification for new tasks (matching Vue implementation)
        if (taskEvent.previousState === 'None') {
          notification.success({
            message: 'Tasks',
            description: (
              <div>
                Was added new task(s)
                <br />
                <strong
                  style={{ color: '#606266', cursor: 'pointer', borderBottom: '1px solid transparent' }}
                  onClick={() => window.open(`/tasks/${task.id}`, '_blank')}
                  onMouseEnter={(e) => (e.currentTarget.style.borderBottom = '1px solid #606266')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderBottom = '1px solid transparent')}
                >
                  Open task
                </strong>
              </div>
            ),
            onClick: () => window.open(`/tasks/${task.id}`, '_blank'),
          });
        }

        // Emit event for task update (matching Vue format)
        taskEventBus.emit(taskEvent);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    });
  }, [token, startPolling]);

  // Effect to manage connection based on isApplyRealData
  useEffect(() => {
    if (isApplyRealData) {
      console.log('🔔 Subscribing to live task updates');
      hasPollingErrorRef.current = false; // Reset error flag
      startEventSource();
    } else {
      console.log('🔕 Unsubscribing from live task updates');
      cleanup();
      allTasksRef.current = undefined;
      lastTaskTimeRef.current = undefined;
      hasPollingErrorRef.current = false;
    }

    return cleanup;
  }, [isApplyRealData, startEventSource, cleanup]);

  return null;
};

