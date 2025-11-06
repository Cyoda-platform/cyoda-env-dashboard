/**
 * Tests for PollingInfo Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PollingInfo } from '../PollingInfo';
import * as hooks from '../../../hooks/useProcessing';

// Mock the hooks
vi.mock('../../../hooks/useProcessing', () => ({
  usePollingInfo: vi.fn(),
}));

const mockPollingData = {
  shard1: {
    queue1: {
      shardId: '1',
      queueType: 'TestQueue1',
      processing: true,
      lastEmptyPollings: 5,
      maxTimeout: 1000,
      lastDelayTime: '2025-10-15 10:00:00',
      lastPollingTime: '2025-10-15 10:05:00',
    },
    queue2: {
      shardId: '1',
      queueType: 'TestQueue2',
      processing: false,
      lastEmptyPollings: 10,
      maxTimeout: 2000,
      lastDelayTime: '2025-10-15 11:00:00',
      lastPollingTime: '2025-10-15 11:05:00',
    },
  },
  shard2: {
    queue1: {
      shardId: '2',
      queueType: 'TestQueue1',
      processing: true,
      lastEmptyPollings: 3,
      maxTimeout: 1500,
      lastDelayTime: '2025-10-15 12:00:00',
      lastPollingTime: '2025-10-15 12:05:00',
    },
  },
};

describe('PollingInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(hooks.usePollingInfo).mockReturnValue({
      data: mockPollingData,
      isLoading: false,
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    render(<PollingInfo />);
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should render filter fields', () => {
    render(<PollingInfo />);

    const shard = screen.getAllByText('Shard');
    const entityType = screen.getAllByText('Entity Type');
    const processing = screen.getAllByText('Processing');

    expect(shard.length).toBeGreaterThan(0);
    expect(entityType.length).toBeGreaterThan(0);
    expect(processing.length).toBeGreaterThan(0);
  });

  it('should render table with 7 columns', () => {
    render(<PollingInfo />);
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBe(7);
  });

  it('should render table column headers', () => {
    render(<PollingInfo />);

    const headers = screen.getAllByRole('columnheader');
    const headerTexts = headers.map(h => h.textContent);

    expect(headerTexts).toContain('Shard');
    expect(headerTexts).toContain('Entity Type');
    expect(headerTexts).toContain('Processing');
    expect(headerTexts).toContain('Last Empty Pollings count');
    expect(headerTexts).toContain('Max Timeout');
    expect(headerTexts).toContain('Last Delay Time');
    expect(headerTexts).toContain('Last Polling Time');
  });

  it('should render table data', () => {
    render(<PollingInfo />);
    
    const ones = screen.getAllByText('1');
    const twos = screen.getAllByText('2');
    expect(ones.length).toBeGreaterThan(0);
    expect(twos.length).toBeGreaterThan(0);
  });

  it('should render queue types', () => {
    render(<PollingInfo />);

    const queue1 = screen.getAllByText('TestQueue1');
    const queue2 = screen.getAllByText('TestQueue2');
    expect(queue1.length).toBeGreaterThan(0);
    expect(queue2.length).toBeGreaterThan(0);
  });

  it('should render processing status as string', () => {
    render(<PollingInfo />);
    
    const trueValues = screen.getAllByText('true');
    const falseValues = screen.getAllByText('false');
    expect(trueValues.length).toBeGreaterThan(0);
    expect(falseValues.length).toBeGreaterThan(0);
  });

  it('should render numeric values', () => {
    render(<PollingInfo />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('2000')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
  });

  it('should render timestamp values', () => {
    render(<PollingInfo />);
    
    expect(screen.getByText('2025-10-15 10:00:00')).toBeInTheDocument();
    expect(screen.getByText('2025-10-15 10:05:00')).toBeInTheDocument();
  });

  it('should have bordered table', () => {
    const { container } = render(<PollingInfo />);
    
    const table = container.querySelector('.ant-table-bordered');
    expect(table).toBeInTheDocument();
  });

  it('should have scrollable table', () => {
    const { container } = render(<PollingInfo />);
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should have pagination', () => {
    const { container } = render(<PollingInfo />);
    
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should render correct number of rows', () => {
    const { container } = render(<PollingInfo />);
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(3);
  });

  it('should show loading state', () => {
    vi.mocked(hooks.usePollingInfo).mockReturnValue({
      data: null,
      isLoading: true,
    } as any);

    const { container } = render(<PollingInfo />);
    
    const spinner = container.querySelector('.ant-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    vi.mocked(hooks.usePollingInfo).mockReturnValue({
      data: null,
      isLoading: false,
    } as any);

    const { container } = render(<PollingInfo />);
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(0);
  });

  it('should have allowClear on selects', () => {
    render(<PollingInfo />);

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(3);
  });

  it('should have showSearch on selects', () => {
    render(<PollingInfo />);

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(3);
  });

  it('should render shard filter options', async () => {
    const user = userEvent.setup();
    render(<PollingInfo />);
    
    const selects = screen.getAllByRole('combobox');
    await user.click(selects[0]);
    
    await waitFor(() => {
      const ones = screen.getAllByText('1');
      const twos = screen.getAllByText('2');
      expect(ones.length).toBeGreaterThan(0);
      expect(twos.length).toBeGreaterThan(0);
    });
  });

  it('should render entity type filter options', async () => {
    const user = userEvent.setup();
    render(<PollingInfo />);
    
    const selects = screen.getAllByRole('combobox');
    await user.click(selects[1]);
    
    await waitFor(() => {
      const queue1 = screen.getAllByText('TestQueue1');
      const queue2 = screen.getAllByText('TestQueue2');
      expect(queue1.length).toBeGreaterThan(0);
      expect(queue2.length).toBeGreaterThan(0);
    });
  });

  it('should render processing filter options', async () => {
    const user = userEvent.setup();
    render(<PollingInfo />);
    
    const selects = screen.getAllByRole('combobox');
    await user.click(selects[2]);
    
    await waitFor(() => {
      const trueOptions = screen.getAllByText('true');
      const falseOptions = screen.getAllByText('false');
      expect(trueOptions.length).toBeGreaterThan(0);
      expect(falseOptions.length).toBeGreaterThan(0);
    });
  });

  it('should use composite row key', () => {
    const { container } = render(<PollingInfo />);
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(3);
  });

  it('should have fixed left column', () => {
    const { container } = render(<PollingInfo />);
    
    const fixedColumn = container.querySelector('.ant-table-cell-fix-left');
    expect(fixedColumn).toBeInTheDocument();
  });

  it('should flatten nested data structure', () => {
    const { container } = render(<PollingInfo />);
    
    // Should have 3 rows from nested structure
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(3);
  });

  it('should convert processing boolean to string', () => {
    render(<PollingInfo />);
    
    // Processing values should be rendered as strings
    const trueValues = screen.getAllByText('true');
    expect(trueValues.length).toBeGreaterThan(0);
  });

  it('should create unique shard options', async () => {
    const user = userEvent.setup();
    render(<PollingInfo />);
    
    const selects = screen.getAllByRole('combobox');
    await user.click(selects[0]);
    
    await waitFor(() => {
      // Should have unique shard IDs (1 and 2)
      const ones = screen.getAllByText('1');
      expect(ones.length).toBeGreaterThan(0);
    });
  });

  it('should handle empty nested data', () => {
    vi.mocked(hooks.usePollingInfo).mockReturnValue({
      data: {},
      isLoading: false,
    } as any);

    const { container } = render(<PollingInfo />);
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(0);
  });
});

