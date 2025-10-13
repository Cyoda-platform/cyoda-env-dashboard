/**
 * Tests for TransitionsList component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { TransitionsList } from './TransitionsList';

// Mock the hooks
vi.mock('../hooks/useStatemachine', () => ({
  useTransitionsList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useDeleteTransition: vi.fn(() => ({
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

describe('TransitionsList', () => {
  it('should render the transitions list', () => {
    render(
      <TransitionsList 
        workflowId="workflow-1" 
        persistedType="persisted" 
        entityClassName="com.example.Entity" 
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Transitions')).toBeInTheDocument();
  });

  it('should render buttons', () => {
    render(
      <TransitionsList
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

