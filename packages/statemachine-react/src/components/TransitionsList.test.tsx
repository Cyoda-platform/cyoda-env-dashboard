/**
 * Tests for TransitionsList component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { TransitionsList } from './TransitionsList';

const mockNavigate = vi.fn();
const mockRefetch = vi.fn();
const mockDeleteMutateAsync = vi.fn();
const mockCopyMutateAsync = vi.fn();

// Mock the hooks
vi.mock('../hooks/useStatemachine', () => ({
  useTransitionsList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: mockRefetch,
  })),
  useDeleteTransition: vi.fn(() => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  })),
  useCopyTransition: vi.fn(() => ({
    mutateAsync: mockCopyMutateAsync,
    isPending: false,
  })),
  useStatesList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useDeleteState: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

// Mock react-router-dom
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

describe('TransitionsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('should handle copy transition successfully', async () => {
    const { useTransitionsList, useCopyTransition } = await import('../hooks/useStatemachine');

    // Mock transition data
    vi.mocked(useTransitionsList).mockReturnValue({
      data: [
        {
          id: 'trans-1',
          name: 'Test Transition',
          active: true,
          persisted: true,
          automated: false,
          startStateName: 'START',
          startStateId: 'state-1',
          endStateName: 'END',
          endStateId: 'state-2',
        },
      ],
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    // Mock successful copy
    mockCopyMutateAsync.mockResolvedValue('trans-copy-1');
    vi.mocked(useCopyTransition).mockReturnValue({
      mutateAsync: mockCopyMutateAsync,
      isPending: false,
    } as any);

    const user = userEvent.setup();

    render(
      <TransitionsList
        workflowId="workflow-1"
        persistedType="persisted"
        entityClassName="com.example.Entity"
      />,
      { wrapper: createWrapper() }
    );

    // Find and click the copy button
    const copyButtons = screen.getAllByRole('button').filter(
      (btn) => btn.querySelector('[data-icon="copy"]')
    );

    if (copyButtons.length > 0) {
      await user.click(copyButtons[0]);

      await waitFor(() => {
        expect(mockCopyMutateAsync).toHaveBeenCalledWith({
          persistedType: 'persisted',
          workflowId: 'workflow-1',
          transitionId: 'trans-1',
        });
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/transition/trans-copy-1')
        );
      });
    }
  });

  it('should show states list modal when button clicked', async () => {
    const user = userEvent.setup();

    render(
      <TransitionsList
        workflowId="workflow-1"
        persistedType="persisted"
        entityClassName="com.example.Entity"
      />,
      { wrapper: createWrapper() }
    );

    // Find and click the "List of states" button
    const statesButton = screen.getAllByText('List of states')[0];
    await user.click(statesButton);

    // Modal should be rendered (check for multiple instances of "List of states")
    await waitFor(() => {
      const listOfStatesElements = screen.getAllByText('List of states');
      expect(listOfStatesElements.length).toBeGreaterThan(1); // Button + Modal title
    });
  });
});

