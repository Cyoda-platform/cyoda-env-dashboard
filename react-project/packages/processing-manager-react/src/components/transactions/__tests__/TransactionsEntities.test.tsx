/**
 * Tests for TransactionsEntities Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionsEntities from '../TransactionsEntities';

const mockRefetch = vi.fn();
const mockUseTransactionsEntitiesList = vi.hoisted(() => vi.fn());

// Mock hooks
vi.mock('../../../hooks', () => ({
  useTransactionsEntitiesList: mockUseTransactionsEntitiesList,
}));

// Mock child components
vi.mock('../TransactionsEntitiesFilter', () => ({
  default: ({ isLoading, onChange }: any) => (
    <div data-testid="transactions-entities-filter">
      Filter - Loading: {isLoading ? 'true' : 'false'}
    </div>
  ),
}));

vi.mock('../TransactionsEntitiesTable', () => ({
  default: ({ isLoading, tableData }: any) => (
    <div data-testid="transactions-entities-table">
      Table - Loading: {isLoading ? 'true' : 'false'}, Rows: {tableData.length}
    </div>
  ),
}));

describe('TransactionsEntities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefetch.mockResolvedValue({});
    mockUseTransactionsEntitiesList.mockReturnValue({
      refetch: mockRefetch,
      isLoading: false,
    });
  });

  it('should render the component', () => {
    const { container } = render(<TransactionsEntities />);
    
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render filter component', () => {
    render(<TransactionsEntities />);
    
    expect(screen.getByTestId('transactions-entities-filter')).toBeInTheDocument();
  });

  it('should render table component', () => {
    render(<TransactionsEntities />);
    
    expect(screen.getByTestId('transactions-entities-table')).toBeInTheDocument();
  });

  it('should pass loading state to filter', () => {
    mockUseTransactionsEntitiesList.mockReturnValue({
      refetch: mockRefetch,
      isLoading: true,
    });

    render(<TransactionsEntities />);
    
    expect(screen.getByText(/Filter - Loading: true/)).toBeInTheDocument();
  });

  it('should pass loading state to table', () => {
    mockUseTransactionsEntitiesList.mockReturnValue({
      refetch: mockRefetch,
      isLoading: true,
    });

    render(<TransactionsEntities />);
    
    expect(screen.getByText(/Table - Loading: true/)).toBeInTheDocument();
  });

  it('should initialize with empty table data', () => {
    render(<TransactionsEntities />);
    
    expect(screen.getByText(/Rows: 0/)).toBeInTheDocument();
  });

  it('should call useTransactionsEntitiesList with enabled false', () => {
    render(<TransactionsEntities />);
    
    expect(mockUseTransactionsEntitiesList).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('should call useTransactionsEntitiesList with onSuccess callback', () => {
    render(<TransactionsEntities />);
    
    expect(mockUseTransactionsEntitiesList).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    );
  });

  it('should render both filter and table', () => {
    render(<TransactionsEntities />);
    
    expect(screen.getByTestId('transactions-entities-filter')).toBeInTheDocument();
    expect(screen.getByTestId('transactions-entities-table')).toBeInTheDocument();
  });

  it('should handle loading state false', () => {
    render(<TransactionsEntities />);

    expect(screen.getByText(/Filter - Loading: false/)).toBeInTheDocument();
  });

  it('should initialize with null filter values', () => {
    render(<TransactionsEntities />);
    
    expect(mockUseTransactionsEntitiesList).toHaveBeenCalledWith(
      null,
      expect.any(Object)
    );
  });

  it('should render without errors', () => {
    const { container } = render(<TransactionsEntities />);
    
    expect(container).toBeInTheDocument();
  });

  it('should have both main sections', () => {
    render(<TransactionsEntities />);
    
    const filter = screen.getByTestId('transactions-entities-filter');
    const table = screen.getByTestId('transactions-entities-table');
    
    expect(filter).toBeInTheDocument();
    expect(table).toBeInTheDocument();
  });
});

