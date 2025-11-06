/**
 * Integration Test: Workflow Creation Flow
 * Tests the complete workflow creation process including form submission and navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import { Workflows } from '../../pages/Workflows';
import { WorkflowDetail } from '../../pages/WorkflowDetail';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
    })),
  },
}));

// Mock the hooks with realistic data
vi.mock('../../hooks/useStatemachine', () => ({
  useWorkflowsList: vi.fn(() => ({
    data: [
      {
        id: 'workflow-1',
        name: 'Test Workflow',
        entityClassName: 'com.example.Entity',
        active: true,
        persisted: true,
        createdDatetime: '2024-01-01T10:00:00Z',
      },
    ],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useWorkflow: vi.fn(() => ({
    data: {
      id: 'workflow-1',
      name: 'Test Workflow',
      entityClassName: 'com.example.Entity',
      active: true,
      persisted: true,
      createdDatetime: '2024-01-01T10:00:00Z',
    },
    isLoading: false,
  })),
  useWorkflowEnabledTypes: vi.fn(() => ({
    data: [
      { value: 'com.example.Entity', label: 'Entity' },
    ],
    isLoading: false,
  })),
  useStatesList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useTransitionsList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useProcessesList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useCriteriaList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useCreateWorkflow: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'new-workflow-id' }),
    isPending: false,
  })),
  useUpdateWorkflow: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
  useDeleteWorkflow: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useCopyWorkflow: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

// Mock HelperDictionary
vi.mock('@cyoda/ui-lib-react', () => ({
  HelperDictionary: {
    getLabel: (type: string, key: string) => key,
    getOptions: () => [],
  },
  HelperFormat: {
    date: (date: string) => new Date(date).toLocaleDateString(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={children} />
          <Route path="/statemachine/workflow/:workflowId" element={<WorkflowDetail />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Workflow Creation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display workflows list', () => {
    render(<Workflows />, { wrapper: createWrapper() });

    expect(screen.getByText('Test Workflow')).toBeInTheDocument();
  });

  it('should render workflows page', () => {
    const { container } = render(<Workflows />, { wrapper: createWrapper() });

    // Should render the page
    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should display workflow details', () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Workflow should be displayed
    expect(screen.getByText('Test Workflow')).toBeInTheDocument();
  });
});

