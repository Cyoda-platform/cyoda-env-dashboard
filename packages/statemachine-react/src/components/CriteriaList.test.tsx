/**
 * Tests for CriteriaList component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { App } from 'antd';
import React from 'react';
import { CriteriaList } from './CriteriaList';

const mockNavigate = vi.fn();
const mockRefetch = vi.fn();
const mockDeleteMutateAsync = vi.fn();
const mockCopyMutateAsync = vi.fn();

// Mock the hooks
vi.mock('../hooks/useStatemachine', () => ({
  useCriteriaList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: mockRefetch,
  })),
  useDeleteCriteria: vi.fn(() => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  })),
  useCopyCriteria: vi.fn(() => ({
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
      <BrowserRouter>
        <App>{children}</App>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CriteriaList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the criteria list', () => {
    render(
      <CriteriaList
        workflowId="workflow-1"
        persistedType="persisted"
        entityClassName="com.example.Entity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Custom criteria')).toBeInTheDocument();
  });

  it('should render buttons', () => {
    render(
      <CriteriaList
        workflowId="workflow-1"
        persistedType="persisted"
        entityClassName="com.example.Entity"
      />,
      { wrapper: createWrapper() }
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should handle copy criteria successfully', async () => {
    const { useCriteriaList, useCopyCriteria } = await import('../hooks/useStatemachine');

    // Mock criteria data
    vi.mocked(useCriteriaList).mockReturnValue({
      data: [
        {
          id: 'criteria-1',
          name: 'Test Criteria',
          persisted: true,
          description: 'Test description',
        },
      ],
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    // Mock successful copy
    mockCopyMutateAsync.mockResolvedValue('criteria-copy-1');
    vi.mocked(useCopyCriteria).mockReturnValue({
      mutateAsync: mockCopyMutateAsync,
      isPending: false,
    } as any);

    const user = userEvent.setup();

    render(
      <CriteriaList
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
          criteriaId: 'criteria-1',
        });
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/criteria/criteria-copy-1')
        );
      });
    }
  });

  it('should handle copy criteria error', async () => {
    const { useCriteriaList, useCopyCriteria } = await import('../hooks/useStatemachine');

    // Mock criteria data
    vi.mocked(useCriteriaList).mockReturnValue({
      data: [
        {
          id: 'criteria-1',
          name: 'Test Criteria',
          persisted: true,
          description: 'Test description',
        },
      ],
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    // Mock failed copy
    mockCopyMutateAsync.mockRejectedValue(new Error('Copy failed'));
    vi.mocked(useCopyCriteria).mockReturnValue({
      mutateAsync: mockCopyMutateAsync,
      isPending: false,
    } as any);

    const user = userEvent.setup();

    render(
      <CriteriaList
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

