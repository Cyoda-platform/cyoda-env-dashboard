/**
 * Tests for TransitionDetailStatistics Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TransitionDetailStatistics } from '../TransitionDetailStatistics';

// Mock useTransactionsView hook
vi.mock('../../../hooks', () => ({
  useTransactionsView: vi.fn(),
}));

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ transactionId: 'test-transaction-123' })),
  };
});

import { useTransactionsView } from '../../../hooks';

const mockTransactionData = {
  transactionInfoView: {
    id: 'test-transaction-123',
    status: 'COMPLETED',
    transactionSubmitNodeId: 'node-456',
    owner: 'test-user',
    transactionConsistencyTime: 1704110400000, // 2024-01-01 10:00:00
    createTime: 1704106800000, // 2024-01-01 09:00:00
    submitTime: 1704107400000, // 2024-01-01 09:10:00
    finishTime: 1704110400000, // 2024-01-01 10:00:00
    prepareTimeMillis: 600000, // 10 minutes
    processTimeMillis: 3000000, // 50 minutes
    secondPhaseFinished: true,
    transactionSucceeded: true,
  },
  shardUUID: 'shard-uuid-789',
  parentTransactionIds: ['parent-tx-1', 'parent-tx-2'],
};

describe('TransitionDetailStatistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    (useTransactionsView as any).mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Statistics')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    (useTransactionsView as any).mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { container } = render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    // Ant Design Card with loading prop shows a spinner
    const loadingElement = container.querySelector('.ant-card-loading');
    expect(loadingElement).toBeInTheDocument();
  });

  it('should render transaction data when loaded', async () => {
    (useTransactionsView as any).mockReturnValue({
      data: mockTransactionData,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('test-transaction-123')).toBeInTheDocument();
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      expect(screen.getByText('node-456')).toBeInTheDocument();
      expect(screen.getByText('test-user')).toBeInTheDocument();
      expect(screen.getByText('shard-uuid-789')).toBeInTheDocument();
    });
  });

  it('should render all field labels', async () => {
    (useTransactionsView as any).mockReturnValue({
      data: mockTransactionData,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Transaction ID')).toBeInTheDocument();
      expect(screen.getByText('Transaction Status')).toBeInTheDocument();
      expect(screen.getByText('Transaction Submit Node Id')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Shard(uuid)')).toBeInTheDocument();
      expect(screen.getByText('Consistency Time')).toBeInTheDocument();
      expect(screen.getByText('Create time')).toBeInTheDocument();
      expect(screen.getByText('Submit time')).toBeInTheDocument();
      expect(screen.getByText('Finish time')).toBeInTheDocument();
      expect(screen.getByText('Prepare duration')).toBeInTheDocument();
      expect(screen.getByText('Process duration')).toBeInTheDocument();
      expect(screen.getByText('Second Phase Finished Flag')).toBeInTheDocument();
      expect(screen.getByText('Transaction Succeeded Flag')).toBeInTheDocument();
      expect(screen.getByText('Parent Transactions')).toBeInTheDocument();
    });
  });

  it('should format date times correctly', async () => {
    (useTransactionsView as any).mockReturnValue({
      data: mockTransactionData,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      // Check that dates are formatted (format: YYYY-MM-DD HH:mm:ss)
      const dateElements = screen.getAllByText(/2024-01-01/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('should format countdown durations correctly', async () => {
    (useTransactionsView as any).mockReturnValue({
      data: mockTransactionData,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      // 600000ms = 10 minutes = 0h 10m 0s
      expect(screen.getByText('0h 10m 0s')).toBeInTheDocument();
      // 3000000ms = 50 minutes = 0h 50m 0s
      expect(screen.getByText('0h 50m 0s')).toBeInTheDocument();
    });
  });

  it('should format boolean values correctly', async () => {
    (useTransactionsView as any).mockReturnValue({
      data: mockTransactionData,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      const yesElements = screen.getAllByText('Yes');
      // Should have 2 "Yes" values (secondPhaseFinished and transactionSucceeded)
      expect(yesElements.length).toBe(2);
    });
  });

  it('should render "No" for false boolean values', async () => {
    const dataWithFalseFlags = {
      ...mockTransactionData,
      transactionInfoView: {
        ...mockTransactionData.transactionInfoView,
        secondPhaseFinished: false,
        transactionSucceeded: false,
      },
    };

    (useTransactionsView as any).mockReturnValue({
      data: dataWithFalseFlags,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      const noElements = screen.getAllByText('No');
      // Should have 2 "No" values
      expect(noElements.length).toBe(2);
    });
  });

  it('should render parent transaction IDs', async () => {
    (useTransactionsView as any).mockReturnValue({
      data: mockTransactionData,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/1\) parent-tx-1/)).toBeInTheDocument();
      expect(screen.getByText(/2\) parent-tx-2/)).toBeInTheDocument();
    });
  });

  it('should handle empty parent transaction IDs', async () => {
    const dataWithNoParents = {
      ...mockTransactionData,
      parentTransactionIds: [],
    };

    (useTransactionsView as any).mockReturnValue({
      data: dataWithNoParents,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Parent Transactions')).toBeInTheDocument();
      // Should not render any parent transaction text
      expect(screen.queryByText(/parent-tx/)).not.toBeInTheDocument();
    });
  });

  it('should handle null/undefined date values', async () => {
    const dataWithNullDates = {
      ...mockTransactionData,
      transactionInfoView: {
        ...mockTransactionData.transactionInfoView,
        transactionConsistencyTime: null,
        createTime: undefined,
      },
    };

    (useTransactionsView as any).mockReturnValue({
      data: dataWithNullDates,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    // Should render without errors
    await waitFor(() => {
      expect(screen.getByText('Statistics')).toBeInTheDocument();
    });
  });

  it('should handle null/undefined duration values', async () => {
    const dataWithNullDurations = {
      ...mockTransactionData,
      transactionInfoView: {
        ...mockTransactionData.transactionInfoView,
        prepareTimeMillis: null,
        processTimeMillis: undefined,
      },
    };

    (useTransactionsView as any).mockReturnValue({
      data: dataWithNullDurations,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    // Should render without errors
    await waitFor(() => {
      expect(screen.getByText('Statistics')).toBeInTheDocument();
    });
  });

  it('should call useTransactionsView with correct transaction ID', () => {
    (useTransactionsView as any).mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    expect(useTransactionsView).toHaveBeenCalledWith({ id: 'test-transaction-123' });
  });

  it('should have correct CSS class', () => {
    (useTransactionsView as any).mockReturnValue({
      data: mockTransactionData,
      isLoading: false,
    });

    const { container } = render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    const cardElement = container.querySelector('.transition-detail-statistics');
    expect(cardElement).toBeInTheDocument();
  });

  it('should render as a list structure', async () => {
    (useTransactionsView as any).mockReturnValue({
      data: mockTransactionData,
      isLoading: false,
    });

    const { container } = render(
      <BrowserRouter>
        <TransitionDetailStatistics />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      const listElement = container.querySelector('ul');
      expect(listElement).toBeInTheDocument();
      
      const listItems = container.querySelectorAll('li');
      expect(listItems.length).toBeGreaterThan(0);
    });
  });
});

