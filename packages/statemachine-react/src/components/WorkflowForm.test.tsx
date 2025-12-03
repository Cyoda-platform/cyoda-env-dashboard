/**
 * Tests for WorkflowForm component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { WorkflowForm } from './WorkflowForm';

// Mock the hooks
const mockUseWorkflowEnabledTypes = vi.fn();

vi.mock('../hooks/useStatemachine', () => ({
  useWorkflow: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
  useWorkflowEnabledTypes: () => mockUseWorkflowEnabledTypes(),
  useCriteriaList: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useCreateWorkflow: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUpdateWorkflow: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

// Mock global UI settings store and HelperFeatureFlags
let mockEntityTypeValue = 'BUSINESS';
let mockIsEnabledTechViewValue = true;
const mockEntityType = vi.fn(() => mockEntityTypeValue);
const mockIsEnabledTechView = vi.fn(() => mockIsEnabledTechViewValue);

vi.mock('@cyoda/http-api-react', async () => {
  const actual = await vi.importActual('@cyoda/http-api-react');
  return {
    ...actual,
    useGlobalUiSettingsStore: () => ({
      get entityType() {
        return mockEntityType();
      },
      get isEnabledTechView() {
        return mockIsEnabledTechView();
      },
    }),
    HelperFeatureFlags: {
      isUseModelsInfo: () => true,
    },
  };
});

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
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

describe('WorkflowForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock values
    mockEntityTypeValue = 'BUSINESS';
    mockIsEnabledTechViewValue = true;

    mockUseWorkflowEnabledTypes.mockReturnValue({
      data: [
        { name: 'com.example.Entity1', type: 'BUSINESS' },
        { name: 'com.example.Entity2', type: 'PERSISTENCE' },
      ],
      isLoading: false,
    });
  });

  it('should render the form', () => {
    const { container } = render(<WorkflowForm workflowId="new" />, { wrapper: createWrapper() });
    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('should render buttons', () => {
    render(<WorkflowForm workflowId="new" />, { wrapper: createWrapper() });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  describe('Entity Type Filtering', () => {
    it('should filter entity class options by BUSINESS type', () => {
      mockEntityTypeValue = 'BUSINESS';
      mockIsEnabledTechViewValue = true;

      render(<WorkflowForm workflowId="new" />, { wrapper: createWrapper() });

      // Open entity class dropdown
      const select = screen.getByLabelText(/Entity Class/i);
      fireEvent.mouseDown(select);

      // Should show BUSINESS entities
      expect(screen.getByText(/Entity1/i)).toBeInTheDocument();

      // Should NOT show PERSISTENCE entities
      expect(screen.queryByText(/Entity2/i)).not.toBeInTheDocument();
    });

    it('should filter entity class options by PERSISTENCE type', () => {
      mockEntityTypeValue = 'PERSISTENCE';
      mockIsEnabledTechViewValue = true;

      render(<WorkflowForm workflowId="new" />, { wrapper: createWrapper() });

      // Open entity class dropdown
      const select = screen.getByLabelText(/Entity Class/i);
      fireEvent.mouseDown(select);

      // Should show PERSISTENCE entities
      expect(screen.getByText(/Entity2/i)).toBeInTheDocument();

      // Should NOT show BUSINESS entities
      expect(screen.queryByText(/Entity1/i)).not.toBeInTheDocument();
    });

    it('should show all entity class options when tech view is disabled', () => {
      mockIsEnabledTechViewValue = false;

      render(<WorkflowForm workflowId="new" />, { wrapper: createWrapper() });

      // Open entity class dropdown
      const select = screen.getByLabelText(/Entity Class/i);
      fireEvent.mouseDown(select);

      // Should show all entities
      expect(screen.getByText(/Entity1/i)).toBeInTheDocument();
      expect(screen.getByText(/Entity2/i)).toBeInTheDocument();
    });

    it('should display entity type labels in dropdown options', () => {
      mockEntityType.mockReturnValue('BUSINESS');
      mockIsEnabledTechView.mockReturnValue(true);

      render(<WorkflowForm workflowId="new" />, { wrapper: createWrapper() });

      // Open entity class dropdown
      const select = screen.getByLabelText(/Entity Class/i);
      fireEvent.mouseDown(select);

      // Entity options should include type information
      expect(screen.getByText(/Entity1/i)).toBeInTheDocument();
    });
  });
});

