/**
 * Integration Test: Tasks Management Flow
 * Tests the complete tasks management process including filtering, bulk updates, and navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { TasksGrid } from '../../components/TasksGrid';
import { TasksFilter } from '../../components/TasksFilter';

// Mock the hooks
vi.mock('../../hooks/useTasks', () => ({
  useTasksPerPage: vi.fn(() => ({
    data: {
      content: [
        {
          id: 'task-1',
          title: 'Test Task 1',
          state: 'OPEN',
          priority: 5,
          assignee: 'user1@example.com',
          message: 'Test message 1',
          createdDatetime: '2024-01-01T10:00:00Z',
        },
        {
          id: 'task-2',
          title: 'Test Task 2',
          state: 'CLOSED',
          priority: 10,
          assignee: 'user2@example.com',
          message: 'Test message 2',
          createdDatetime: '2024-01-02T10:00:00Z',
        },
      ],
      totalElements: 2,
      totalPages: 1,
      number: 0,
      size: 5,
    },
    isLoading: false,
    refetch: vi.fn(),
  })),
  useTasksState: vi.fn(() => ({
    isApplyRealData: false,
    setIsApplyRealData: vi.fn(),
    addReadedId: vi.fn(),
  })),
}));

// Mock HelperDictionary and HelperStorage
vi.mock('@cyoda/ui-lib-react', () => ({
  HelperDictionary: {
    getLabel: (type: string, key: string) => {
      const labels: Record<string, Record<string, string>> = {
        priorities: {
          '1': 'Low',
          '5': 'Medium',
          '10': 'High',
        },
        statuses: {
          'OPEN': 'Open',
          'CLOSED': 'Closed',
          'IN_PROGRESS': 'In Progress',
        },
      };
      return labels[type]?.[key] || key;
    },
    getOptions: (type: string) => {
      const options: Record<string, Array<{ value: string; label: string }>> = {
        priorities: [
          { value: '1', label: 'Low' },
          { value: '5', label: 'Medium' },
          { value: '10', label: 'High' },
        ],
        statuses: [
          { value: 'OPEN', label: 'Open' },
          { value: 'CLOSED', label: 'Closed' },
          { value: 'IN_PROGRESS', label: 'In Progress' },
        ],
      };
      return options[type] || [];
    },
  },
  HelperStorage: {
    get: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  },
  HelperFormat: {
    toLowerCase: (str: string) => str.toLowerCase(),
    date: (date: string) => new Date(date).toLocaleDateString(),
  },
}));

// Mock BulkUpdateForm
vi.mock('../../components/BulkUpdateForm', () => ({
  BulkUpdateForm: ({ multipleSelection, onUpdated }: any) => (
    <div data-testid="bulk-update-form">
      Bulk Update Form ({multipleSelection.length} selected)
      <button onClick={onUpdated}>Update</button>
    </div>
  ),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Tasks Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display tasks list with all tasks', () => {
    render(
      <TasksGrid filter={{}} isApplyRealData={false} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });

  it('should display task priorities correctly', () => {
    render(
      <TasksGrid filter={{}} isApplyRealData={false} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('should display task states correctly', () => {
    render(
      <TasksGrid filter={{}} isApplyRealData={false} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('open')).toBeInTheDocument();
    expect(screen.getByText('closed')).toBeInTheDocument();
  });



  it('should allow row selection for bulk operations', async () => {
    render(
      <TasksGrid filter={{}} isApplyRealData={false} />,
      { wrapper: createWrapper() }
    );

    // Find checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);

    // Select a row
    fireEvent.click(checkboxes[1]);

    // Bulk update form should appear
    await waitFor(() => {
      expect(screen.getByTestId('bulk-update-form')).toBeInTheDocument();
    });
  });

  it('should display pagination information', () => {
    render(
      <TasksGrid filter={{}} isApplyRealData={false} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Total 2 items')).toBeInTheDocument();
  });
});

