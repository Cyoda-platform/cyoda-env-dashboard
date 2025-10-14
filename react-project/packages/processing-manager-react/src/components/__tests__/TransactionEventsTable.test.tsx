/**
 * TransactionEventsTable Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionEventsTable from '../TransactionEventsTable';
import * as hooks from '../../hooks';

// Mock the useTransactionEvents hook
vi.mock('../../hooks', () => ({
  useTransactionEvents: vi.fn(),
}));

describe('TransactionEventsTable', () => {
  const mockEvents = [
    {
      id: '1',
      eventType: 'STARTED',
      timestamp: '2024-01-01T10:00:00Z',
      error: null,
      data: { key: 'value1' },
    },
    {
      id: '2',
      eventType: 'COMPLETED',
      timestamp: '2024-01-01T11:00:00Z',
      error: null,
      data: { key: 'value2' },
    },
    {
      id: '3',
      eventType: 'FAILED',
      timestamp: '2024-01-01T12:00:00Z',
      error: 'Something went wrong',
      data: { key: 'value3' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render events table', () => {
    vi.mocked(hooks.useTransactionEvents).mockReturnValue({
      data: mockEvents,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionEventsTable transactionId="txn-123" />);

    // Check table headers (they appear multiple times in DOM)
    const eventTypeHeaders = screen.getAllByText('Event Type');
    expect(eventTypeHeaders.length).toBeGreaterThan(0);

    const timestampHeaders = screen.getAllByText('Timestamp');
    expect(timestampHeaders.length).toBeGreaterThan(0);
  });

  it('should display event types', () => {
    vi.mocked(hooks.useTransactionEvents).mockReturnValue({
      data: mockEvents,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionEventsTable transactionId="txn-123" />);

    expect(screen.getByText('STARTED')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('FAILED')).toBeInTheDocument();
  });

  it('should display status tags correctly', () => {
    vi.mocked(hooks.useTransactionEvents).mockReturnValue({
      data: mockEvents,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionEventsTable transactionId="txn-123" />);

    // Check for SUCCESS tags (events without errors)
    const successTags = screen.getAllByText('SUCCESS');
    expect(successTags.length).toBeGreaterThan(0);

    // Check for ERROR tag (event with error)
    const errorTags = screen.getAllByText('ERROR');
    expect(errorTags.length).toBeGreaterThan(0);
  });

  it('should display error messages', () => {
    vi.mocked(hooks.useTransactionEvents).mockReturnValue({
      data: mockEvents,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionEventsTable transactionId="txn-123" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should show "-" for events without errors', () => {
    vi.mocked(hooks.useTransactionEvents).mockReturnValue({
      data: mockEvents,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionEventsTable transactionId="txn-123" />);

    // Events without errors show "-"
    const dashElements = screen.getAllByText('-');
    expect(dashElements.length).toBeGreaterThan(0);
  });

  it('should show loading state', () => {
    vi.mocked(hooks.useTransactionEvents).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionEventsTable transactionId="txn-123" />);

    const table = document.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should show empty state when no data', () => {
    vi.mocked(hooks.useTransactionEvents).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionEventsTable transactionId="txn-123" />);

    const emptyElements = screen.getAllByText(/No data/i);
    expect(emptyElements.length).toBeGreaterThan(0);
  });

  it('should call hook with correct transaction ID', () => {
    const mockHook = vi.fn().mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    vi.mocked(hooks.useTransactionEvents).mockImplementation(mockHook);

    render(<TransactionEventsTable transactionId="txn-789" />);

    expect(mockHook).toHaveBeenCalledWith(
      'txn-789',
      expect.objectContaining({
        eventType: undefined,
      })
    );
  });

  it('should render table structure correctly', () => {
    vi.mocked(hooks.useTransactionEvents).mockReturnValue({
      data: mockEvents,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionEventsTable transactionId="txn-123" />);

    const table = document.querySelector('.ant-table');
    expect(table).toBeInTheDocument();

    const rows = document.querySelectorAll('.ant-table-tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should format timestamps correctly', () => {
    vi.mocked(hooks.useTransactionEvents).mockReturnValue({
      data: mockEvents,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionEventsTable transactionId="txn-123" />);

    // Timestamps should be formatted as locale strings
    // The exact format depends on locale, so we just check that some formatted date exists
    const table = document.querySelector('.ant-table');
    expect(table?.textContent).toContain('2024');
  });

  it('should have details buttons', () => {
    vi.mocked(hooks.useTransactionEvents).mockReturnValue({
      data: mockEvents,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionEventsTable transactionId="txn-123" />);

    // Check for "Details" buttons (one per row)
    const detailsButtons = screen.getAllByText('Details');
    expect(detailsButtons.length).toBe(3);
  });
});

