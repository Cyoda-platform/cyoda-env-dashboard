/**
 * Tests for TransactionsView Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionsView from '../TransactionsView';

const mockUseTransactions = vi.hoisted(() => vi.fn());

// Mock hooks
vi.mock('../../../hooks', () => ({
  useTransactions: mockUseTransactions,
}));

// Mock child components
vi.mock('../TransactionsViewFilter', () => ({
  TransactionsViewFilter: ({ isLoading, onChange }: any) => (
    <div data-testid="transactions-view-filter">
      Filter - Loading: {isLoading ? 'true' : 'false'}
    </div>
  ),
}));

vi.mock('../TransactionsViewTable', () => ({
  TransactionsViewTable: ({ isLoading, tableData, firstPage, lastPage, pageSize }: any) => (
    <div data-testid="transactions-view-table">
      Table - Loading: {isLoading ? 'true' : 'false'}, Rows: {tableData.length}, First: {firstPage ? 'true' : 'false'}, Last: {lastPage ? 'true' : 'false'}, PageSize: {pageSize}
    </div>
  ),
}));

describe('TransactionsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTransactions.mockReturnValue({
      data: {
        rows: [
          { createTime: '2024-01-01 10:00:00', id: 'tx1' },
          { createTime: '2024-01-01 11:00:00', id: 'tx2' },
        ],
        firstPage: false,
        lastPage: false,
      },
      isLoading: false,
    });
  });

  it('should render the component', () => {
    const { container } = render(<TransactionsView />);
    
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render filter component', () => {
    render(<TransactionsView />);
    
    expect(screen.getByTestId('transactions-view-filter')).toBeInTheDocument();
  });

  it('should render table component', () => {
    render(<TransactionsView />);
    
    expect(screen.getByTestId('transactions-view-table')).toBeInTheDocument();
  });

  it('should pass pagination props to table', () => {
    render(<TransactionsView />);

    expect(screen.getByText(/First: false/)).toBeInTheDocument();
    expect(screen.getByText(/Last: false/)).toBeInTheDocument();
    expect(screen.getByText(/PageSize: 25/)).toBeInTheDocument();
  });

  it('should pass loading state to filter', () => {
    mockUseTransactions.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<TransactionsView />);

    expect(screen.getByText(/Filter - Loading: true/)).toBeInTheDocument();
  });

  it('should pass table data to table component', () => {
    render(<TransactionsView />);
    
    expect(screen.getByText(/Rows: 2/)).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    mockUseTransactions.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<TransactionsView />);
    
    expect(screen.getByText(/Rows: 0/)).toBeInTheDocument();
  });

  it('should handle empty rows array', () => {
    mockUseTransactions.mockReturnValue({
      data: {
        rows: [],
        firstPage: true,
        lastPage: true,
      },
      isLoading: false,
    });

    render(<TransactionsView />);
    
    expect(screen.getByText(/Rows: 0/)).toBeInTheDocument();
  });

  it('should pass firstPage to pagination', () => {
    mockUseTransactions.mockReturnValue({
      data: {
        rows: [{ createTime: '2024-01-01 10:00:00', id: 'tx1' }],
        firstPage: true,
        lastPage: false,
      },
      isLoading: false,
    });

    render(<TransactionsView />);
    
    expect(screen.getByText(/First: true/)).toBeInTheDocument();
  });

  it('should pass lastPage to pagination', () => {
    mockUseTransactions.mockReturnValue({
      data: {
        rows: [{ createTime: '2024-01-01 10:00:00', id: 'tx1' }],
        firstPage: false,
        lastPage: true,
      },
      isLoading: false,
    });

    render(<TransactionsView />);
    
    expect(screen.getByText(/Last: true/)).toBeInTheDocument();
  });

  it('should use default pagination values', () => {
    render(<TransactionsView />);

    // Component should render without errors
    expect(screen.getByText(/PageSize: 25/)).toBeInTheDocument();
  });

  it('should handle data with rows', () => {
    render(<TransactionsView />);

    expect(screen.getByTestId('transactions-view-table')).toBeInTheDocument();
    expect(screen.getByText(/Rows: 2/)).toBeInTheDocument();
  });

  it('should render all main sections', () => {
    render(<TransactionsView />);

    expect(screen.getByTestId('transactions-view-filter')).toBeInTheDocument();
    expect(screen.getByTestId('transactions-view-table')).toBeInTheDocument();
  });

  it('should handle undefined data properties', () => {
    mockUseTransactions.mockReturnValue({
      data: {},
      isLoading: false,
    });

    render(<TransactionsView />);
    
    expect(screen.getByText(/Rows: 0/)).toBeInTheDocument();
  });

  it('should call useTransactions hook', () => {
    render(<TransactionsView />);
    
    expect(mockUseTransactions).toHaveBeenCalled();
  });

  it('should pass query params to useTransactions', () => {
    render(<TransactionsView />);
    
    expect(mockUseTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        pageSize: 25,
        requestLast: false,
        nextCursor: null,
        prevCursor: null,
      })
    );
  });
});

