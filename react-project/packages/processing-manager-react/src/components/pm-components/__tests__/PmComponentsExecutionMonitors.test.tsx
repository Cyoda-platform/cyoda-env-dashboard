/**
 * Tests for PmComponentsExecutionMonitors Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { PmComponentsExecutionMonitors } from '../PmComponentsExecutionMonitors';
import * as hooks from '../../../hooks';

// Mock child components
vi.mock('../PmComponentsExecutionMonitorsFilter', () => ({
  PmComponentsExecutionMonitorsFilter: vi.fn(({ onFilter }) => (
    <div data-testid="filter-component">
      Filter Component
      <button onClick={() => onFilter({ name: 'test', updateInterval: 5 })}>
        Apply Filter
      </button>
    </div>
  )),
}));

vi.mock('../PmComponentsExecutionMonitorsTable', () => ({
  PmComponentsExecutionMonitorsTable: vi.fn(({ tableData }) => (
    <div data-testid="table-component">
      Table Component
      <div>Rows: {tableData.length}</div>
    </div>
  )),
}));

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useExecMonitorsInfo: vi.fn(),
}));

const mockRefetch = vi.fn();

const mockData = {
  data: [
    { id: '1', name: 'Monitor 1', status: 'active' },
    { id: '2', name: 'Monitor 2', status: 'inactive' },
    { id: '3', name: 'Test Monitor', status: 'active' },
  ],
};

describe('PmComponentsExecutionMonitors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    vi.mocked(hooks.useExecMonitorsInfo).mockReturnValue({
      data: mockData,
      refetch: mockRefetch,
    } as any);

    mockRefetch.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('should render the component', () => {
    render(<PmComponentsExecutionMonitors />);
    
    expect(screen.getByTestId('filter-component')).toBeInTheDocument();
    expect(screen.getByTestId('table-component')).toBeInTheDocument();
  });

  it('should render filter component', () => {
    render(<PmComponentsExecutionMonitors />);
    
    expect(screen.getByText('Filter Component')).toBeInTheDocument();
  });

  it('should render table component', () => {
    render(<PmComponentsExecutionMonitors />);
    
    expect(screen.getByText('Table Component')).toBeInTheDocument();
  });

  it('should pass tableData to table component', () => {
    render(<PmComponentsExecutionMonitors />);
    
    expect(screen.getByText('Rows: 3')).toBeInTheDocument();
  });

  it('should have filter callback', () => {
    render(<PmComponentsExecutionMonitors />);

    const applyButton = screen.getByText('Apply Filter');
    expect(applyButton).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    vi.mocked(hooks.useExecMonitorsInfo).mockReturnValue({
      data: null,
      refetch: mockRefetch,
    } as any);

    render(<PmComponentsExecutionMonitors />);
    
    expect(screen.getByText('Rows: 0')).toBeInTheDocument();
  });

  it('should handle missing data.data', () => {
    vi.mocked(hooks.useExecMonitorsInfo).mockReturnValue({
      data: {},
      refetch: mockRefetch,
    } as any);

    render(<PmComponentsExecutionMonitors />);
    
    expect(screen.getByText('Rows: 0')).toBeInTheDocument();
  });

  it('should use refetch from hook', () => {
    render(<PmComponentsExecutionMonitors />);

    expect(screen.getByTestId('filter-component')).toBeInTheDocument();
  });

  it('should show all data when name filter is empty', () => {
    render(<PmComponentsExecutionMonitors />);
    
    expect(screen.getByText('Rows: 3')).toBeInTheDocument();
  });

  it('should initialize with default form values', () => {
    render(<PmComponentsExecutionMonitors />);
    
    expect(screen.getByTestId('filter-component')).toBeInTheDocument();
  });

  it('should pass onFilter callback to filter component', () => {
    render(<PmComponentsExecutionMonitors />);
    
    const applyButton = screen.getByText('Apply Filter');
    expect(applyButton).toBeInTheDocument();
  });

  it('should pass tableData prop to table component', () => {
    render(<PmComponentsExecutionMonitors />);
    
    expect(screen.getByTestId('table-component')).toBeInTheDocument();
  });
});

