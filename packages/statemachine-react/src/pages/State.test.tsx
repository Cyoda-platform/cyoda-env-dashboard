/**
 * State Page Tests
 * Tests for the State page component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { State } from './State';
import { message } from 'antd';

// Mock hooks
const mockUseState = vi.fn();
const mockCreateStateMutateAsync = vi.fn();
const mockUpdateStateMutateAsync = vi.fn();

vi.mock('../hooks/useStatemachine', () => ({
  useState: (persistedType: string, workflowId: string, stateId: string, enabled: boolean) =>
    mockUseState(persistedType, workflowId, stateId, enabled),
  useCreateState: () => ({
    mutateAsync: mockCreateStateMutateAsync,
    isPending: false,
  }),
  useUpdateState: () => ({
    mutateAsync: mockUpdateStateMutateAsync,
    isPending: false,
  }),
}));

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

const createWrapper = (
  stateId = 'new',
  searchParams = 'workflowId=workflow-1&persistedType=persisted&entityClassName=com.example.Order'
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/state/${stateId}?${searchParams}`]}>
        <Routes>
          <Route path="/state/:stateId" element={children} />
          <Route path="/workflow/:workflowId" element={<div>Workflow Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('State Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseState.mockReturnValue({
      data: null,
      isLoading: false,
    });
  });

  describe('Rendering - New State', () => {
    it('should render the page with back button', () => {
      render(<State />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /back to workflow/i })).toBeInTheDocument();
    });

    it('should render form with name and description fields', () => {
      render(<State />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('should show "Create New State" title for new state', () => {
      render(<State />, { wrapper: createWrapper('new') });

      expect(screen.getByText('Create New State')).toBeInTheDocument();
    });

    it('should show "Create State" button for new state', () => {
      render(<State />, { wrapper: createWrapper('new') });

      expect(screen.getByRole('button', { name: /create state/i })).toBeInTheDocument();
    });

    it('should show Cancel button', () => {
      render(<State />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Rendering - Edit State', () => {
    it('should load existing state data', async () => {
      mockUseState.mockReturnValue({
        data: {
          id: 'state-123',
          name: 'Pending',
          description: 'Order is pending approval',
        },
        isLoading: false,
      });

      render(<State />, { wrapper: createWrapper('state-123') });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Pending')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Order is pending approval')).toBeInTheDocument();
      });
    });

    it('should show state name in title when editing', async () => {
      mockUseState.mockReturnValue({
        data: {
          id: 'state-123',
          name: 'Approved',
          description: 'Order approved',
        },
        isLoading: false,
      });

      render(<State />, { wrapper: createWrapper('state-123') });

      await waitFor(() => {
        expect(screen.getByText('State: Approved')).toBeInTheDocument();
      });
    });

    it('should show "Update State" button when editing', async () => {
      mockUseState.mockReturnValue({
        data: {
          id: 'state-123',
          name: 'Approved',
        },
        isLoading: false,
      });

      render(<State />, { wrapper: createWrapper('state-123') });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /update state/i })).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should require name field', async () => {
      render(<State />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /create state/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a name/i)).toBeInTheDocument();
      });
    });

    it('should allow submission with valid name', async () => {
      const user = userEvent.setup();
      mockCreateStateMutateAsync.mockResolvedValue({ id: 'new-state' });

      render(<State />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'New State');

      const submitButton = screen.getByRole('button', { name: /create state/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateStateMutateAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Create State', () => {
    it('should create new state with form data', async () => {
      const user = userEvent.setup();
      mockCreateStateMutateAsync.mockResolvedValue({ id: 'new-state' });

      render(<State />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/name/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.type(nameInput, 'Pending');
      await user.type(descriptionInput, 'Order is pending');

      const submitButton = screen.getByRole('button', { name: /create state/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateStateMutateAsync).toHaveBeenCalledWith({
          persistedType: 'persisted',
          workflowId: 'workflow-1',
          stateData: {
            name: 'Pending',
            description: 'Order is pending',
            workflowId: 'workflow-1',
            entityClassName: 'com.example.Order',
          },
        });
      });
    });

    it('should show success message after creating state', async () => {
      const user = userEvent.setup();
      mockCreateStateMutateAsync.mockResolvedValue({ id: 'new-state' });

      render(<State />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'New State');

      const submitButton = screen.getByRole('button', { name: /create state/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(message.success)).toHaveBeenCalledWith('State created successfully');
      });
    });

    it('should navigate to workflow detail after creating state', async () => {
      const user = userEvent.setup();
      mockCreateStateMutateAsync.mockResolvedValue({ id: 'new-state' });

      render(<State />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'New State');

      const submitButton = screen.getByRole('button', { name: /create state/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Workflow Detail Page')).toBeInTheDocument();
      });
    });

    it('should show error message on create failure', async () => {
      const user = userEvent.setup();
      mockCreateStateMutateAsync.mockRejectedValue(new Error('API Error'));

      render(<State />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'New State');

      const submitButton = screen.getByRole('button', { name: /create state/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(message.error)).toHaveBeenCalledWith('Failed to save state');
      });
    });
  });

  describe('Update State', () => {
    beforeEach(() => {
      mockUseState.mockReturnValue({
        data: {
          id: 'state-123',
          name: 'Pending',
          description: 'Order is pending',
        },
        isLoading: false,
      });
    });

    it('should update existing state with form data', async () => {
      const user = userEvent.setup();
      mockUpdateStateMutateAsync.mockResolvedValue({ id: 'state-123' });

      render(<State />, { wrapper: createWrapper('state-123') });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Pending')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Approved');

      const submitButton = screen.getByRole('button', { name: /update state/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateStateMutateAsync).toHaveBeenCalledWith({
          persistedType: 'persisted',
          workflowId: 'workflow-1',
          stateId: 'state-123',
          stateData: {
            name: 'Approved',
            description: 'Order is pending',
            workflowId: 'workflow-1',
            entityClassName: 'com.example.Order',
          },
        });
      });
    });

    it('should show success message after updating state', async () => {
      mockUpdateStateMutateAsync.mockResolvedValue({ id: 'state-123' });

      render(<State />, { wrapper: createWrapper('state-123') });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Pending')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /update state/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(message.success)).toHaveBeenCalledWith('State updated successfully');
      });
    });

    it('should show error message on update failure', async () => {
      mockUpdateStateMutateAsync.mockRejectedValue(new Error('API Error'));

      render(<State />, { wrapper: createWrapper('state-123') });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Pending')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /update state/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(message.error)).toHaveBeenCalledWith('Failed to save state');
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back to workflow detail on cancel', async () => {
      render(<State />, { wrapper: createWrapper() });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Workflow Detail Page')).toBeInTheDocument();
      });
    });

    it('should navigate back to workflow detail on back button click', async () => {
      render(<State />, { wrapper: createWrapper() });

      const backButton = screen.getByRole('button', { name: /back to workflow/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Workflow Detail Page')).toBeInTheDocument();
      });
    });

    it('should preserve query parameters in navigation', async () => {
      const user = userEvent.setup();
      mockCreateStateMutateAsync.mockResolvedValue({ id: 'new-state' });

      render(
        <State />,
        {
          wrapper: createWrapper(
            'new',
            'workflowId=wf-789&persistedType=draft&entityClassName=com.example.Product'
          ),
        }
      );

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'New State');

      const submitButton = screen.getByRole('button', { name: /create state/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateStateMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            persistedType: 'draft',
            workflowId: 'wf-789',
            stateData: expect.objectContaining({
              entityClassName: 'com.example.Product',
            }),
          })
        );
      });
    });
  });

  describe('Runtime Mode', () => {
    it('should disable form fields in runtime mode', () => {
      mockUseState.mockReturnValue({
        data: {
          id: 'state-123',
          name: 'Active',
          description: 'Active state',
        },
        isLoading: false,
      });

      render(
        <State />,
        {
          wrapper: createWrapper(
            'state-123',
            'workflowId=workflow-1&persistedType=runtime&entityClassName=com.example.Order'
          ),
        }
      );

      const nameInput = screen.getByLabelText(/name/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const submitButton = screen.getByRole('button', { name: /update state/i });

      expect(nameInput).toBeDisabled();
      expect(descriptionInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('should not disable cancel button in runtime mode', () => {
      render(
        <State />,
        {
          wrapper: createWrapper(
            'new',
            'workflowId=workflow-1&persistedType=runtime&entityClassName=com.example.Order'
          ),
        }
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe('Loading States', () => {
    it('should handle loading state', () => {
      mockUseState.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<State />, { wrapper: createWrapper('state-123') });

      // Form should still render
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
  });
});

