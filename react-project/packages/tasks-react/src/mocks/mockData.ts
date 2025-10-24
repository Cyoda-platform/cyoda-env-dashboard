/**
 * Mock data for development/testing
 */

import type { Task, TasksPagedResponse } from '../types';

// Helper function to create a complete task object with all required fields
function createMockTask(partial: Partial<Task> & { id: string; title: string; message: string; state: string; priority: number; assignee: string; createdDatetime: string; lastModifiedDatetime: string }): Task {
  return {
    srcAlertId: `alert-${partial.id}`,
    alertDefId: `def-${partial.id}`,
    type: 1,
    timestamp: Date.now(),
    srcEntityId: `entity-${partial.id}`,
    srcEntityClass: 'Customer',
    properties: {
      shorts: {},
      ints: {},
      longs: { itemComplete: 0 },
      floats: {},
      doubles: { BaseCcyAmount: 0 },
      bools: { itemComplete: false },
      strings: { PaymentExecutionId: '' },
    },
    formattedProperties: {
      shorts: {},
      ints: {},
      longs: { itemComplete: 0 },
      floats: {},
      doubles: { BaseCcyAmount: 0 },
      bools: { itemComplete: false },
      strings: {},
    },
    group: null,
    configType: null,
    ...partial,
  };
}

// Use let instead of const to allow mutations
export let mockTasks: Task[] = [
  createMockTask({
    id: '1',
    title: 'Review data mapping configuration',
    message: 'Please review the new data mapping configuration for the customer entity',
    state: 'OPEN',
    priority: 8,
    assignee: 'john.doe@example.com',
    createdDatetime: '2024-01-15T10:30:00Z',
    lastModifiedDatetime: '2024-01-15T10:30:00Z',
  }),
  createMockTask({
    id: '2',
    title: 'Fix validation errors in processing pipeline',
    message: 'Several validation errors detected in the processing pipeline',
    state: 'IN_PROGRESS',
    priority: 9,
    assignee: 'jane.smith@example.com',
    createdDatetime: '2024-01-14T14:20:00Z',
    lastModifiedDatetime: '2024-01-15T09:15:00Z',
  }),
  createMockTask({
    id: '3',
    title: 'Update entity relationships',
    message: 'Entity relationships need to be updated according to new schema',
    state: 'OPEN',
    priority: 5,
    assignee: 'bob.wilson@example.com',
    createdDatetime: '2024-01-13T16:45:00Z',
    lastModifiedDatetime: '2024-01-13T16:45:00Z',
  }),
  createMockTask({
    id: '4',
    title: 'Investigate data quality issues',
    message: 'Data quality metrics showing anomalies in recent imports',
    state: 'OPEN',
    priority: 7,
    assignee: 'alice.johnson@example.com',
    createdDatetime: '2024-01-12T11:00:00Z',
    lastModifiedDatetime: '2024-01-14T08:30:00Z',
  }),
  createMockTask({
    id: '5',
    title: 'Complete workflow migration',
    message: 'Migrate remaining workflows to new state machine format',
    state: 'CLOSED',
    priority: 6,
    assignee: 'john.doe@example.com',
    createdDatetime: '2024-01-10T09:00:00Z',
    lastModifiedDatetime: '2024-01-11T17:00:00Z',
  }),
  createMockTask({
    id: '6',
    title: 'Optimize query performance',
    message: 'Several queries are running slower than expected',
    state: 'IN_PROGRESS',
    priority: 8,
    assignee: 'jane.smith@example.com',
    createdDatetime: '2024-01-11T13:30:00Z',
    lastModifiedDatetime: '2024-01-15T10:00:00Z',
  }),
  createMockTask({
    id: '7',
    title: 'Add new data source integration',
    message: 'Integrate new external data source for customer data',
    state: 'OPEN',
    priority: 4,
    assignee: 'bob.wilson@example.com',
    createdDatetime: '2024-01-09T15:20:00Z',
    lastModifiedDatetime: '2024-01-09T15:20:00Z',
  }),
  createMockTask({
    id: '8',
    title: 'Update documentation',
    message: 'Update user documentation with latest features',
    state: 'OPEN',
    priority: 3,
    assignee: 'alice.johnson@example.com',
    createdDatetime: '2024-01-08T10:00:00Z',
    lastModifiedDatetime: '2024-01-08T10:00:00Z',
  }),
  createMockTask({
    id: '9',
    title: 'Security audit findings',
    message: 'Address findings from recent security audit',
    state: 'OPEN',
    priority: 10,
    assignee: 'john.doe@example.com',
    createdDatetime: '2024-01-15T08:00:00Z',
    lastModifiedDatetime: '2024-01-15T08:00:00Z',
  }),
  createMockTask({
    id: '10',
    title: 'Backup and recovery test',
    message: 'Perform quarterly backup and recovery test',
    state: 'CLOSED',
    priority: 7,
    assignee: 'jane.smith@example.com',
    createdDatetime: '2024-01-05T09:00:00Z',
    lastModifiedDatetime: '2024-01-07T16:00:00Z',
  }),
];

export function getMockTasksPage(
  page: number = 0,
  size: number = 10,
  state?: string,
  assignee?: string,
  priority?: string
): TasksPagedResponse {
  let filteredTasks = [...mockTasks];

  // Filter by state if provided
  if (state && state !== 'ALL' && state !== '') {
    filteredTasks = filteredTasks.filter(task => task.state === state);
  }

  // Filter by assignee if provided
  if (assignee && assignee !== '') {
    filteredTasks = filteredTasks.filter(task => task.assignee === assignee);
  }

  // Filter by priority if provided
  if (priority && priority !== '') {
    filteredTasks = filteredTasks.filter(task => task.priority.toString() === priority);
  }

  // Sort by priority (descending) and then by date (newest first)
  filteredTasks.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return new Date(b.createdDatetime).getTime() - new Date(a.createdDatetime).getTime();
  });

  // Paginate
  const start = page * size;
  const end = start + size;
  const content = filteredTasks.slice(start, end);

  return {
    content,
    totalElements: filteredTasks.length,
    totalPages: Math.ceil(filteredTasks.length / size),
    size,
    number: page,
    first: page === 0,
    last: end >= filteredTasks.length,
    numberOfElements: content.length,
    empty: content.length === 0,
  };
}

export function getMockTask(id: string): Task | undefined {
  return mockTasks.find(task => task.id === id);
}

export function updateMockTask(id: string, updatedTask: Task): Task {
  const index = mockTasks.findIndex(task => task.id === id);
  if (index !== -1) {
    // Update the task in the array
    mockTasks[index] = {
      ...mockTasks[index],
      ...updatedTask,
      lastModifiedDatetime: new Date().toISOString(),
    };
    console.log('✅ Mock task updated:', mockTasks[index]);
    return mockTasks[index];
  }
  throw new Error(`Task with id ${id} not found`);
}

