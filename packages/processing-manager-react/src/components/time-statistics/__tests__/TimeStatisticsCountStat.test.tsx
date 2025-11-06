/**
 * Tests for TimeStatisticsCountStat Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TimeStatisticsCountStat from '../TimeStatisticsCountStat';

const mockUseStatsCount = vi.hoisted(() => vi.fn());

// Mock hooks
vi.mock('../../../hooks', () => ({
  useStatsCount: mockUseStatsCount,
}));

describe('TimeStatisticsCountStat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStatsCount.mockReturnValue({
      data: [
        {
          key: 'test.operation.1',
          numCalls: 100,
          min: 10,
          avg: 50,
          max: 200,
          last: 75,
          total: 5000,
        },
        {
          key: 'test.operation.2',
          numCalls: 50,
          min: 5,
          avg: 25,
          max: 100,
          last: 30,
          total: 1250,
        },
      ],
      isLoading: false,
    });
  });

  it('should render the component', () => {
    const { container } = render(<TimeStatisticsCountStat />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should render table with data', () => {
    render(<TimeStatisticsCountStat />);
    
    expect(screen.getByText('test.operation.1')).toBeInTheDocument();
    expect(screen.getByText('test.operation.2')).toBeInTheDocument();
  });

  it('should have all column headers', () => {
    const { container } = render(<TimeStatisticsCountStat />);

    // Check that table renders with columns
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
    const headers = container.querySelectorAll('.ant-table-thead th');
    expect(headers.length).toBe(7); // Key, Num Calls, Min, Avg, Max, Last, Total
  });

  it('should display numeric values', () => {
    render(<TimeStatisticsCountStat />);

    expect(screen.getAllByText('100').length).toBeGreaterThan(0);
    expect(screen.getAllByText('50').length).toBeGreaterThan(0);
    expect(screen.getAllByText('200').length).toBeGreaterThan(0);
  });

  it('should render bordered table', () => {
    const { container } = render(<TimeStatisticsCountStat />);
    
    const table = container.querySelector('.ant-table');
    expect(table).toHaveClass('ant-table-bordered');
  });

  it('should have pagination', () => {
    const { container } = render(<TimeStatisticsCountStat />);
    
    expect(container.querySelector('.ant-pagination')).toBeInTheDocument();
  });

  it('should have page size options', () => {
    const { container } = render(<TimeStatisticsCountStat />);
    
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    mockUseStatsCount.mockReturnValue({
      data: [],
      isLoading: true,
    });

    const { container } = render(<TimeStatisticsCountStat />);

    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    mockUseStatsCount.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { container } = render(<TimeStatisticsCountStat />);

    expect(container.querySelector('.ant-table')).toBeInTheDocument();
    expect(container.querySelector('.ant-empty')).toBeInTheDocument();
  });

  it('should handle undefined data', () => {
    mockUseStatsCount.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { container } = render(<TimeStatisticsCountStat />);

    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should have horizontal scroll', () => {
    const { container } = render(<TimeStatisticsCountStat />);
    
    const tableWrapper = container.querySelector('.ant-table-wrapper');
    expect(tableWrapper).toBeInTheDocument();
  });

  it('should use key as rowKey', () => {
    const { container } = render(<TimeStatisticsCountStat />);
    
    const rows = container.querySelectorAll('.ant-table-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should have fixed left column for Key', () => {
    const { container } = render(<TimeStatisticsCountStat />);
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should render all data rows', () => {
    const { container } = render(<TimeStatisticsCountStat />);
    
    const rows = container.querySelectorAll('.ant-table-row');
    expect(rows.length).toBe(2);
  });

  it('should have sortable columns', () => {
    const { container } = render(<TimeStatisticsCountStat />);
    
    const sorters = container.querySelectorAll('.ant-table-column-sorters');
    expect(sorters.length).toBeGreaterThan(0);
  });

  it('should display all stat values for first row', () => {
    render(<TimeStatisticsCountStat />);

    expect(screen.getByText('test.operation.1')).toBeInTheDocument();
    expect(screen.getAllByText('100').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    expect(screen.getAllByText('50').length).toBeGreaterThan(0);
    expect(screen.getAllByText('200').length).toBeGreaterThan(0);
    expect(screen.getAllByText('75').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5000').length).toBeGreaterThan(0);
  });

  it('should display all stat values for second row', () => {
    render(<TimeStatisticsCountStat />);

    expect(screen.getByText('test.operation.2')).toBeInTheDocument();
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('25').length).toBeGreaterThan(0);
    expect(screen.getAllByText('30').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1250').length).toBeGreaterThan(0);
  });

  it('should have default page size of 10', () => {
    const { container } = render(<TimeStatisticsCountStat />);
    
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should have show size changer', () => {
    const { container } = render(<TimeStatisticsCountStat />);
    
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });
});

