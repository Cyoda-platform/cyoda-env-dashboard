/**
 * Tests for CriteriaForm component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CriteriaForm } from './CriteriaForm';

const mockCreateCriteriaMutateAsync = vi.fn();
const mockUpdateCriteriaMutateAsync = vi.fn();
const mockOnSubmitted = vi.fn();

// Mock the hooks
vi.mock('../hooks/useStatemachine', () => ({
  useCriteria: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
  useCriteriacheckers: vi.fn(() => ({
    data: ['com.example.CriteriaChecker1', 'com.example.CriteriaChecker2'],
    isLoading: false,
  })),
  useCreateCriteria: vi.fn(() => ({
    mutateAsync: mockCreateCriteriaMutateAsync,
    isPending: false,
  })),
  useUpdateCriteria: vi.fn(() => ({
    mutateAsync: mockUpdateCriteriaMutateAsync,
    isPending: false,
  })),
  useEntityParentClasses: vi.fn(() => ({
    data: [],
    isLoading: false,
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

describe('CriteriaForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form in embedded mode', () => {
    render(
      <CriteriaForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('should render criteria checker dropdown', () => {
    render(
      <CriteriaForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/Criteria Checker/i)).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    render(
      <CriteriaForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Criteria Checker/i)).toBeInTheDocument();
  });

  it('should render Create button for new criteria', () => {
    render(
      <CriteriaForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('should render Update button for existing criteria', async () => {
    const statemachineHooks = await import('../hooks/useStatemachine');

    vi.mocked(statemachineHooks.useCriteria).mockReturnValue({
      data: {
        id: 'criteria-1',
        name: 'Test Criteria',
        description: 'Test Description',
        criteriaCheckerClassName: 'com.example.CriteriaChecker1',
        active: true,
        isTemplate: false,
      },
      isLoading: false,
    } as any);

    render(
      <CriteriaForm
        criteriaId="criteria-1"
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('should handle form submission for new criteria', async () => {
    const user = userEvent.setup();
    mockCreateCriteriaMutateAsync.mockResolvedValue({ id: 'criteria-1' });

    render(
      <CriteriaForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
        onSubmitted={mockOnSubmitted}
      />,
      { wrapper: createWrapper() }
    );

    // Fill in the form
    const nameInput = screen.getByLabelText(/Name/i);
    await user.type(nameInput, 'Test Criteria');

    const descriptionInput = screen.getByLabelText(/Description/i);
    await user.type(descriptionInput, 'Test Description');

    // Submit the form
    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(mockCreateCriteriaMutateAsync).toHaveBeenCalledWith({
        persistedType: 'draft',
        form: expect.objectContaining({
          name: 'Test Criteria',
          description: 'Test Description',
          entityClassName: 'com.example.Order',
        }),
      });
    });

    await waitFor(() => {
      expect(mockOnSubmitted).toHaveBeenCalledWith({ id: 'criteria-1' });
    });
  });

  it('should handle form submission for updating criteria', async () => {
    const user = userEvent.setup();
    const statemachineHooks = await import('../hooks/useStatemachine');

    vi.mocked(statemachineHooks.useCriteria).mockReturnValue({
      data: {
        id: 'criteria-1',
        name: 'Test Criteria',
        description: 'Test Description',
        criteriaCheckerClassName: 'com.example.CriteriaChecker1',
        active: true,
        isTemplate: false,
      },
      isLoading: false,
    } as any);

    mockUpdateCriteriaMutateAsync.mockResolvedValue({ id: 'criteria-1' });

    render(
      <CriteriaForm
        criteriaId="criteria-1"
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
    await user.type(nameInput, 'Updated Criteria');

    // Submit the form
    const updateButton = screen.getByText('Update');
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockUpdateCriteriaMutateAsync).toHaveBeenCalledWith({
        persistedType: 'draft',
        criteriaId: 'criteria-1',
        form: expect.objectContaining({
          name: 'Updated Criteria',
        }),
      });
    });

    await waitFor(() => {
      expect(mockOnSubmitted).toHaveBeenCalledWith({ id: 'criteria-1' });
    });
  });

  it('should render criteria checker as a select dropdown', () => {
    render(
      <CriteriaForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    // Criteria checker should be a select (combobox role)
    const criteriaCheckerSelect = screen.getByRole('combobox');
    expect(criteriaCheckerSelect).toBeInTheDocument();
  });

  it('should disable fields when persistedType is transient', () => {
    render(
      <CriteriaForm
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

  it('should populate form fields when editing existing criteria', async () => {
    const statemachineHooks = await import('../hooks/useStatemachine');

    vi.mocked(statemachineHooks.useCriteria).mockReturnValue({
      data: {
        id: 'criteria-1',
        name: 'Existing Criteria',
        description: 'Existing Description',
        criteriaCheckerClassName: 'com.example.CriteriaChecker1',
        active: true,
        isTemplate: false,
      },
      isLoading: false,
    } as any);

    render(
      <CriteriaForm
        criteriaId="criteria-1"
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Existing Criteria');
    });

    const descriptionInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    expect(descriptionInput.value).toBe('Existing Description');
  });

  it('should call onSubmitted callback with created criteria ID', async () => {
    const user = userEvent.setup();
    mockCreateCriteriaMutateAsync.mockResolvedValue({ id: 'new-criteria-id' });

    render(
      <CriteriaForm
        entityClassName="com.example.Order"
        persistedType="draft"
        mode="embedded"
        onSubmitted={mockOnSubmitted}
      />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByLabelText(/Name/i);
    await user.type(nameInput, 'Test Criteria');

    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(mockOnSubmitted).toHaveBeenCalledWith({ id: 'new-criteria-id' });
    });
  });
});

