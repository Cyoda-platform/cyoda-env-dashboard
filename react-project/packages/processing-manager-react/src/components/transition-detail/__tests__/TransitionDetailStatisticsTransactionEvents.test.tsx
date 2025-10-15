/**
 * Tests for TransitionDetailStatisticsTransactionEvents Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { TransitionDetailStatisticsTransactionEvents } from '../TransitionDetailStatisticsTransactionEvents';

// Mock hooks
vi.mock('../../../hooks', () => ({
  useTransactionsViewEvents: vi.fn(),
  useEntitiesListPossible: vi.fn(),
  useTransactionEventStatusesList: vi.fn(),
  useProcessingQueues: vi.fn(),
}));

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ transactionId: 'test-transaction-123', name: 'test-node' })),
  };
});

import { useTransactionsViewEvents, useEntitiesListPossible, useTransactionEventStatusesList, useProcessingQueues } from '../../../hooks';

const mockEventsData = {
  rows: [
    {
      timeUUID: 'time-uuid-1',
      createTime: 1704110400000,
      doneTime: 1704110500000,
      queue: 'queue-1',
      entityClass: 'TestEntity',
      entityId: 'entity-123',
      transactionStatus: 'COMPLETED',
      hasError: false,
    },
    {
      timeUUID: 'time-uuid-2',
      createTime: 1704110600000,
      doneTime: 1704110700000,
      queue: 'queue-2',
      entityClass: 'AnotherEntity',
      entityId: 'entity-456',
      transactionStatus: 'FAILED',
      hasError: true,
    },
  ],
  firstPage: true,
  lastPage: false,
};

describe('TransitionDetailStatisticsTransactionEvents', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useEntitiesListPossible as any).mockReturnValue({
      data: ['TestEntity', 'AnotherEntity'],
      isLoading: false,
    });

    (useTransactionEventStatusesList as any).mockReturnValue({
      data: ['COMPLETED', 'FAILED'],
      isLoading: false,
    });

    (useProcessingQueues as any).mockReturnValue({
      data: ['queue-1', 'queue-2'],
      isLoading: false,
    });

    (useTransactionsViewEvents as any).mockReturnValue({
      refetch: mockRefetch,
      isLoading: false,
    });
  });

  it('should render the component', () => {
    render(
      <BrowserRouter>
        <TransitionDetailStatisticsTransactionEvents />
      </BrowserRouter>
    );
    
    // Should render EventsFilter and EventsTable components
    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
  });

  it('should render EventsFilter component', () => {
    render(
      <BrowserRouter>
        <TransitionDetailStatisticsTransactionEvents />
      </BrowserRouter>
    );
    
    // EventsFilter has a Load button
    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
  });

  it('should render EventsTable component', () => {
    render(
      <BrowserRouter>
        <TransitionDetailStatisticsTransactionEvents />
      </BrowserRouter>
    );
    
    // EventsTable has column headers
    expect(screen.getAllByText('Create Time').length).toBeGreaterThan(0);
  });

  it('should render Pagination component', () => {
    render(
      <BrowserRouter>
        <TransitionDetailStatisticsTransactionEvents />
      </BrowserRouter>
    );
    
    // Pagination has Previous and Next buttons
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('should call useTransactionsViewEvents with correct parameters', () => {
    render(
      <BrowserRouter>
        <TransitionDetailStatisticsTransactionEvents />
      </BrowserRouter>
    );
    
    expect(useTransactionsViewEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-transaction-123',
        pageSize: 10,
        requestLast: false,
        cursor: '',
      }),
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('should call refetch when filter changes', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <TransitionDetailStatisticsTransactionEvents />
      </BrowserRouter>
    );
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);
    
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should pass isLoading to EventsFilter', () => {
    (useTransactionsViewEvents as any).mockReturnValue({
      refetch: mockRefetch,
      isLoading: true,
    });

    const { container } = render(
      <BrowserRouter>
        <TransitionDetailStatisticsTransactionEvents />
      </BrowserRouter>
    );
    
    // When loading, the Load button should be disabled
    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).toBeDisabled();
  });

  it('should pass isLoading to EventsTable', () => {
    (useTransactionsViewEvents as any).mockReturnValue({
      refetch: mockRefetch,
      isLoading: true,
    });

    const { container } = render(
      <BrowserRouter>
        <TransitionDetailStatisticsTransactionEvents />
      </BrowserRouter>
    );
    
    // When loading, the table should show a spinner
    const spinElement = container.querySelector('.ant-spin-spinning');
    expect(spinElement).toBeInTheDocument();
  });

  it('should have transaction-events class', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionDetailStatisticsTransactionEvents />
      </BrowserRouter>
    );
    
    const divElement = container.querySelector('.transaction-events');
    expect(divElement).toBeInTheDocument();
  });

  it('should initialize with default pagination values', () => {
    render(
      <BrowserRouter>
        <TransitionDetailStatisticsTransactionEvents />
      </BrowserRouter>
    );
    
    expect(useTransactionsViewEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        pageSize: 10,
        requestLast: false,
        cursor: '',
      }),
      expect.any(Object)
    );
  });

  it('should render Pagination inside a Card', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionDetailStatisticsTransactionEvents />
      </BrowserRouter>
    );
    
    // Find the card that contains pagination buttons
    const cards = container.querySelectorAll('.ant-card');
    expect(cards.length).toBeGreaterThan(0);
  });
});

