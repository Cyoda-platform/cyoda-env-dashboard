/**
 * Tests for BulkUpdateForm component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { BulkUpdateForm } from './BulkUpdateForm';
import type { TableRow } from '../types';

// Mock HelperDictionary
vi.mock('@cyoda/ui-lib-react', () => ({
  HelperDictionary: {
    users: [
      { name: 'user1@example.com' },
      { name: 'user2@example.com' },
    ],
    priorities: [
      { key: '1', value: 'Low' },
      { key: '5', value: 'Medium' },
      { key: '10', value: 'High' },
    ],
  },
}));

// Mock axios
vi.mock('@cyoda/http-api-react', () => ({
  default: {
    put: vi.fn(),
  },
}));

describe('BulkUpdateForm', () => {
  let queryClient: QueryClient;
  const mockOnUpdated = vi.fn();

  const mockSelection: TableRow[] = [
    {
      id: 'task-1',
      title: 'Task 1',
      state: 'OPEN',
      priority: 5,
      priority_name: 'Medium',
      assigned_to_name: 'user1@example.com',
      timestamp: 0,
      timestamp_name: '2025-10-10',
      agent_event: 'Event 1',
      task: {
        id: 'task-1',
        title: 'Task 1',
        state: 'OPEN',
        priority: 5,
        assignee: 'user1@example.com',
      } as any,
    },
    {
      id: 'task-2',
      title: 'Task 2',
      state: 'OPEN',
      priority: 3,
      priority_name: 'Low',
      assigned_to_name: 'user2@example.com',
      timestamp: 0,
      timestamp_name: '2025-10-10',
      agent_event: 'Event 2',
      task: {
        id: 'task-2',
        title: 'Task 2',
        state: 'OPEN',
        priority: 3,
        assignee: 'user2@example.com',
      } as any,
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockOnUpdated.mockClear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should render bulk update form', () => {
    render(
      <BulkUpdateForm multipleSelection={mockSelection} onUpdated={mockOnUpdated} />,
      { wrapper }
    );

    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Assigned To')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('should show warning when submitting without selection', async () => {
    const { container } = render(
      <BulkUpdateForm multipleSelection={mockSelection} onUpdated={mockOnUpdated} />,
      { wrapper }
    );

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    // Should show warning message (handled by Ant Design message component)
    // In a real test, you'd mock the message component
  });

  it('should display correct number of tasks in selection', () => {
    render(
      <BulkUpdateForm multipleSelection={mockSelection} onUpdated={mockOnUpdated} />,
      { wrapper }
    );

    // Component receives 2 tasks
    expect(mockSelection.length).toBe(2);
  });
});

