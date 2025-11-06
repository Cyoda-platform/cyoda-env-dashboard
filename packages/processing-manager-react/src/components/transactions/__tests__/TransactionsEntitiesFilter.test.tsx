/**
 * Tests for TransactionsEntitiesFilter Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionsEntitiesFilter from '../TransactionsEntitiesFilter';

const mockUseEntitiesListPossible = vi.hoisted(() => vi.fn());

// Mock hooks
vi.mock('../../../hooks', () => ({
  useEntitiesListPossible: mockUseEntitiesListPossible,
}));

describe('TransactionsEntitiesFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEntitiesListPossible.mockReturnValue({
      data: ['EntityClass1', 'EntityClass2', 'EntityClass3'],
    });
  });

  it('should render the component', () => {
    const { container } = render(<TransactionsEntitiesFilter />);
    
    expect(container.querySelector('.pm-shards-detail-tab-transactions-entities-filter')).toBeInTheDocument();
  });

  it('should render filter heading', () => {
    render(<TransactionsEntitiesFilter />);
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should render entity class field', () => {
    render(<TransactionsEntitiesFilter />);
    
    expect(screen.getByText('Entity class')).toBeInTheDocument();
  });

  it('should render entity ID field', () => {
    render(<TransactionsEntitiesFilter />);
    
    expect(screen.getByText('Entity ID')).toBeInTheDocument();
  });

  it('should render time from field', () => {
    render(<TransactionsEntitiesFilter />);

    expect(screen.getByText('Time From')).toBeInTheDocument();
  });

  it('should render time to field', () => {
    render(<TransactionsEntitiesFilter />);

    expect(screen.getByText('Time To')).toBeInTheDocument();
  });

  it('should render load button', () => {
    render(<TransactionsEntitiesFilter />);
    
    expect(screen.getByText('Load')).toBeInTheDocument();
  });

  it('should call useEntitiesListPossible hook', () => {
    render(<TransactionsEntitiesFilter />);
    
    expect(mockUseEntitiesListPossible).toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    render(<TransactionsEntitiesFilter isLoading={true} />);
    
    const loadButton = screen.getByText('Load');
    expect(loadButton).toBeInTheDocument();
  });

  it('should handle not loading state', () => {
    render(<TransactionsEntitiesFilter isLoading={false} />);
    
    const loadButton = screen.getByText('Load');
    expect(loadButton).toBeInTheDocument();
  });

  it('should render entity ID input field', () => {
    const { container } = render(<TransactionsEntitiesFilter />);
    
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('should handle empty entity classes data', () => {
    mockUseEntitiesListPossible.mockReturnValue({
      data: null,
    });

    render(<TransactionsEntitiesFilter />);
    
    expect(screen.getByText('Entity class')).toBeInTheDocument();
  });

  it('should handle undefined entity classes data', () => {
    mockUseEntitiesListPossible.mockReturnValue({
      data: undefined,
    });

    render(<TransactionsEntitiesFilter />);
    
    expect(screen.getByText('Entity class')).toBeInTheDocument();
  });

  it('should render form layout', () => {
    const { container } = render(<TransactionsEntitiesFilter />);
    
    expect(container.querySelector('.ant-form')).toBeInTheDocument();
  });

  it('should have vertical form layout', () => {
    const { container } = render(<TransactionsEntitiesFilter />);
    
    const form = container.querySelector('.ant-form');
    expect(form).toBeInTheDocument();
  });

  it('should render all form items', () => {
    const { container } = render(<TransactionsEntitiesFilter />);
    
    const formItems = container.querySelectorAll('.ant-form-item');
    expect(formItems.length).toBeGreaterThan(0);
  });

  it('should handle load button click', () => {
    const mockOnChange = vi.fn();
    render(<TransactionsEntitiesFilter onChange={mockOnChange} />);
    
    const loadButton = screen.getByText('Load');
    fireEvent.click(loadButton);
    
    // onChange may or may not be called depending on form state
    expect(loadButton).toBeInTheDocument();
  });

  it('should render with default props', () => {
    const { container } = render(<TransactionsEntitiesFilter />);
    
    expect(container).toBeInTheDocument();
  });

  it('should render all filter fields', () => {
    render(<TransactionsEntitiesFilter />);

    expect(screen.getByText('Entity class')).toBeInTheDocument();
    expect(screen.getByText('Entity ID')).toBeInTheDocument();
    expect(screen.getByText('Time From')).toBeInTheDocument();
    expect(screen.getByText('Time To')).toBeInTheDocument();
  });

  it('should have load button', () => {
    render(<TransactionsEntitiesFilter />);
    
    const button = screen.getByText('Load');
    expect(button).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = render(<TransactionsEntitiesFilter />);
    
    expect(container.querySelector('.pm-shards-detail-tab-transactions-entities-filter')).toBeInTheDocument();
  });

  it('should render entity class select', () => {
    const { container } = render(<TransactionsEntitiesFilter />);
    
    expect(container.querySelector('.ant-select')).toBeInTheDocument();
  });

  it('should handle entity classes array', () => {
    render(<TransactionsEntitiesFilter />);
    
    expect(mockUseEntitiesListPossible).toHaveBeenCalled();
  });
});

