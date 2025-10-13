/**
 * Tests for ProcessesList component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { ProcessesList } from './ProcessesList';

// Mock the hooks
vi.mock('../hooks/useStatemachine', () => ({
  useProcessesList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useDeleteProcess: vi.fn(() => ({
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

describe('ProcessesList', () => {
  it('should render the processes list', () => {
    render(
      <ProcessesList 
        workflowId="workflow-1" 
        persistedType="persisted" 
        entityClassName="com.example.Entity" 
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Processes')).toBeInTheDocument();
  });

  it('should render buttons', () => {
    render(
      <ProcessesList
        workflowId="workflow-1"
        persistedType="persisted"
        entityClassName="com.example.Entity"
      />,
      { wrapper: createWrapper() }
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});

