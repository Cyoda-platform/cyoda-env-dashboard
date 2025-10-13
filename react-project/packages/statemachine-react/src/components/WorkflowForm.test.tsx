/**
 * Tests for WorkflowForm component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { WorkflowForm } from './WorkflowForm';

// Mock the hooks
vi.mock('../hooks/useStatemachine', () => ({
  useWorkflow: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
  useWorkflowEnabledTypes: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useCriteriaList: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useCreateWorkflow: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUpdateWorkflow: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
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

describe('WorkflowForm', () => {
  it('should render the form', () => {
    const { container } = render(<WorkflowForm workflowId="new" />, { wrapper: createWrapper() });
    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('should render buttons', () => {
    render(<WorkflowForm workflowId="new" />, { wrapper: createWrapper() });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});

