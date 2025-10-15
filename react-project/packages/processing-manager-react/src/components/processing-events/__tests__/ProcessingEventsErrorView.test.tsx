/**
 * Tests for ProcessingEventsErrorView Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { ProcessingEventsErrorView } from '../ProcessingEventsErrorView';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useProcessingQueueEventsError: vi.fn(),
}));

// Mock child components
vi.mock('../ProcessingEventsErrorViewFilter', () => ({
  default: vi.fn(({ onChange, isLoading }) => (
    <div data-testid="filter-component">
      Filter Component
      <button onClick={() => onChange({ queue: 'test-queue', shard: 'shard-1' })}>
        Change Filter
      </button>
      {isLoading && <span>Loading...</span>}
    </div>
  )),
}));

vi.mock('../ProcessingEventsErrorViewTable', () => ({
  default: vi.fn(({ tableData }) => (
    <div data-testid="table-component">
      Table Component
      {tableData.length > 0 && <span>Rows: {tableData.length}</span>}
    </div>
  )),
}));

describe('ProcessingEventsErrorView', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.useProcessingQueueEventsError).mockReturnValue({
      data: null,
      refetch: mockRefetch,
      isLoading: false,
      error: null,
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    render(<ProcessingEventsErrorView />);
    
    expect(screen.getByTestId('filter-component')).toBeInTheDocument();
    expect(screen.getByTestId('table-component')).toBeInTheDocument();
  });

  it('should render filter and table components', () => {
    render(<ProcessingEventsErrorView />);
    
    expect(screen.getByText('Filter Component')).toBeInTheDocument();
    expect(screen.getByText('Table Component')).toBeInTheDocument();
  });

  it('should initialize with empty table data', () => {
    render(<ProcessingEventsErrorView />);
    
    expect(screen.getByTestId('table-component')).toBeInTheDocument();
    expect(screen.queryByText(/Rows:/)).not.toBeInTheDocument();
  });

  it('should call useProcessingQueueEventsError with enabled: false initially', () => {
    render(<ProcessingEventsErrorView />);
    
    expect(hooks.useProcessingQueueEventsError).toHaveBeenCalledWith(
      { params: null },
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('should handle filter change and refetch data', async () => {
    render(<ProcessingEventsErrorView />);
    
    const changeButton = screen.getByText('Change Filter');
    changeButton.click();
    
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should update table data on successful fetch', async () => {
    const mockData = {
      rows: [
        { queueName: 'queue1', timeUUID: 'uuid1', shardId: 'shard1' },
        { queueName: 'queue2', timeUUID: 'uuid2', shardId: 'shard2' },
      ],
    };

    vi.mocked(hooks.useProcessingQueueEventsError).mockReturnValue({
      data: mockData,
      refetch: mockRefetch,
      isLoading: false,
      error: null,
    } as any);

    render(<ProcessingEventsErrorView />);
    
    // Trigger onSuccess callback
    const hookCall = vi.mocked(hooks.useProcessingQueueEventsError).mock.calls[0];
    const onSuccess = hookCall[1]?.onSuccess;
    if (onSuccess) {
      onSuccess(mockData, {} as any);
    }

    await waitFor(() => {
      expect(screen.getByText('Rows: 2')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    vi.mocked(hooks.useProcessingQueueEventsError).mockReturnValue({
      data: null,
      refetch: mockRefetch,
      isLoading: true,
      error: null,
    } as any);

    render(<ProcessingEventsErrorView />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should wrap content in Spin component', () => {
    const { container } = render(<ProcessingEventsErrorView />);
    
    const spinElement = container.querySelector('.ant-spin-nested-loading');
    expect(spinElement).toBeInTheDocument();
  });

  it('should handle empty rows in response', () => {
    const mockData = { rows: [] };

    vi.mocked(hooks.useProcessingQueueEventsError).mockReturnValue({
      data: mockData,
      refetch: mockRefetch,
      isLoading: false,
      error: null,
    } as any);

    render(<ProcessingEventsErrorView />);
    
    const hookCall = vi.mocked(hooks.useProcessingQueueEventsError).mock.calls[0];
    const onSuccess = hookCall[1]?.onSuccess;
    if (onSuccess) {
      onSuccess(mockData, {} as any);
    }

    expect(screen.queryByText(/Rows:/)).not.toBeInTheDocument();
  });

  it('should handle missing rows in response', () => {
    const mockData = {};

    vi.mocked(hooks.useProcessingQueueEventsError).mockReturnValue({
      data: mockData,
      refetch: mockRefetch,
      isLoading: false,
      error: null,
    } as any);

    render(<ProcessingEventsErrorView />);
    
    const hookCall = vi.mocked(hooks.useProcessingQueueEventsError).mock.calls[0];
    const onSuccess = hookCall[1]?.onSuccess;
    if (onSuccess) {
      onSuccess(mockData, {} as any);
    }

    expect(screen.queryByText(/Rows:/)).not.toBeInTheDocument();
  });

  it('should update filter values when filter changes', async () => {
    render(<ProcessingEventsErrorView />);
    
    const changeButton = screen.getByText('Change Filter');
    changeButton.click();
    
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should handle multiple filter changes', async () => {
    render(<ProcessingEventsErrorView />);
    
    const changeButton = screen.getByText('Change Filter');
    
    changeButton.click();
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
    
    changeButton.click();
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should pass isLoading prop to filter component', () => {
    vi.mocked(hooks.useProcessingQueueEventsError).mockReturnValue({
      data: null,
      refetch: mockRefetch,
      isLoading: true,
      error: null,
    } as any);

    render(<ProcessingEventsErrorView />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

