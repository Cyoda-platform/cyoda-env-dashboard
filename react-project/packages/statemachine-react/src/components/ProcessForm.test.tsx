/**
 * Tests for ProcessForm component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ProcessForm } from './ProcessForm';

const mockCreateProcessMutateAsync = vi.fn();
const mockUpdateProcessMutateAsync = vi.fn();
const mockOnSubmitted = vi.fn();

// Mock the hooks
vi.mock('../hooks/useStatemachine', () => ({
  useProcess: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
  useProcessorsList: vi.fn(() => ({
    data: [
      { name: 'com.example.Processor1', entityClass: 'com.example.Order', parameters: [] },
      { name: 'com.example.Processor2', entityClass: 'com.example.Order', parameters: [] }
    ],
    isLoading: false,
  })),
  useCreateProcess: vi.fn(() => ({
    mutateAsync: mockCreateProcessMutateAsync,
    isPending: false,
  })),
  useUpdateProcess: vi.fn(() => ({
    mutateAsync: mockUpdateProcessMutateAsync,
    isPending: false,
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ProcessForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form in embedded mode', () => {
    render(
      <ProcessForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('should render processor dropdown', () => {
    render(
      <ProcessForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/Processor/i)).toBeInTheDocument();
  });

  it('should render all toggles', () => {
    render(
      <ProcessForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Sync Process')).toBeInTheDocument();
    expect(screen.getByText('New Transaction for Async')).toBeInTheDocument();
    expect(screen.getByText('Template')).toBeInTheDocument();
  });

  it('should render Create button for new process', () => {
    render(
      <ProcessForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('should render Update button for existing process', async () => {
    const statemachineHooks = await import('../hooks/useStatemachine');

    vi.mocked(statemachineHooks.useProcess).mockReturnValue({
      data: {
        id: 'process-1',
        name: 'Test Process',
        description: 'Test Description',
        processorClassName: 'com.example.Processor1',
        syncProcess: false,
        newTransactionForAsync: false,
        isTemplate: false,
      },
      isLoading: false,
    } as any);

    render(
      <ProcessForm
        processId="process-1"
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('should handle form submission for new process', async () => {
    const user = userEvent.setup();
    mockCreateProcessMutateAsync.mockResolvedValue({ id: 'process-1' });

    render(
      <ProcessForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
        onSubmitted={mockOnSubmitted}
      />,
      { wrapper: createWrapper() }
    );

    // Fill in the form
    const nameInput = screen.getByLabelText(/Name/i);
    await user.type(nameInput, 'Test Process');

    const descriptionInput = screen.getByLabelText(/Description/i);
    await user.type(descriptionInput, 'Test Description');

    // Submit the form
    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(mockCreateProcessMutateAsync).toHaveBeenCalledWith({
        persistedType: 'draft',
        form: expect.objectContaining({
          name: 'Test Process',
          description: 'Test Description',
          entityClassName: 'com.example.Order',
        }),
      });
    });

    await waitFor(() => {
      expect(mockOnSubmitted).toHaveBeenCalledWith({ id: 'process-1' });
    });
  });

  it('should handle form submission for updating process', async () => {
    const user = userEvent.setup();
    const statemachineHooks = await import('../hooks/useStatemachine');

    vi.mocked(statemachineHooks.useProcess).mockReturnValue({
      data: {
        id: 'process-1',
        name: 'Test Process',
        description: 'Test Description',
        processorClassName: 'com.example.Processor1',
        syncProcess: false,
        newTransactionForAsync: false,
        isTemplate: false,
      },
      isLoading: false,
    } as any);

    mockUpdateProcessMutateAsync.mockResolvedValue({ id: 'process-1' });

    render(
      <ProcessForm
        processId="process-1"
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
        onSubmitted={mockOnSubmitted}
      />,
      { wrapper: createWrapper() }
    );

    // Update the name
    const nameInput = screen.getByLabelText(/Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Process');

    // Submit the form
    const updateButton = screen.getByText('Update');
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockUpdateProcessMutateAsync).toHaveBeenCalledWith({
        persistedType: 'draft',
        processId: 'process-1',
        form: expect.objectContaining({
          name: 'Updated Process',
        }),
      });
    });

    await waitFor(() => {
      expect(mockOnSubmitted).toHaveBeenCalledWith({ id: 'process-1' });
    });
  });

  it('should show processor input when template is enabled', async () => {
    const user = userEvent.setup();
    
    render(
      <ProcessForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    // Find and click the Template toggle
    const templateToggles = screen.getAllByRole('switch');
    const templateToggle = templateToggles.find((toggle) => {
      const parent = toggle.closest('.ant-space-item');
      return parent?.textContent?.includes('Template');
    });

    if (templateToggle) {
      await user.click(templateToggle);

      await waitFor(() => {
        // Should show input instead of select
        const processorInput = screen.getByLabelText(/Processor/i);
        expect(processorInput.tagName).toBe('INPUT');
      });
    }
  });

  it('should disable fields when persistedType is transient', () => {
    render(
      <ProcessForm
        entityClassName="com.example.Order"
        persistedType="transient"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByLabelText(/Name/i);
    expect(nameInput).toBeDisabled();

    const descriptionInput = screen.getByLabelText(/Description/i);
    expect(descriptionInput).toBeDisabled();
  });

  it('should populate form fields when editing existing process', async () => {
    const statemachineHooks = await import('../hooks/useStatemachine');

    vi.mocked(statemachineHooks.useProcess).mockReturnValue({
      data: {
        id: 'process-1',
        name: 'Existing Process',
        description: 'Existing Description',
        processorClassName: 'com.example.Processor1',
        syncProcess: true,
        newTransactionForAsync: true,
        isTemplate: false,
      },
      isLoading: false,
    } as any);

    render(
      <ProcessForm
        processId="process-1"
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Existing Process');
    });

    const descriptionInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    expect(descriptionInput.value).toBe('Existing Description');
  });

  it('should call onSubmitted callback with created process ID', async () => {
    const user = userEvent.setup();
    mockCreateProcessMutateAsync.mockResolvedValue({ id: 'new-process-id' });

    render(
      <ProcessForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
        onSubmitted={mockOnSubmitted}
      />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByLabelText(/Name/i);
    await user.type(nameInput, 'Test Process');

    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(mockOnSubmitted).toHaveBeenCalledWith({ id: 'new-process-id' });
    });
  });

  it('should handle toggle changes', async () => {
    const user = userEvent.setup();
    
    render(
      <ProcessForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    // Find and click the Sync Process toggle
    const toggles = screen.getAllByRole('switch');
    const syncToggle = toggles.find((toggle) => {
      const parent = toggle.closest('.ant-space-item');
      return parent?.textContent?.includes('Sync Process');
    });

    if (syncToggle) {
      await user.click(syncToggle);
      
      // Toggle should be checked
      await waitFor(() => {
        expect(syncToggle).toBeChecked();
      });
    }
  });
});

