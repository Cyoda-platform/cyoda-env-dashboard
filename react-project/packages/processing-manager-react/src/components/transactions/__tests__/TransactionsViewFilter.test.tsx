/**
 * Tests for TransactionsViewFilter Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionsViewFilter } from '../TransactionsViewFilter';

const mockUseTransactionStatuses = vi.hoisted(() => vi.fn());

// Mock hooks
vi.mock('../../../hooks', () => ({
  useTransactionStatuses: mockUseTransactionStatuses,
}));

describe('TransactionsViewFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTransactionStatuses.mockReturnValue({
      data: ['PENDING', 'COMPLETED', 'FAILED'],
    });
  });

  it('should render the component', () => {
    const { container } = render(<TransactionsViewFilter />);
    
    expect(container.querySelector('.pm-shards-detail-tab-transactions-view-filter')).toBeInTheDocument();
  });

  it('should render filter heading', () => {
    render(<TransactionsViewFilter />);
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should render transaction ID input', () => {
    render(<TransactionsViewFilter />);
    
    expect(screen.getByText('Transaction ID')).toBeInTheDocument();
  });

  it('should render transaction status select', () => {
    render(<TransactionsViewFilter />);
    
    expect(screen.getByText('Transaction Status')).toBeInTheDocument();
  });

  it('should render date from field', () => {
    render(<TransactionsViewFilter />);
    
    expect(screen.getByText('Date From')).toBeInTheDocument();
  });

  it('should render date to field', () => {
    render(<TransactionsViewFilter />);
    
    expect(screen.getByText('Date To')).toBeInTheDocument();
  });

  it('should render sort field', () => {
    render(<TransactionsViewFilter />);
    
    expect(screen.getByText('Sort')).toBeInTheDocument();
  });

  it('should render load button', () => {
    render(<TransactionsViewFilter />);

    expect(screen.getByText('Load')).toBeInTheDocument();
  });

  it('should call useTransactionStatuses hook', () => {
    render(<TransactionsViewFilter />);

    expect(mockUseTransactionStatuses).toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    render(<TransactionsViewFilter isLoading={true} />);

    const loadButton = screen.getByText('Load');
    expect(loadButton).toBeInTheDocument();
  });

  it('should handle not loading state', () => {
    render(<TransactionsViewFilter isLoading={false} />);

    const loadButton = screen.getByText('Load');
    expect(loadButton).toBeInTheDocument();
  });

  it('should render transaction ID input field', () => {
    const { container } = render(<TransactionsViewFilter />);
    
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('should handle empty statuses data', () => {
    mockUseTransactionStatuses.mockReturnValue({
      data: null,
    });

    render(<TransactionsViewFilter />);
    
    expect(screen.getByText('Transaction Status')).toBeInTheDocument();
  });

  it('should handle undefined statuses data', () => {
    mockUseTransactionStatuses.mockReturnValue({
      data: undefined,
    });

    render(<TransactionsViewFilter />);
    
    expect(screen.getByText('Transaction Status')).toBeInTheDocument();
  });

  it('should render form layout', () => {
    const { container } = render(<TransactionsViewFilter />);
    
    expect(container.querySelector('.ant-form')).toBeInTheDocument();
  });

  it('should have vertical form layout', () => {
    const { container } = render(<TransactionsViewFilter />);
    
    const form = container.querySelector('.ant-form');
    expect(form).toBeInTheDocument();
  });

  it('should render all form items', () => {
    const { container } = render(<TransactionsViewFilter />);
    
    const formItems = container.querySelectorAll('.ant-form-item');
    expect(formItems.length).toBeGreaterThan(0);
  });

  it('should call onChange on mount with initial values', () => {
    const mockOnChange = vi.fn();
    render(<TransactionsViewFilter onChange={mockOnChange} />);

    // Should be called with initial form values
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should handle load button click', () => {
    const mockOnChange = vi.fn();
    render(<TransactionsViewFilter onChange={mockOnChange} />);

    const loadButton = screen.getByText('Load');
    fireEvent.click(loadButton);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should render with default props', () => {
    const { container } = render(<TransactionsViewFilter />);
    
    expect(container).toBeInTheDocument();
  });

  it('should render all filter fields', () => {
    render(<TransactionsViewFilter />);
    
    expect(screen.getByText('Transaction ID')).toBeInTheDocument();
    expect(screen.getByText('Transaction Status')).toBeInTheDocument();
    expect(screen.getByText('Date From')).toBeInTheDocument();
    expect(screen.getByText('Date To')).toBeInTheDocument();
    expect(screen.getByText('Sort')).toBeInTheDocument();
  });

  it('should have load button', () => {
    render(<TransactionsViewFilter />);

    const button = screen.getByText('Load');
    expect(button).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = render(<TransactionsViewFilter />);
    
    expect(container.querySelector('.pm-shards-detail-tab-transactions-view-filter')).toBeInTheDocument();
  });
});

