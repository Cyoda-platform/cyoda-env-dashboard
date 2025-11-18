/**
 * Process Page Tests
 * Tests for the Process page component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Process } from './Process';
import { message } from 'antd';

// Mock hooks
const mockUseProcess = vi.fn();
const mockUseProcessorsList = vi.fn();
const mockUseEntityParentClasses = vi.fn();
const mockCreateProcessMutateAsync = vi.fn();
const mockUpdateProcessMutateAsync = vi.fn();

vi.mock('../hooks/useStatemachine', () => ({
  useProcess: (persistedType: string, processId: string, entityClassName: string, enabled: boolean) =>
    mockUseProcess(persistedType, processId, entityClassName, enabled),
  useProcessorsList: () => mockUseProcessorsList(),
  useEntityParentClasses: (entityClassName: string) => mockUseEntityParentClasses(entityClassName),
  useCreateProcess: () => ({
    mutateAsync: mockCreateProcessMutateAsync,
    isPending: false,
  }),
  useUpdateProcess: () => ({
    mutateAsync: mockUpdateProcessMutateAsync,
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
  processId = 'new',
  searchParams = 'workflowId=workflow-1&persistedType=persisted&entityClassName=com.example.Order&workflowPersistedType=persisted'
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/process/${processId}?${searchParams}`]}>
        <Routes>
          <Route path="/process/:processId" element={children} />
          <Route path="/workflow/:workflowId" element={<div>Workflow Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Process Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProcess.mockReturnValue({
      data: null,
      isLoading: false,
    });
    mockUseProcessorsList.mockReturnValue({
      data: [
        'com.example.Processor1',
        'com.example.Processor2',
        {
          name: 'com.example.ProcessorWithParams',
          entityClass: 'com.example.Order',
          parameters: [
            { name: 'param1', type: 'string', availableValues: [] },
            { name: 'param2', type: 'integer', availableValues: [] },
          ],
        },
      ],
      isLoading: false,
    });
    mockUseEntityParentClasses.mockReturnValue({
      data: ['com.example.BaseEntity'],
      isLoading: false,
    });
  });

  describe('Rendering - New Process', () => {
    it('should render the page with back button', () => {
      render(<Process />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /back to workflow/i })).toBeInTheDocument();
    });

    it('should render form with required fields', () => {
      render(<Process />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/processor/i)).toBeInTheDocument();
    });

    it('should show "Create New Process" title for new process', () => {
      render(<Process />, { wrapper: createWrapper('new') });

      expect(screen.getByText('Create New Process')).toBeInTheDocument();
    });

    it('should show "Create Process" button for new process', () => {
      render(<Process />, { wrapper: createWrapper('new') });

      expect(screen.getByRole('button', { name: /create process/i })).toBeInTheDocument();
    });

    it('should show Cancel button', () => {
      render(<Process />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Rendering - Edit Process', () => {
    it('should load existing process data', async () => {
      mockUseProcess.mockReturnValue({
        data: {
          id: 'process-123',
          name: 'Send Email',
          description: 'Send notification email',
          processorClassName: 'com.example.Processor1',
          processParameters: [],
        },
        isLoading: false,
      });

      render(<Process />, { wrapper: createWrapper('process-123') });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Send Email')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Send notification email')).toBeInTheDocument();
      });
    });

    it('should show process name in title when editing', async () => {
      mockUseProcess.mockReturnValue({
        data: {
          id: 'process-123',
          name: 'Validate Order',
          description: 'Validate order data',
          processorClassName: 'com.example.Processor2',
        },
        isLoading: false,
      });

      render(<Process />, { wrapper: createWrapper('process-123') });

      await waitFor(() => {
        expect(screen.getByText('Process: Validate Order')).toBeInTheDocument();
      });
    });

    it('should show "Update Process" button when editing', async () => {
      mockUseProcess.mockReturnValue({
        data: {
          id: 'process-123',
          name: 'Test Process',
          processorClassName: 'com.example.Processor1',
        },
        isLoading: false,
      });

      render(<Process />, { wrapper: createWrapper('process-123') });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /update process/i })).toBeInTheDocument();
      });
    });
  });

  describe('Processor Selection', () => {
    it('should display processor options', async () => {
      render(<Process />, { wrapper: createWrapper() });

      const processorSelect = screen.getByLabelText(/processor/i);
      fireEvent.mouseDown(processorSelect);

      await waitFor(() => {
        // Processors are displayed with short names (last part after dot)
        expect(screen.getByText('ProcessorWithParams')).toBeInTheDocument();
      });
    });

    it('should filter processors by entity class', () => {
      mockUseProcessorsList.mockReturnValue({
        data: [
          {
            name: 'com.example.OrderProcessor',
            entityClass: 'com.example.Order',
          },
          {
            name: 'com.example.ProductProcessor',
            entityClass: 'com.example.Product',
          },
        ],
        isLoading: false,
      });

      render(<Process />, { wrapper: createWrapper() });

      const processorSelect = screen.getByLabelText(/processor/i);
      fireEvent.mouseDown(processorSelect);

      // Should show OrderProcessor (matches entity class)
      expect(screen.queryByText('OrderProcessor')).toBeInTheDocument();
      // Should not show ProductProcessor (doesn't match entity class)
      expect(screen.queryByText('ProductProcessor')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should require name field', async () => {
      render(<Process />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /create process/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a name/i)).toBeInTheDocument();
      });
    });

    it('should require processor selection', async () => {
      const user = userEvent.setup();
      render(<Process />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/^name$/i);
      await user.type(nameInput, 'Test Process');

      const submitButton = screen.getByRole('button', { name: /create process/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please select a processor/i)).toBeInTheDocument();
      });
    });
  });

  describe('Create Process', () => {
    it('should render create process form', () => {
      render(<Process />, { wrapper: createWrapper() });

      expect(screen.getByText('Create New Process')).toBeInTheDocument();
      expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/processor/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create process/i })).toBeInTheDocument();
    });

    it('should have processor select with options', async () => {
      render(<Process />, { wrapper: createWrapper() });

      const processorSelect = screen.getByLabelText(/processor/i);
      fireEvent.mouseDown(processorSelect);

      await waitFor(() => {
        expect(screen.getByText('ProcessorWithParams')).toBeInTheDocument();
      });
    });

    // Note: Full form submission tests are complex due to Ant Design Select behavior
    // These would require more sophisticated mocking or E2E tests
  });

  describe('Update Process', () => {
    beforeEach(() => {
      mockUseProcess.mockReturnValue({
        data: {
          id: 'process-123',
          name: 'Send Email',
          description: 'Send notification',
          processorClassName: 'com.example.Processor1',
          processParameters: [],
        },
        isLoading: false,
      });
    });

    it('should update existing process with form data', async () => {
      const user = userEvent.setup();
      mockUpdateProcessMutateAsync.mockResolvedValue({ id: 'process-123' });

      render(<Process />, { wrapper: createWrapper('process-123') });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Send Email')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/^name$/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Process');

      const submitButton = screen.getByRole('button', { name: /update process/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateProcessMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            persistedType: 'persisted',
            processId: 'process-123',
            form: expect.objectContaining({
              name: 'Updated Process',
            }),
          })
        );
      });
    });

    it('should show success message after updating process', async () => {
      mockUpdateProcessMutateAsync.mockResolvedValue({ id: 'process-123' });

      render(<Process />, { wrapper: createWrapper('process-123') });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Send Email')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /update process/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(message.success)).toHaveBeenCalledWith('Process updated successfully');
      });
    });

    it('should show error message on update failure', async () => {
      mockUpdateProcessMutateAsync.mockRejectedValue(new Error('API Error'));

      render(<Process />, { wrapper: createWrapper('process-123') });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Send Email')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /update process/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(message.error)).toHaveBeenCalledWith('Failed to save process: API Error');
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back to workflow detail on cancel', async () => {
      render(<Process />, { wrapper: createWrapper() });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Workflow Detail Page')).toBeInTheDocument();
      });
    });

    it('should navigate back to workflow detail on back button click', async () => {
      render(<Process />, { wrapper: createWrapper() });

      const backButton = screen.getByRole('button', { name: /back to workflow/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Workflow Detail Page')).toBeInTheDocument();
      });
    });
  });

  describe('Runtime Mode', () => {
    it('should disable form fields in runtime mode', () => {
      mockUseProcess.mockReturnValue({
        data: {
          id: 'process-123',
          name: 'Test Process',
          processorClassName: 'com.example.Processor1',
        },
        isLoading: false,
      });

      render(
        <Process />,
        {
          wrapper: createWrapper(
            'process-123',
            'workflowId=workflow-1&persistedType=runtime&entityClassName=com.example.Order&workflowPersistedType=runtime'
          ),
        }
      );

      const nameInput = screen.getByLabelText(/^name$/i);
      const submitButton = screen.getByRole('button', { name: /update process/i });

      expect(nameInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Loading States', () => {
    it('should handle loading state', () => {
      mockUseProcess.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<Process />, { wrapper: createWrapper('process-123') });

      // Form should still render
      expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    });

    it('should handle loading processors', () => {
      mockUseProcessorsList.mockReturnValue({
        data: [],
        isLoading: true,
      });

      render(<Process />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/processor/i)).toBeInTheDocument();
    });
  });
});
