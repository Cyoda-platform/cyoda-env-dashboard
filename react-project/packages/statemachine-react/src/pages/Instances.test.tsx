/**
 * Instances Page Tests
 * Comprehensive tests for the Instances list page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Instances } from './Instances';

// Mock the hooks
const mockInstances = [
  {
    id: 'instance-1',
    entityClassName: 'com.example.Entity1',
    state: 'ACTIVE',
    currentWorkflowId: 'workflow-1',
    creationDate: 1633024800000,
  },
  {
    id: 'instance-2',
    entityClassName: 'com.example.Entity2',
    state: 'PENDING',
    currentWorkflowId: 'workflow-2',
    creationDate: 1633024900000,
  },
  {
    id: 'instance-3',
    entityClassName: 'com.example.Entity1',
    state: 'COMPLETED',
    currentWorkflowId: 'workflow-1',
    creationDate: 1633025000000,
  },
];

const mockUseInstances = vi.fn();
const mockUseWorkflowEnabledTypes = vi.fn();

vi.mock('../hooks/useStatemachine', () => ({
  useInstances: () => mockUseInstances(),
  useWorkflowEnabledTypes: () => mockUseWorkflowEnabledTypes(),
}));

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

describe('Instances', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseInstances.mockReturnValue({
      data: mockInstances,
      isLoading: false,
      refetch: vi.fn(),
    });

    mockUseWorkflowEnabledTypes.mockReturnValue({
      data: [
        { name: 'com.example.Entity1', label: 'Entity 1', type: 'BUSINESS' },
        { name: 'com.example.Entity2', label: 'Entity 2', type: 'TECHNICAL' },
      ],
      isLoading: false,
    });
  });

  it('should render the instances page', () => {
    render(<Instances />, { wrapper: createWrapper() });

    expect(screen.getByText('Instances')).toBeInTheDocument();
  });

  it('should display search input', () => {
    render(<Instances />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('should display entity class filter', () => {
    render(<Instances />, { wrapper: createWrapper() });

    expect(screen.getByText(/entity class/i)).toBeInTheDocument();
  });

  it('should display all instances in the table', () => {
    render(<Instances />, { wrapper: createWrapper() });

    expect(screen.getByText('instance-1')).toBeInTheDocument();
    expect(screen.getByText('instance-2')).toBeInTheDocument();
    expect(screen.getByText('instance-3')).toBeInTheDocument();
  });

  it('should filter instances by search term', async () => {
    render(<Instances />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'instance-1' } });

    await waitFor(() => {
      expect(screen.getByText('instance-1')).toBeInTheDocument();
      expect(screen.queryByText('instance-2')).not.toBeInTheDocument();
      expect(screen.queryByText('instance-3')).not.toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    mockUseInstances.mockReturnValue({
      data: [],
      isLoading: true,
      refetch: vi.fn(),
    });

    render(<Instances />, { wrapper: createWrapper() });

    expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('should display state column', () => {
    render(<Instances />, { wrapper: createWrapper() });

    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('should display entity class labels', () => {
    render(<Instances />, { wrapper: createWrapper() });

    expect(screen.getByText('Entity 1')).toBeInTheDocument();
    expect(screen.getByText('Entity 2')).toBeInTheDocument();
  });

  it('should show total count in pagination', () => {
    render(<Instances />, { wrapper: createWrapper() });

    expect(screen.getByText(/total 3/i)).toBeInTheDocument();
  });

  it('should have clickable rows', () => {
    render(<Instances />, { wrapper: createWrapper() });

    const firstRow = screen.getByText('instance-1').closest('tr');
    expect(firstRow).toBeInTheDocument();
    
    // Rows should be clickable (cursor pointer)
    if (firstRow) {
      expect(firstRow).toHaveStyle({ cursor: 'pointer' });
    }
  });

  it('should clear search when clear button is clicked', async () => {
    render(<Instances />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;

    // Set search
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput.value).toBe('test');

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(searchInput.value).toBe('');
      // All instances should be visible again
      expect(screen.getByText('instance-1')).toBeInTheDocument();
      expect(screen.getByText('instance-2')).toBeInTheDocument();
      expect(screen.getByText('instance-3')).toBeInTheDocument();
    });
  });

  it('should display creation date', () => {
    render(<Instances />, { wrapper: createWrapper() });

    // Dates should be formatted and displayed
    expect(screen.getByText(/2021/)).toBeInTheDocument();
  });

  it('should handle empty instances list', () => {
    mockUseInstances.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<Instances />, { wrapper: createWrapper() });

    // Should show empty state or "No data" message
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('should filter by entity class', async () => {
    render(<Instances />, { wrapper: createWrapper() });

    // Find entity class filter dropdown
    const entityClassFilter = screen.getByText(/entity class/i).closest('.ant-select');
    
    if (entityClassFilter) {
      fireEvent.click(entityClassFilter);

      await waitFor(() => {
        // Select Entity 1
        const entity1Option = screen.getByText('Entity 1');
        fireEvent.click(entity1Option);
      });

      await waitFor(() => {
        // Should show only Entity 1 instances
        expect(screen.getByText('instance-1')).toBeInTheDocument();
        expect(screen.getByText('instance-3')).toBeInTheDocument();
        expect(screen.queryByText('instance-2')).not.toBeInTheDocument();
      });
    }
  });

  it('should show workflow ID column', () => {
    render(<Instances />, { wrapper: createWrapper() });

    expect(screen.getByText('workflow-1')).toBeInTheDocument();
    expect(screen.getByText('workflow-2')).toBeInTheDocument();
  });

  it('should support pagination', () => {
    render(<Instances />, { wrapper: createWrapper() });

    // Pagination controls should be present
    expect(document.querySelector('.ant-pagination')).toBeInTheDocument();
  });

  it('should support page size change', () => {
    render(<Instances />, { wrapper: createWrapper() });

    // Page size selector should be present
    expect(document.querySelector('.ant-select-selector')).toBeInTheDocument();
  });
});

