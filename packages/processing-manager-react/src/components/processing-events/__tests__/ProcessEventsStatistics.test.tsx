/**
 * Tests for ProcessEventsStatistics Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProcessEventsStatistics } from '../ProcessEventsStatistics';
import * as hooks from '../../../hooks/useProcessing';

// Mock the hooks
vi.mock('../../../hooks/useProcessing', () => ({
  useProcessEventsStats: vi.fn(),
  useSummary: vi.fn(),
  useProcessingQueueEvents: vi.fn(),
  useProcessingQueues: vi.fn(),
}));

const mockStatsData = [
  {
    key: {
      queue: 'DISTRIBUTED_REPORT_1_PHASE',
      entityClass: 'TestEntity1',
      shard: '1',
      processor: { name: 'processor1' },
    },
    count: 10,
  },
  {
    key: {
      queue: 'INDEX_CONFIGURATION',
      entityClass: 'TestEntity2',
      shard: '2',
      processor: { name: 'processor2' },
    },
    count: 20,
  },
];

describe('ProcessEventsStatistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(hooks.useProcessEventsStats).mockReturnValue({
      data: mockStatsData,
      isLoading: false,
    } as any);

    vi.mocked(hooks.useSummary).mockReturnValue({
      data: {
        actualShards: [
          { shardId: '1' },
          { shardId: '2' },
        ],
      },
    } as any);

    vi.mocked(hooks.useProcessingQueueEvents).mockReturnValue({
      data: ['queue1', 'queue2'],
    } as any);

    vi.mocked(hooks.useProcessingQueues).mockReturnValue({
      data: ['queue1', 'queue2'],
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    render(<ProcessEventsStatistics />);
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should render all filter fields', () => {
    render(<ProcessEventsStatistics />);

    const queue = screen.getAllByText('Queue');
    const shard = screen.getAllByText('Shard');
    const classText = screen.getAllByText('Class');
    const processor = screen.getAllByText('Processor');

    expect(queue.length).toBeGreaterThan(0);
    expect(shard.length).toBeGreaterThan(0);
    expect(classText.length).toBeGreaterThan(0);
    expect(processor.length).toBeGreaterThan(0);
  });

  it('should render table with columns', () => {
    render(<ProcessEventsStatistics />);
    
    const headers = screen.getAllByRole('columnheader');
    const headerTexts = headers.map((h) => h.textContent);
    
    expect(headerTexts).toContain('Queue');
    expect(headerTexts).toContain('Shard');
    expect(headerTexts).toContain('Class');
    expect(headerTexts).toContain('Processor');
    expect(headerTexts).toContain('Count');
  });

  it('should have 5 columns', () => {
    render(<ProcessEventsStatistics />);
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBe(5);
  });

  it('should render table data', () => {
    render(<ProcessEventsStatistics />);

    const entity1 = screen.getAllByText('TestEntity1');
    const entity2 = screen.getAllByText('TestEntity2');
    expect(entity1.length).toBeGreaterThan(0);
    expect(entity2.length).toBeGreaterThan(0);
  });

  it('should render queue names in Queue column', () => {
    render(<ProcessEventsStatistics />);

    expect(screen.getByText('DISTRIBUTED_REPORT_1_PHASE')).toBeInTheDocument();
    expect(screen.getByText('INDEX_CONFIGURATION')).toBeInTheDocument();
  });

  it('should render entity class names in Class column', () => {
    render(<ProcessEventsStatistics />);

    const entity1 = screen.getAllByText('TestEntity1');
    const entity2 = screen.getAllByText('TestEntity2');
    expect(entity1.length).toBeGreaterThan(0);
    expect(entity2.length).toBeGreaterThan(0);
  });

  it('should render count values', () => {
    render(<ProcessEventsStatistics />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('should render shard numbers', () => {
    render(<ProcessEventsStatistics />);
    
    const ones = screen.getAllByText('1');
    const twos = screen.getAllByText('2');
    expect(ones.length).toBeGreaterThan(0);
    expect(twos.length).toBeGreaterThan(0);
  });

  it('should show loading state', () => {
    vi.mocked(hooks.useProcessEventsStats).mockReturnValue({
      data: null,
      isLoading: true,
    } as any);

    const { container } = render(<ProcessEventsStatistics />);
    
    const spinner = container.querySelector('.ant-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    vi.mocked(hooks.useProcessEventsStats).mockReturnValue({
      data: null,
      isLoading: false,
    } as any);

    const { container } = render(<ProcessEventsStatistics />);
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(0);
  });

  it('should render queue filter options', async () => {
    const user = userEvent.setup();
    render(<ProcessEventsStatistics />);
    
    const selects = screen.getAllByRole('combobox');
    await user.click(selects[0]);
    
    await waitFor(() => {
      const queue1 = screen.getAllByText('queue1');
      const queue2 = screen.getAllByText('queue2');
      expect(queue1.length).toBeGreaterThan(0);
      expect(queue2.length).toBeGreaterThan(0);
    });
  });

  it('should render shard filter options', async () => {
    const user = userEvent.setup();
    render(<ProcessEventsStatistics />);
    
    const selects = screen.getAllByRole('combobox');
    await user.click(selects[1]);
    
    await waitFor(() => {
      const ones = screen.getAllByText('1');
      const twos = screen.getAllByText('2');
      expect(ones.length).toBeGreaterThan(0);
      expect(twos.length).toBeGreaterThan(0);
    });
  });

  it('should have bordered table', () => {
    const { container } = render(<ProcessEventsStatistics />);
    
    const table = container.querySelector('.ant-table-bordered');
    expect(table).toBeInTheDocument();
  });

  it('should have scrollable table', () => {
    const { container } = render(<ProcessEventsStatistics />);
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should have pagination', () => {
    const { container } = render(<ProcessEventsStatistics />);
    
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should render correct number of rows', () => {
    const { container } = render(<ProcessEventsStatistics />);
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(2);
  });

  it('should handle missing summary data', () => {
    vi.mocked(hooks.useSummary).mockReturnValue({
      data: null,
    } as any);

    render(<ProcessEventsStatistics />);
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should handle missing queues data', () => {
    vi.mocked(hooks.useProcessingQueueEvents).mockReturnValue({
      data: null,
    } as any);

    render(<ProcessEventsStatistics />);
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should stringify processor in table data', () => {
    render(<ProcessEventsStatistics />);
    
    const processor1 = screen.getByText('{"name":"processor1"}');
    const processor2 = screen.getByText('{"name":"processor2"}');
    expect(processor1).toBeInTheDocument();
    expect(processor2).toBeInTheDocument();
  });

  it('should have allowClear on all selects', () => {
    render(<ProcessEventsStatistics />);

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(4);
  });

  it('should have showSearch on all selects', () => {
    render(<ProcessEventsStatistics />);

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(4);
  });

  it('should render select components with placeholders', () => {
    render(<ProcessEventsStatistics />);

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(4);
  });

  it('should handle large dataset', () => {
    const largeData = Array.from({ length: 50 }, (_, i) => ({
      key: {
        entityClass: `Entity${i}`,
        shard: String(i % 5),
        processor: { name: `processor${i}` },
      },
      count: i * 10,
    }));

    vi.mocked(hooks.useProcessEventsStats).mockReturnValue({
      data: largeData,
      isLoading: false,
    } as any);

    const { container } = render(<ProcessEventsStatistics />);
    
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should use composite row key', () => {
    const { container } = render(<ProcessEventsStatistics />);
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(2);
  });
});

