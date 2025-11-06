/**
 * Tests for Transition page component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import { Transition } from './Transition';

const mockNavigate = vi.fn();
const mockCreateTransitionMutateAsync = vi.fn();
const mockUpdateTransitionMutateAsync = vi.fn();
const mockCreateStateMutateAsync = vi.fn();

// Mock the hooks
vi.mock('../hooks/useStatemachine', () => ({
  useTransition: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
  useStatesList: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useCriteriaList: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useProcessesList: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useCreateTransition: vi.fn(() => ({
    mutateAsync: mockCreateTransitionMutateAsync,
    isPending: false,
  })),
  useUpdateTransition: vi.fn(() => ({
    mutateAsync: mockUpdateTransitionMutateAsync,
    isPending: false,
  })),
  useCreateState: vi.fn(() => ({
    mutateAsync: mockCreateStateMutateAsync,
    isPending: false,
  })),
  useCriteria: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
  useProcess: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
  useCriteriacheckers: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useProcessorsList: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useCreateCriteria: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUpdateCriteria: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useCreateProcess: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUpdateProcess: vi.fn(() => ({
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
    useParams: () => ({
      persistedType: 'draft',
      workflowId: 'workflow-1',
      transitionId: 'new',
    }),
    useSearchParams: () => [new URLSearchParams('entityClassName=com.example.Order')],
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
        <Routes>
          <Route path="*" element={children} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Transition Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the transition form', () => {
    render(<Transition />, { wrapper: createWrapper() });
    expect(screen.getByText('Transition Details')).toBeInTheDocument();
  });

  it('should render form fields', () => {
    render(<Transition />, { wrapper: createWrapper() });
    
    // Check for key form fields
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('should render Active, Manual, and Automated toggles', () => {
    render(<Transition />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Manual')).toBeInTheDocument();
    expect(screen.getByText('Automated')).toBeInTheDocument();
  });

  it('should render state selection dropdowns', () => {
    render(<Transition />, { wrapper: createWrapper() });
    
    expect(screen.getByLabelText(/Start State/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End State/i)).toBeInTheDocument();
  });

  it('should render criteria and process selection', () => {
    render(<Transition />, { wrapper: createWrapper() });
    
    expect(screen.getByLabelText(/Criteria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Process/i)).toBeInTheDocument();
  });

  it('should render "Add new +" buttons for criteria and process', () => {
    render(<Transition />, { wrapper: createWrapper() });
    
    const addButtons = screen.getAllByRole('button').filter(
      (btn) => btn.textContent?.includes('Add new')
    );
    
    expect(addButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('should render "Create new State" button', () => {
    render(<Transition />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Create new State')).toBeInTheDocument();
  });

  it('should show new state creation form when "Create new State" is clicked', async () => {
    const user = userEvent.setup();
    render(<Transition />, { wrapper: createWrapper() });
    
    const createStateButton = screen.getByText('Create new State');
    await user.click(createStateButton);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter state name/i)).toBeInTheDocument();
    });
  });

  it('should render action buttons for new transition', () => {
    render(<Transition />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Create & Add Another')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should open criteria modal when "Add new +" is clicked', async () => {
    const user = userEvent.setup();
    render(<Transition />, { wrapper: createWrapper() });
    
    // Find the "Add new +" button for criteria
    const addButtons = screen.getAllByRole('button').filter(
      (btn) => btn.textContent?.includes('Add new')
    );
    
    if (addButtons.length > 0) {
      await user.click(addButtons[0]);
      
      await waitFor(() => {
        // Modal should be visible
        const modals = document.querySelectorAll('.ant-modal');
        expect(modals.length).toBeGreaterThan(0);
      });
    }
  });

  it('should open process modal when "Add new +" is clicked', async () => {
    const user = userEvent.setup();
    render(<Transition />, { wrapper: createWrapper() });
    
    // Find the "Add new +" button for process
    const addButtons = screen.getAllByRole('button').filter(
      (btn) => btn.textContent?.includes('Add new')
    );
    
    if (addButtons.length > 1) {
      await user.click(addButtons[1]);
      
      await waitFor(() => {
        // Modal should be visible
        const modals = document.querySelectorAll('.ant-modal');
        expect(modals.length).toBeGreaterThan(0);
      });
    }
  });

  it('should handle form submission for new transition', async () => {
    const user = userEvent.setup();
    mockCreateTransitionMutateAsync.mockResolvedValue({ id: 'trans-1' });
    
    render(<Transition />, { wrapper: createWrapper() });
    
    // Fill in the form
    const nameInput = screen.getByLabelText(/Name/i);
    await user.type(nameInput, 'Test Transition');
    
    // Submit the form
    const createButton = screen.getByText('Create');
    await user.click(createButton);
    
    await waitFor(() => {
      expect(mockCreateTransitionMutateAsync).toHaveBeenCalled();
    });
  });

  it('should handle "Create & Add Another" workflow', async () => {
    const user = userEvent.setup();
    mockCreateTransitionMutateAsync.mockResolvedValue({ id: 'trans-1' });
    
    render(<Transition />, { wrapper: createWrapper() });
    
    // Fill in the form
    const nameInput = screen.getByLabelText(/Name/i);
    await user.type(nameInput, 'Test Transition');
    
    // Click "Create & Add Another"
    const createAndAddButton = screen.getByText('Create & Add Another');
    await user.click(createAndAddButton);
    
    await waitFor(() => {
      expect(mockCreateTransitionMutateAsync).toHaveBeenCalled();
    });
    
    // Form should be reset (name field should be empty)
    await waitFor(() => {
      expect(nameInput).toHaveValue('');
    });
  });

  it('should navigate to workflow detail on cancel', async () => {
    const user = userEvent.setup();
    render(<Transition />, { wrapper: createWrapper() });
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/workflow-detail/')
      );
    });
  });

  it('should create state after transition when new state is specified', async () => {
    const user = userEvent.setup();
    mockCreateTransitionMutateAsync.mockResolvedValue({ id: 'trans-1' });
    mockCreateStateMutateAsync.mockResolvedValue({ id: 'state-1' });
    
    render(<Transition />, { wrapper: createWrapper() });
    
    // Click "Create new State"
    const createStateButton = screen.getByText('Create new State');
    await user.click(createStateButton);
    
    // Fill in new state details
    await waitFor(() => {
      const stateNameInput = screen.getByPlaceholderText(/Enter state name/i);
      expect(stateNameInput).toBeInTheDocument();
    });
    
    const stateNameInput = screen.getByPlaceholderText(/Enter state name/i);
    await user.type(stateNameInput, 'New State');
    
    // Fill in transition name
    const nameInput = screen.getByLabelText(/Name/i);
    await user.type(nameInput, 'Test Transition');
    
    // Submit the form
    const createButton = screen.getByText('Create');
    await user.click(createButton);
    
    await waitFor(() => {
      expect(mockCreateTransitionMutateAsync).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(mockCreateStateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          transitionId: 'trans-1',
          form: expect.objectContaining({
            name: 'New State',
          }),
        })
      );
    });
  });
});

