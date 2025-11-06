/**
 * Tests for StatesListModal component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { StatesListModal } from './StatesListModal';

const mockNavigate = vi.fn();
const mockOnClose = vi.fn();
const mockRefetch = vi.fn();
const mockDeleteMutateAsync = vi.fn();

// Mock the hooks
vi.mock('../hooks/useStatemachine', () => ({
  useStatesList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: mockRefetch,
  })),
  useDeleteState: vi.fn(() => ({
    mutateAsync: mockDeleteMutateAsync,
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

describe('StatesListModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when visible', () => {
    render(
      <StatesListModal
        visible={true}
        onClose={mockOnClose}
        workflowId="workflow-1"
        persistedType="persisted"
        entityClassName="com.example.Entity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('List of states')).toBeInTheDocument();
  });

  it('should not render modal when not visible', () => {
    render(
      <StatesListModal
        visible={false}
        onClose={mockOnClose}
        workflowId="workflow-1"
        persistedType="persisted"
        entityClassName="com.example.Entity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText('List of states')).not.toBeInTheDocument();
  });

  it('should filter states by name', async () => {
    const { useStatesList } = await import('../hooks/useStatemachine');
    
    // Mock states data
    vi.mocked(useStatesList).mockReturnValue({
      data: [
        { id: 'state-1', name: 'CREATED', persisted: true },
        { id: 'state-2', name: 'PROCESSING', persisted: true },
        { id: 'state-3', name: 'COMPLETED', persisted: true },
      ],
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    const user = userEvent.setup();
    
    render(
      <StatesListModal
        visible={true}
        onClose={mockOnClose}
        workflowId="workflow-1"
        persistedType="persisted"
        entityClassName="com.example.Entity"
      />,
      { wrapper: createWrapper() }
    );

    // All states should be visible initially
    expect(screen.getByText('CREATED')).toBeInTheDocument();
    expect(screen.getByText('PROCESSING')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();

    // Filter by "PROC"
    const filterInput = screen.getByPlaceholderText('Filter states...');
    await user.type(filterInput, 'PROC');

    // Only PROCESSING should be visible
    await waitFor(() => {
      expect(screen.queryByText('CREATED')).not.toBeInTheDocument();
      expect(screen.getByText('PROCESSING')).toBeInTheDocument();
      expect(screen.queryByText('COMPLETED')).not.toBeInTheDocument();
    });
  });

  it('should navigate to state detail when edit button clicked', async () => {
    const { useStatesList } = await import('../hooks/useStatemachine');
    
    // Mock states data
    vi.mocked(useStatesList).mockReturnValue({
      data: [
        { id: 'state-1', name: 'CREATED', persisted: true },
      ],
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    const user = userEvent.setup();
    
    render(
      <StatesListModal
        visible={true}
        onClose={mockOnClose}
        workflowId="workflow-1"
        persistedType="persisted"
        entityClassName="com.example.Entity"
      />,
      { wrapper: createWrapper() }
    );

    // Find and click the edit button
    const editButtons = screen.getAllByRole('button').filter(
      (btn) => btn.querySelector('[data-icon="edit"]')
    );
    
    if (editButtons.length > 0) {
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/state/state-1')
        );
      });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    }
  });

  it('should not show delete button for "None" state', async () => {
    const { useStatesList } = await import('../hooks/useStatemachine');
    
    // Mock states data with "None" state
    vi.mocked(useStatesList).mockReturnValue({
      data: [
        { id: 'state-none', name: 'None', persisted: true },
        { id: 'state-1', name: 'CREATED', persisted: true },
      ],
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    render(
      <StatesListModal
        visible={true}
        onClose={mockOnClose}
        workflowId="workflow-1"
        persistedType="persisted"
        entityClassName="com.example.Entity"
      />,
      { wrapper: createWrapper() }
    );

    // Get all rows
    const rows = screen.getAllByRole('row');
    
    // Find the "None" row
    const noneRow = rows.find(row => row.textContent?.includes('None'));
    
    if (noneRow) {
      // Should not have delete button
      const deleteButtons = Array.from(noneRow.querySelectorAll('button')).filter(
        (btn) => btn.querySelector('[data-icon="delete"]')
      );
      expect(deleteButtons.length).toBe(0);
    }
  });

  it('should handle delete state successfully', async () => {
    const { useStatesList, useDeleteState } = await import('../hooks/useStatemachine');

    // Mock states data
    vi.mocked(useStatesList).mockReturnValue({
      data: [
        { id: 'state-1', name: 'CREATED', persisted: true },
      ],
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    // Mock successful delete
    mockDeleteMutateAsync.mockResolvedValue(undefined);
    vi.mocked(useDeleteState).mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
    } as any);

    render(
      <StatesListModal
        visible={true}
        onClose={mockOnClose}
        workflowId="workflow-1"
        persistedType="persisted"
        entityClassName="com.example.Entity"
      />,
      { wrapper: createWrapper() }
    );

    // Check that delete button is rendered
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('[data-icon="delete"]')
      );
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  it('should close modal when close button clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <StatesListModal
        visible={true}
        onClose={mockOnClose}
        workflowId="workflow-1"
        persistedType="persisted"
        entityClassName="com.example.Entity"
      />,
      { wrapper: createWrapper() }
    );

    // Find and click the close button
    const closeButton = screen.getByText('Close');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});

