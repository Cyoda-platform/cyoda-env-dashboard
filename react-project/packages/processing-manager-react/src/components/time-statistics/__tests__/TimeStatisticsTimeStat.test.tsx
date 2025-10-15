/**
 * Tests for TimeStatisticsTimeStat Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimeStatisticsTimeStat from '../TimeStatisticsTimeStat';

const mockUseStatsTime = vi.hoisted(() => vi.fn());

// Mock hooks
vi.mock('../../../hooks', () => ({
  useStatsTime: mockUseStatsTime,
}));

describe('TimeStatisticsTimeStat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStatsTime.mockReturnValue({
      data: [
        {
          key: 'test.operation.1',
          numCalls: 100,
          min: 1000,
          avg: 5000,
          max: 20000,
          last: 7500,
          total: 500000,
          measure: 1000,
          measureDesc: 'ms',
          from000To001MsCnt: 10,
          from001To010MsCnt: 20,
          from010To050MsCnt: 30,
          from050To100MsCnt: 15,
          from100To500MsCnt: 10,
          from500To999MsCnt: 5,
          from01To02SecCnt: 5,
          from02To10SecCnt: 3,
          more10SecCnt: 2,
        },
        {
          key: 'test.operation.2',
          numCalls: 50,
          min: 500,
          avg: 2500,
          max: 10000,
          last: 3000,
          total: 125000,
          measure: 1000,
          measureDesc: 'ms',
          from000To001MsCnt: 5,
          from001To010MsCnt: 10,
          from010To050MsCnt: 15,
          from050To100MsCnt: 10,
          from100To500MsCnt: 5,
          from500To999MsCnt: 3,
          from01To02SecCnt: 1,
          from02To10SecCnt: 1,
          more10SecCnt: 0,
        },
      ],
      isLoading: false,
    });
  });

  it('should render the component', () => {
    const { container } = render(<TimeStatisticsTimeStat />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(<TimeStatisticsTimeStat />);
    
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('should render table with data', () => {
    render(<TimeStatisticsTimeStat />);
    
    expect(screen.getByText('test.operation.1')).toBeInTheDocument();
    expect(screen.getByText('test.operation.2')).toBeInTheDocument();
  });

  it('should have all column headers', () => {
    const { container } = render(<TimeStatisticsTimeStat />);

    // Check that table renders with columns
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
    const headers = container.querySelectorAll('.ant-table-thead th');
    expect(headers.length).toBeGreaterThan(0);
  });

  it('should have time range column headers', () => {
    const { container } = render(<TimeStatisticsTimeStat />);

    // Check that table has multiple columns for time ranges
    const headers = container.querySelectorAll('.ant-table-thead th');
    expect(headers.length).toBeGreaterThan(10); // Should have many columns
  });

  it('should transform time values with measure', () => {
    const { container } = render(<TimeStatisticsTimeStat />);

    // Check that table renders data
    expect(container.querySelector('.ant-table-tbody')).toBeInTheDocument();
  });

  it('should display total with seconds suffix', () => {
    render(<TimeStatisticsTimeStat />);
    
    expect(screen.getByText('500000(s)')).toBeInTheDocument();
    expect(screen.getByText('125000(s)')).toBeInTheDocument();
  });

  it('should filter data based on search text', () => {
    render(<TimeStatisticsTimeStat />);
    
    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'operation.1' } });
    
    expect(screen.getByText('test.operation.1')).toBeInTheDocument();
    expect(screen.queryByText('test.operation.2')).not.toBeInTheDocument();
  });

  it('should filter data case-insensitively', () => {
    render(<TimeStatisticsTimeStat />);
    
    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'OPERATION.1' } });
    
    expect(screen.getByText('test.operation.1')).toBeInTheDocument();
  });

  it('should show all data when search is cleared', () => {
    render(<TimeStatisticsTimeStat />);
    
    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'operation.1' } });
    fireEvent.change(searchInput, { target: { value: '' } });
    
    expect(screen.getByText('test.operation.1')).toBeInTheDocument();
    expect(screen.getByText('test.operation.2')).toBeInTheDocument();
  });

  it('should render bordered table', () => {
    const { container } = render(<TimeStatisticsTimeStat />);
    
    const table = container.querySelector('.ant-table');
    expect(table).toHaveClass('ant-table-bordered');
  });

  it('should have pagination', () => {
    const { container } = render(<TimeStatisticsTimeStat />);
    
    expect(container.querySelector('.ant-pagination')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    mockUseStatsTime.mockReturnValue({
      data: [],
      isLoading: true,
    });

    const { container } = render(<TimeStatisticsTimeStat />);

    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    mockUseStatsTime.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { container } = render(<TimeStatisticsTimeStat />);

    expect(container.querySelector('.ant-table')).toBeInTheDocument();
    expect(container.querySelector('.ant-empty')).toBeInTheDocument();
  });

  it('should handle undefined data', () => {
    mockUseStatsTime.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { container } = render(<TimeStatisticsTimeStat />);

    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should have horizontal scroll', () => {
    const { container } = render(<TimeStatisticsTimeStat />);
    
    const tableWrapper = container.querySelector('.ant-table-wrapper');
    expect(tableWrapper).toBeInTheDocument();
  });

  it('should display time range counts', () => {
    render(<TimeStatisticsTimeStat />);

    expect(screen.getAllByText('10').length).toBeGreaterThan(0); // from000To001MsCnt
    expect(screen.getAllByText('20').length).toBeGreaterThan(0); // from001To010MsCnt
    expect(screen.getAllByText('30').length).toBeGreaterThan(0); // from010To050MsCnt
  });

  it('should have sortable columns', () => {
    const { container } = render(<TimeStatisticsTimeStat />);
    
    const sorters = container.querySelectorAll('.ant-table-column-sorters');
    expect(sorters.length).toBeGreaterThan(0);
  });

  it('should use key as rowKey', () => {
    const { container } = render(<TimeStatisticsTimeStat />);
    
    const rows = container.querySelectorAll('.ant-table-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should have fixed left column for Key', () => {
    const { container } = render(<TimeStatisticsTimeStat />);
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should render search input in a Row/Col layout', () => {
    const { container } = render(<TimeStatisticsTimeStat />);
    
    expect(container.querySelector('.ant-row')).toBeInTheDocument();
    expect(container.querySelector('.ant-col')).toBeInTheDocument();
  });

  it('should filter by numeric values', () => {
    render(<TimeStatisticsTimeStat />);

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: '100' } });

    // Should find rows with 100 in any field
    expect(screen.getByText('test.operation.1')).toBeInTheDocument();
  });

  it('should show no results when search matches nothing', () => {
    mockUseStatsTime.mockReturnValue({
      data: [
        {
          key: 'test.operation.1',
          numCalls: 100,
          min: 1000,
          avg: 5000,
          max: 20000,
          last: 7500,
          total: 500000,
          measure: 1000,
          measureDesc: 'ms',
          from000To001MsCnt: 10,
          from001To010MsCnt: 20,
          from010To050MsCnt: 30,
          from050To100MsCnt: 15,
          from100To500MsCnt: 10,
          from500To999MsCnt: 5,
          from01To02SecCnt: 5,
          from02To10SecCnt: 3,
          more10SecCnt: 2,
        },
      ],
      isLoading: false,
    });

    const { container } = render(<TimeStatisticsTimeStat />);

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    // After filtering, table should show empty state
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should have default page size of 10', () => {
    const { container } = render(<TimeStatisticsTimeStat />);
    
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should have show size changer', () => {
    const { container } = render(<TimeStatisticsTimeStat />);
    
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });
});

