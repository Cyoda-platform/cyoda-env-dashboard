/**
 * Tests for ProcessingEventsEntitiesErrorListView Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { ProcessingEventsEntitiesErrorListView } from '../ProcessingEventsEntitiesErrorListView';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useProcessingQueueEntitiesErrorList: vi.fn(),
}));

// Mock child components
vi.mock('../ProcessingEventsEntitiesErrorListViewFilter', () => ({
  ProcessingEventsEntitiesErrorListViewFilter: vi.fn(({ onChange, isLoading }) => (
    <div data-testid="filter-component">
      Filter Component
      <button onClick={() => onChange({ type: 'TestEntity' })}>Change Filter</button>
      {isLoading && <span>Loading...</span>}
    </div>
  )),
}));

vi.mock('../ProcessingEventsEntitiesErrorListViewTable', () => ({
  ProcessingEventsEntitiesErrorListViewTable: vi.fn(({ tableData }) => (
    <div data-testid="table-component">
      Table Component
      {tableData.length > 0 && <span>Rows: {tableData.length}</span>}
    </div>
  )),
}));

describe('ProcessingEventsEntitiesErrorListView', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.useProcessingQueueEntitiesErrorList).mockReturnValue({
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
    render(<ProcessingEventsEntitiesErrorListView />);
    
    expect(screen.getByTestId('filter-component')).toBeInTheDocument();
    expect(screen.getByTestId('table-component')).toBeInTheDocument();
  });

  it('should render filter and table components', () => {
    render(<ProcessingEventsEntitiesErrorListView />);
    
    expect(screen.getByText('Filter Component')).toBeInTheDocument();
    expect(screen.getByText('Table Component')).toBeInTheDocument();
  });

  it('should initialize with empty table data', () => {
    render(<ProcessingEventsEntitiesErrorListView />);

    // Table component should be rendered
    expect(screen.getByTestId('table-component')).toBeInTheDocument();
    // Should not show any rows initially
    expect(screen.queryByText(/Rows:/)).not.toBeInTheDocument();
  });

  it('should initialize with isLoading false', () => {
    render(<ProcessingEventsEntitiesErrorListView />);

    // Should not show loading state initially
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('should call useProcessingQueueEntitiesErrorList with enabled: false initially', () => {
    render(<ProcessingEventsEntitiesErrorListView />);

    expect(hooks.useProcessingQueueEntitiesErrorList).toHaveBeenCalledWith(
      { type: undefined },
      { enabled: false }
    );
  });

  it('should handle filter change and fetch data', async () => {
    const mockData = {
      data: {
        elements: [
          { entityClass: 'TestEntity', entityId: '123', shardId: 'shard1', eventUUID: 'uuid1' },
          { entityClass: 'TestEntity', entityId: '456', shardId: 'shard2', eventUUID: 'uuid2' },
        ],
      },
    };
    mockRefetch.mockResolvedValue({ data: mockData });
    
    render(<ProcessingEventsEntitiesErrorListView />);
    
    const changeButton = screen.getByText('Change Filter');
    changeButton.click();
    
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should update table data after successful fetch', async () => {
    const mockData = {
      data: {
        elements: [
          { entityClass: 'TestEntity', entityId: '123', shardId: 'shard1', eventUUID: 'uuid1' },
        ],
      },
    };
    mockRefetch.mockResolvedValue({ data: mockData });
    
    render(<ProcessingEventsEntitiesErrorListView />);
    
    const changeButton = screen.getByText('Change Filter');
    changeButton.click();
    
    await waitFor(() => {
      expect(screen.getByText('Rows: 1')).toBeInTheDocument();
    });
  });

  it('should show loading state during fetch', async () => {
    mockRefetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<ProcessingEventsEntitiesErrorListView />);
    
    const changeButton = screen.getByText('Change Filter');
    changeButton.click();
    
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  it('should hide loading state after fetch completes', async () => {
    const mockData = {
      data: {
        elements: [],
      },
    };
    mockRefetch.mockResolvedValue({ data: mockData });
    
    render(<ProcessingEventsEntitiesErrorListView />);
    
    const changeButton = screen.getByText('Change Filter');
    changeButton.click();
    
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('should handle empty data response', async () => {
    const mockData = {
      data: {
        elements: [],
      },
    };
    mockRefetch.mockResolvedValue({ data: mockData });
    
    render(<ProcessingEventsEntitiesErrorListView />);
    
    const changeButton = screen.getByText('Change Filter');
    changeButton.click();
    
    await waitFor(() => {
      expect(screen.queryByText(/Rows:/)).not.toBeInTheDocument();
    });
  });

  it('should handle missing elements in response', async () => {
    const mockData = {
      data: {},
    };
    mockRefetch.mockResolvedValue({ data: mockData });
    
    render(<ProcessingEventsEntitiesErrorListView />);
    
    const changeButton = screen.getByText('Change Filter');
    changeButton.click();
    
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });

    // Should not show any rows (empty array)
    expect(screen.queryByText(/Rows:/)).not.toBeInTheDocument();
  });

  it('should handle fetch error gracefully', async () => {
    // Mock console.error to suppress error output
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockRefetch.mockRejectedValue(new Error('Fetch failed'));

    render(<ProcessingEventsEntitiesErrorListView />);

    const changeButton = screen.getByText('Change Filter');
    changeButton.click();

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Should hide loading state even on error
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    consoleError.mockRestore();
  });

  it('should wrap content in Spin component', () => {
    const { container } = render(<ProcessingEventsEntitiesErrorListView />);
    
    const spinElement = container.querySelector('.ant-spin-nested-loading');
    expect(spinElement).toBeInTheDocument();
  });

  it('should update filter state when onChange is called', async () => {
    const mockData = {
      data: {
        elements: [{ entityClass: 'NewEntity', entityId: '789', shardId: 'shard3', eventUUID: 'uuid3' }],
      },
    };
    mockRefetch.mockResolvedValue({ data: mockData });
    
    render(<ProcessingEventsEntitiesErrorListView />);
    
    const changeButton = screen.getByText('Change Filter');
    changeButton.click();
    
    await waitFor(() => {
      expect(screen.getByText('Rows: 1')).toBeInTheDocument();
    });
  });

  it('should handle multiple filter changes', async () => {
    const mockData1 = {
      data: {
        elements: [{ entityClass: 'Entity1', entityId: '1', shardId: 'shard1', eventUUID: 'uuid1' }],
      },
    };
    const mockData2 = {
      data: {
        elements: [
          { entityClass: 'Entity2', entityId: '2', shardId: 'shard2', eventUUID: 'uuid2' },
          { entityClass: 'Entity2', entityId: '3', shardId: 'shard3', eventUUID: 'uuid3' },
        ],
      },
    };
    
    mockRefetch.mockResolvedValueOnce({ data: mockData1 }).mockResolvedValueOnce({ data: mockData2 });
    
    render(<ProcessingEventsEntitiesErrorListView />);
    
    const changeButton = screen.getByText('Change Filter');
    
    changeButton.click();
    await waitFor(() => {
      expect(screen.getByText('Rows: 1')).toBeInTheDocument();
    });
    
    changeButton.click();
    await waitFor(() => {
      expect(screen.getByText('Rows: 2')).toBeInTheDocument();
    });
  });

});

