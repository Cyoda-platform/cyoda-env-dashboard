/**
 * Tests for TransactionsEntities Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionsEntities from '../TransactionsEntities';
import { axiosProcessing } from '@cyoda/http-api-react';

// Mock axios
vi.mock('@cyoda/http-api-react', () => ({
  axiosProcessing: {
    get: vi.fn(),
  },
}));

// Mock HelperUrl
vi.mock('../../../utils', () => ({
  HelperUrl: {
    getLinkToServer: (path: string) => path,
  },
}));

// Mock child components
vi.mock('../TransactionsEntitiesFilter', () => ({
  default: ({ isLoading, onChange }: any) => (
    <div data-testid="transactions-entities-filter">
      Filter - Loading: {isLoading ? 'true' : 'false'}
      <button onClick={() => onChange({ entityClass: 'TestClass' })}>Load</button>
    </div>
  ),
}));

vi.mock('../TransactionsEntitiesTable', () => ({
  default: ({ isLoading, tableData }: any) => (
    <div data-testid="transactions-entities-table">
      Table - Loading: {isLoading ? 'true' : 'false'}, Rows: {tableData.length}
    </div>
  ),
}));

describe('TransactionsEntities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    const { container } = render(<TransactionsEntities />);

    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render filter component', () => {
    render(<TransactionsEntities />);

    expect(screen.getByTestId('transactions-entities-filter')).toBeInTheDocument();
  });

  it('should render table component', () => {
    render(<TransactionsEntities />);

    expect(screen.getByTestId('transactions-entities-table')).toBeInTheDocument();
  });

  it('should initialize with loading false', () => {
    render(<TransactionsEntities />);

    expect(screen.getByText(/Filter - Loading: false/)).toBeInTheDocument();
    expect(screen.getByText(/Table - Loading: false/)).toBeInTheDocument();
  });

  it('should initialize with empty table data', () => {
    render(<TransactionsEntities />);

    expect(screen.getByText(/Rows: 0/)).toBeInTheDocument();
  });

  it('should load data when filter changes', async () => {
    const user = userEvent.setup();
    const mockData = {
      entities: [
        { entityId: 'entity-1', cretionDate: '2024-01-01', shardId: 'shard-1' },
        { entityId: 'entity-2', cretionDate: '2024-01-02', shardId: 'shard-2' },
      ],
    };

    vi.mocked(axiosProcessing.get).mockResolvedValue({ data: mockData });

    render(<TransactionsEntities />);

    // Click load button
    await user.click(screen.getByText('Load'));

    await waitFor(() => {
      expect(axiosProcessing.get).toHaveBeenCalledWith(
        '/platform-processing/transactions/entities-list',
        { params: { entityClass: 'TestClass' } }
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Rows: 2/)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(axiosProcessing.get).mockRejectedValue(new Error('API Error'));

    render(<TransactionsEntities />);

    await user.click(screen.getByText('Load'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load transactions entities:',
        expect.any(Error)
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Rows: 0/)).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should show loading state during API call', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(axiosProcessing.get).mockReturnValue(promise as any);

    render(<TransactionsEntities />);

    await user.click(screen.getByText('Load'));

    await waitFor(() => {
      expect(screen.getByText(/Filter - Loading: true/)).toBeInTheDocument();
      expect(screen.getByText(/Table - Loading: true/)).toBeInTheDocument();
    });

    resolvePromise!({ data: { entities: [] } });

    await waitFor(() => {
      expect(screen.getByText(/Filter - Loading: false/)).toBeInTheDocument();
      expect(screen.getByText(/Table - Loading: false/)).toBeInTheDocument();
    });
  });

  it('should render both filter and table', () => {
    render(<TransactionsEntities />);

    expect(screen.getByTestId('transactions-entities-filter')).toBeInTheDocument();
    expect(screen.getByTestId('transactions-entities-table')).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = render(<TransactionsEntities />);

    expect(container).toBeInTheDocument();
  });
});

