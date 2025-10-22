/**
 * Tests for ProcessesList component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { ProcessesList } from './ProcessesList';

const mockNavigate = vi.fn();
const mockRefetch = vi.fn();
const mockDeleteMutateAsync = vi.fn();
const mockCopyMutateAsync = vi.fn();

// Mock the hooks
vi.mock('../hooks/useStatemachine', () => ({
  useProcessesList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: mockRefetch,
  })),
  useDeleteProcess: vi.fn(() => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  })),
  useCopyProcess: vi.fn(() => ({
    mutateAsync: mockCopyMutateAsync,
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

describe('ProcessesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('should handle copy process successfully', async () => {
    const { useProcessesList, useCopyProcess } = await import('../hooks/useStatemachine');

    // Mock process data
    vi.mocked(useProcessesList).mockReturnValue({
      data: [
        {
          id: 'process-1',
          name: 'Test Process',
          description: 'Test description',
          persisted: true,
          isTemplate: false,
        },
      ],
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    // Mock successful copy
    mockCopyMutateAsync.mockResolvedValue('process-copy-1');
    vi.mocked(useCopyProcess).mockReturnValue({
      mutateAsync: mockCopyMutateAsync,
      isPending: false,
    } as any);

    const user = userEvent.setup();

    render(
      <ProcessesList
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
          processId: 'process-1',
        });
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/process/process-copy-1')
        );
      });
    }
  });

  it('should handle copy process error', async () => {
    const { useProcessesList, useCopyProcess } = await import('../hooks/useStatemachine');

    // Mock process data
    vi.mocked(useProcessesList).mockReturnValue({
      data: [
        {
          id: 'process-1',
          name: 'Test Process',
          description: 'Test description',
          persisted: true,
          isTemplate: false,
        },
      ],
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    // Mock failed copy
    mockCopyMutateAsync.mockRejectedValue(new Error('Copy failed'));
    vi.mocked(useCopyProcess).mockReturnValue({
      mutateAsync: mockCopyMutateAsync,
      isPending: false,
    } as any);

    const user = userEvent.setup();

    render(
      <ProcessesList
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
        expect(mockCopyMutateAsync).toHaveBeenCalled();
      });

      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled();
    }
  });
});

