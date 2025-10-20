/**
 * Edge Case Tests: Tasks Management
 * Tests edge cases, boundary conditions, and error scenarios for tasks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { TasksGrid } from '../../components/TasksGrid';

// Create mock functions that we can control
const mockUseTasksPerPage = vi.fn();

// Mock the hooks
vi.mock('../../hooks/useTasks', () => ({
  useTasksPerPage: () => mockUseTasksPerPage(),
  useTasksState: vi.fn(() => ({
    isApplyRealData: false,
    setIsApplyRealData: vi.fn(),
    addReadedId: vi.fn(),
  })),
}));

// Mock HelperDictionary
vi.mock('@cyoda/ui-lib-react', () => ({
  HelperDictionary: {
    getLabel: (type: string, key: string) => key,
    getOptions: () => [],
  },
  HelperFormat: {
    toLowerCase: (str: string) => str?.toLowerCase() || '',
    date: (date: string) => date ? new Date(date).toLocaleDateString() : '',
  },
}));

// Mock BulkUpdateForm
vi.mock('../../components/BulkUpdateForm', () => ({
  BulkUpdateForm: () => <div data-testid="bulk-update-form">Bulk Update</div>,
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
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

describe('Tasks Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default mock
    mockUseTasksPerPage.mockReturnValue({
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 5,
      },
      isLoading: false,
      refetch: vi.fn(),
    });
  });

  it('should handle empty tasks list', () => {
    mockUseTasksPerPage.mockReturnValue({
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 5,
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<TasksGrid filter={{}} isApplyRealData={false} />, { wrapper: createWrapper() });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('should handle null data', () => {
    mockUseTasksPerPage.mockReturnValue({
      data: null,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<TasksGrid filter={{}} isApplyRealData={false} />, { wrapper: createWrapper() });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('should handle undefined data', () => {
    mockUseTasksPerPage.mockReturnValue({
      data: undefined,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<TasksGrid filter={{}} isApplyRealData={false} />, { wrapper: createWrapper() });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    mockUseTasksPerPage.mockReturnValue({
      data: null,
      isLoading: true,
      refetch: vi.fn(),
    });

    render(<TasksGrid filter={{}} isApplyRealData={false} />, { wrapper: createWrapper() });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('should handle tasks with missing fields', () => {
    mockUseTasksPerPage.mockReturnValue({
      data: {
        content: [
          {
            id: 'task-1',
            // title is missing
            // state is missing
            // priority is missing
          },
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 5,
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<TasksGrid filter={{}} isApplyRealData={false} />, { wrapper: createWrapper() });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('should handle tasks with null values', () => {
    mockUseTasksPerPage.mockReturnValue({
      data: {
        content: [
          {
            id: 'task-1',
            title: null,
            state: null,
            priority: null,
            assignee: null,
            message: null,
            createdDatetime: null,
          },
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 5,
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<TasksGrid filter={{}} isApplyRealData={false} />, { wrapper: createWrapper() });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('should handle very long task titles', () => {
    mockUseTasksPerPage.mockReturnValue({
      data: {
        content: [
          {
            id: 'task-1',
            title: 'A'.repeat(1000), // 1000 character title
            state: 'OPEN',
            priority: 5,
            assignee: 'user@example.com',
            message: 'Test',
            createdDatetime: '2024-01-01T10:00:00Z',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 5,
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<TasksGrid filter={{}} isApplyRealData={false} />, { wrapper: createWrapper() });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('should handle special characters in task data', () => {
    mockUseTasksPerPage.mockReturnValue({
      data: {
        content: [
          {
            id: 'task-1',
            title: '<script>alert("XSS")</script>',
            state: 'OPEN',
            priority: 5,
            assignee: 'user@example.com',
            message: 'Test & Special < > " \' Characters',
            createdDatetime: '2024-01-01T10:00:00Z',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 5,
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<TasksGrid filter={{}} isApplyRealData={false} />, { wrapper: createWrapper() });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('should handle invalid priority values', () => {
    mockUseTasksPerPage.mockReturnValue({
      data: {
        content: [
          {
            id: 'task-1',
            title: 'Test Task',
            state: 'OPEN',
            priority: -1, // Invalid priority
            assignee: 'user@example.com',
            message: 'Test',
            createdDatetime: '2024-01-01T10:00:00Z',
          },
          {
            id: 'task-2',
            title: 'Test Task 2',
            state: 'OPEN',
            priority: 999, // Out of range priority
            assignee: 'user@example.com',
            message: 'Test',
            createdDatetime: '2024-01-01T10:00:00Z',
          },
        ],
        totalElements: 2,
        totalPages: 1,
        number: 0,
        size: 5,
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<TasksGrid filter={{}} isApplyRealData={false} />, { wrapper: createWrapper() });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('should handle invalid date formats', () => {
    mockUseTasksPerPage.mockReturnValue({
      data: {
        content: [
          {
            id: 'task-1',
            title: 'Test Task',
            state: 'OPEN',
            priority: 5,
            assignee: 'user@example.com',
            message: 'Test',
            createdDatetime: 'invalid-date',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 5,
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<TasksGrid filter={{}} isApplyRealData={false} />, { wrapper: createWrapper() });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('should handle large dataset (1000 tasks)', () => {
    const largeTasks = Array.from({ length: 1000 }, (_, i) => ({
      id: `task-${i}`,
      title: `Task ${i}`,
      state: 'OPEN',
      priority: (i % 3) + 1,
      assignee: `user${i}@example.com`,
      message: `Message ${i}`,
      createdDatetime: '2024-01-01T10:00:00Z',
    }));

    mockUseTasksPerPage.mockReturnValue({
      data: {
        content: largeTasks,
        totalElements: 1000,
        totalPages: 200,
        number: 0,
        size: 5,
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<TasksGrid filter={{}} isApplyRealData={false} />, { wrapper: createWrapper() });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  }, 10000); // Increase timeout to 10 seconds for large dataset

  it('should handle pagination edge cases', () => {
    mockUseTasksPerPage.mockReturnValue({
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: -1, // Invalid page number
        size: 0, // Invalid page size
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<TasksGrid filter={{}} isApplyRealData={false} />, { wrapper: createWrapper() });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('should handle invalid state values', () => {
    mockUseTasksPerPage.mockReturnValue({
      data: {
        content: [
          {
            id: 'task-1',
            title: 'Test Task',
            state: 'INVALID_STATE',
            priority: 5,
            assignee: 'user@example.com',
            message: 'Test',
            createdDatetime: '2024-01-01T10:00:00Z',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 5,
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<TasksGrid filter={{}} isApplyRealData={false} />, { wrapper: createWrapper() });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });
});

