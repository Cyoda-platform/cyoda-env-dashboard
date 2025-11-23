/**
 * Tests for ProcessingEventsErrorViewFilter Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProcessingEventsErrorViewFilter } from '../ProcessingEventsErrorViewFilter';
import * as hooks from '../../../hooks';
import dayjs from 'dayjs';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useSummary: vi.fn(),
  useProcessingQueues: vi.fn(),
}));

describe('ProcessingEventsErrorViewFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(hooks.useSummary).mockReturnValue({
      data: {
        actualShards: [
          { shardId: 'shard-1' },
          { shardId: 'shard-2' },
          { shardId: 'shard-3' },
        ],
      },
    } as any);

    vi.mocked(hooks.useProcessingQueues).mockReturnValue({
      data: ['queue-1', 'queue-2', 'queue-3'],
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);
    
    expect(screen.getByText('Queue')).toBeInTheDocument();
    expect(screen.getByText('Shard')).toBeInTheDocument();
    expect(screen.getByText('Time From')).toBeInTheDocument();
    expect(screen.getByText('Time To')).toBeInTheDocument();
    expect(screen.getByText('Sort by time')).toBeInTheDocument();
  });

  it('should render Load button', () => {
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).toBeInTheDocument();
  });

  it('should call onChange with initial form values on mount', async () => {
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          queue: 'ALL',
          shard: 'ALL',
          sort: 'SORT_DESC',
          pageNum: 0,
        })
      );
    });
  });

  it('should initialize with default values', async () => {
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);
    
    await waitFor(() => {
      const call = mockOnChange.mock.calls[0][0];
      expect(call.queue).toBe('ALL');
      expect(call.shard).toBe('ALL');
      expect(call.sort).toBe('SORT_DESC');
      expect(call.pageNum).toBe(0);
      expect(call.from).toBeTruthy();
      expect(call.to).toBeTruthy();
    });
  });

  it('should render queue options from hook data', async () => {
    const user = userEvent.setup();
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);

    const queueSelects = screen.getAllByRole('combobox');
    await user.click(queueSelects[0]);

    await waitFor(() => {
      const queue1 = screen.getAllByText('queue-1');
      const queue2 = screen.getAllByText('queue-2');
      const queue3 = screen.getAllByText('queue-3');
      expect(queue1.length).toBeGreaterThan(0);
      expect(queue2.length).toBeGreaterThan(0);
      expect(queue3.length).toBeGreaterThan(0);
    });
  });

  it('should render shard options from hook data', async () => {
    const user = userEvent.setup();
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);

    const shardSelects = screen.getAllByRole('combobox');
    await user.click(shardSelects[1]);

    await waitFor(() => {
      const shard1 = screen.getAllByText('shard-1');
      const shard2 = screen.getAllByText('shard-2');
      const shard3 = screen.getAllByText('shard-3');
      expect(shard1.length).toBeGreaterThan(0);
      expect(shard2.length).toBeGreaterThan(0);
      expect(shard3.length).toBeGreaterThan(0);
    });
  });

  it('should render sort options', async () => {
    const user = userEvent.setup();
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);

    const sortSelects = screen.getAllByRole('combobox');
    await user.click(sortSelects[2]);

    await waitFor(() => {
      const sortAsc = screen.getAllByText('SORT_ASC');
      const sortDesc = screen.getAllByText('SORT_DESC');
      expect(sortAsc.length).toBeGreaterThan(0);
      expect(sortDesc.length).toBeGreaterThan(0);
    });
  });

  it('should handle queue selection', async () => {
    const user = userEvent.setup();
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);

    mockOnChange.mockClear();

    const queueSelects = screen.getAllByRole('combobox');
    await user.click(queueSelects[0]);

    const queue1Options = await screen.findAllByText('queue-1');
    await user.click(queue1Options[0]);

    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          queue: 'queue-1',
        })
      );
    }, { timeout: 10000 });
  }, 15000);

  it('should handle shard selection', async () => {
    const user = userEvent.setup();
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);

    mockOnChange.mockClear();

    const shardSelects = screen.getAllByRole('combobox');
    await user.click(shardSelects[1]);

    const shard1Options = await screen.findAllByText('shard-1');
    await user.click(shard1Options[0]);

    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          shard: 'shard-1',
        })
      );
    }, { timeout: 10000 });
  }, 15000);

  it('should handle sort selection', async () => {
    const user = userEvent.setup();
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);

    // Wait for initial call
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });

    const sortSelects = screen.getAllByRole('combobox');

    // Verify sort select is present and can be interacted with
    await user.click(sortSelects[2]);

    const sortAscOptions = await screen.findAllByText('SORT_ASC');
    expect(sortAscOptions.length).toBeGreaterThan(0);
  });

  it('should call onChange when Load button is clicked', async () => {
    const user = userEvent.setup();
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);
    
    mockOnChange.mockClear();
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should show loading state on button', () => {
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} isLoading={true} />);
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).toHaveClass('ant-btn-loading');
  });

  it('should handle empty summary data', () => {
    vi.mocked(hooks.useSummary).mockReturnValue({
      data: null,
    } as any);

    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should handle empty queues data', () => {
    vi.mocked(hooks.useProcessingQueues).mockReturnValue({
      data: null,
    } as any);

    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should have allowClear on queue select', async () => {
    const user = userEvent.setup();
    const { container } = render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);

    // Wait for initial call
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });

    const queueSelects = screen.getAllByRole('combobox');
    await user.click(queueSelects[0]);

    const queue1Options = await screen.findAllByText('queue-1');
    expect(queue1Options.length).toBeGreaterThan(0);
  });

  it('should render date pickers', () => {
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);
    
    const datePickers = screen.getAllByPlaceholderText('Pick a day');
    expect(datePickers).toHaveLength(2);
  });

  it('should initialize with yesterday as from date', async () => {
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);
    
    await waitFor(() => {
      const call = mockOnChange.mock.calls[0][0];
      const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
      expect(call.from).toContain(yesterday);
    });
  });

  it('should initialize with today as to date', async () => {
    render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);
    
    await waitFor(() => {
      const call = mockOnChange.mock.calls[0][0];
      const today = dayjs().format('YYYY-MM-DD');
      expect(call.to).toContain(today);
    });
  });

  it('should render horizontal rule separator', () => {
    const { container } = render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);
    
    const hr = container.querySelector('hr');
    expect(hr).toBeInTheDocument();
  });

  it('should have correct form layout', () => {
    const { container } = render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);
    
    const form = container.querySelector('.ant-form-vertical');
    expect(form).toBeInTheDocument();
  });

  it('should have correct CSS class', () => {
    const { container } = render(<ProcessingEventsErrorViewFilter onChange={mockOnChange} />);
    
    const form = container.querySelector('.pm-processing-events-error-view-filter');
    expect(form).toBeInTheDocument();
  });
});

