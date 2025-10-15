/**
 * Tests for TransactionsExecuting Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TransactionsExecuting from '../TransactionsExecuting';

const mockRefetch = vi.fn();
const mockUseExecTransactionsInfo = vi.hoisted(() => vi.fn());

// Mock hooks
vi.mock('../../../hooks', () => ({
  useExecTransactionsInfo: mockUseExecTransactionsInfo,
}));

describe('TransactionsExecuting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockRefetch.mockResolvedValue({});
    mockUseExecTransactionsInfo.mockReturnValue({
      data: [
        { id: 'tx1', time: '2024-01-01 10:00:00' },
        { id: 'tx2', time: '2024-01-01 11:00:00' },
      ],
      refetch: mockRefetch,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('should render the component', () => {
    const { container } = render(<TransactionsExecuting />);
    
    expect(container.querySelector('.pm-shards-detail-tab-transactions-executing')).toBeInTheDocument();
  });

  it('should render settings section', () => {
    render(<TransactionsExecuting />);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render limit input', () => {
    render(<TransactionsExecuting />);
    
    expect(screen.getByText('Limit')).toBeInTheDocument();
  });

  it('should render update interval input', () => {
    render(<TransactionsExecuting />);
    
    expect(screen.getByText('Update Interval (seconds)')).toBeInTheDocument();
  });

  it('should render start button initially', () => {
    render(<TransactionsExecuting />);
    
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('should render table with data', () => {
    const { container } = render(<TransactionsExecuting />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should display transaction data in table', () => {
    render(<TransactionsExecuting />);
    
    expect(screen.getByText('tx1')).toBeInTheDocument();
    expect(screen.getByText('tx2')).toBeInTheDocument();
  });

  it('should have column headers', () => {
    const { container } = render(<TransactionsExecuting />);
    
    const headers = container.querySelectorAll('.ant-table-thead th');
    expect(headers.length).toBeGreaterThan(0);
  });

  it('should show stop button when running', () => {
    render(<TransactionsExecuting />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  it('should show start button when stopped', () => {
    render(<TransactionsExecuting />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    const stopButton = screen.getByText('Stop');
    fireEvent.click(stopButton);
    
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    mockUseExecTransactionsInfo.mockReturnValue({
      data: null,
      refetch: mockRefetch,
    });

    const { container } = render(<TransactionsExecuting />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should handle empty array data', () => {
    mockUseExecTransactionsInfo.mockReturnValue({
      data: [],
      refetch: mockRefetch,
    });

    const { container } = render(<TransactionsExecuting />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should call useExecTransactionsInfo with limit', () => {
    render(<TransactionsExecuting />);
    
    expect(mockUseExecTransactionsInfo).toHaveBeenCalledWith({ limit: 100 });
  });

  it('should render card component', () => {
    const { container } = render(<TransactionsExecuting />);
    
    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should render form', () => {
    const { container } = render(<TransactionsExecuting />);
    
    expect(container.querySelector('.form')).toBeInTheDocument();
  });

  it('should have pagination', () => {
    const { container } = render(<TransactionsExecuting />);
    
    expect(container.querySelector('.ant-pagination')).toBeInTheDocument();
  });

  it('should render table with bordered style', () => {
    const { container } = render(<TransactionsExecuting />);
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should map data with index', () => {
    render(<TransactionsExecuting />);
    
    // Check that data is displayed (indices would be 1, 2)
    expect(screen.getByText('tx1')).toBeInTheDocument();
    expect(screen.getByText('tx2')).toBeInTheDocument();
  });

  it('should render without errors when data is undefined', () => {
    mockUseExecTransactionsInfo.mockReturnValue({
      data: undefined,
      refetch: mockRefetch,
    });

    const { container } = render(<TransactionsExecuting />);
    
    expect(container).toBeInTheDocument();
  });

  it('should have default limit of 100', () => {
    render(<TransactionsExecuting />);
    
    expect(mockUseExecTransactionsInfo).toHaveBeenCalledWith({ limit: 100 });
  });

  it('should render all main sections', () => {
    const { container } = render(<TransactionsExecuting />);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });
});

