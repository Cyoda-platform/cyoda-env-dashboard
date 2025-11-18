/**
 * Tests for Transition page component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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
    data: [
      { id: 'state-1', name: 'Start State', persisted: true },
      { id: 'state-2', name: 'End State', persisted: true },
      { id: 'noneState', name: 'None', persisted: true },
    ],
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
  useEntityParentClasses: vi.fn(() => ({
    data: [],
    isLoading: false,
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

const createWrapper = (transitionId = 'new', workflowId = 'workflow-1') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const initialUrl = `/transition/${transitionId}?workflowId=${workflowId}&persistedType=persisted&entityClassName=com.example.Entity`;

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialUrl]}>
        <Routes>
          <Route path="/transition/:transitionId" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Transition Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the transition form', () => {
    render(<Transition />, { wrapper: createWrapper() });
    expect(screen.getByText('Create New Transition')).toBeInTheDocument();
  });

  it('should render form fields', () => {
    render(<Transition />, { wrapper: createWrapper() });

    // Check for key form fields
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('should render Active and Automated toggles', () => {
    render(<Transition />, { wrapper: createWrapper() });

    expect(screen.getByText('Active')).toBeInTheDocument();
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

  it('should render form with all required fields for submission', () => {
    render(<Transition />, { wrapper: createWrapper() });

    // Check that all required fields are present
    expect(screen.getByLabelText(/^Name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start State/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End State/i)).toBeInTheDocument();

    // Check that submit button is present
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('should render "Create & Add Another" button', () => {
    render(<Transition />, { wrapper: createWrapper() });

    // Check that "Create & Add Another" button is present
    expect(screen.getByText('Create & Add Another')).toBeInTheDocument();
  });

  it('should render cancel button and back button', () => {
    render(<Transition />, { wrapper: createWrapper() });

    // Check that cancel button is present
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Back to Workflow')).toBeInTheDocument();
  });

  it('should show new state form when "Create new State" is clicked', async () => {
    const user = userEvent.setup();

    render(<Transition />, { wrapper: createWrapper() });

    // Click "Create new State"
    const createStateButton = screen.getByText('Create new State');
    await user.click(createStateButton);

    // Wait for new state form to appear
    await waitFor(() => {
      expect(screen.getByText(/New state name/i)).toBeInTheDocument();
      expect(screen.getByText(/New state description/i)).toBeInTheDocument();
      expect(screen.getByText('Discard and go back to selection')).toBeInTheDocument();
    });
  });
});

