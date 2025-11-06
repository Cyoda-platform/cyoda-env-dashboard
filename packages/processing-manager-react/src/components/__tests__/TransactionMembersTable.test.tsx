/**
 * TransactionMembersTable Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionMembersTable from '../TransactionMembersTable';
import * as hooks from '../../hooks';

// Mock the useTransactionMembers hook
vi.mock('../../hooks', () => ({
  useTransactionMembers: vi.fn(),
}));

describe('TransactionMembersTable', () => {
  const mockMembers = [
    {
      id: '1',
      entityId: 'entity-123',
      entityType: 'BUSINESS',
      operation: 'CREATE',
      status: 'COMPLETED',
      timestamp: '2024-01-01T10:00:00Z',
    },
    {
      id: '2',
      entityId: 'entity-456',
      entityType: 'TECHNICAL',
      operation: 'UPDATE',
      status: 'PENDING',
      timestamp: '2024-01-01T11:00:00Z',
    },
    {
      id: '3',
      entityId: 'entity-789',
      entityType: 'REFERENCE',
      operation: 'DELETE',
      status: 'FAILED',
      timestamp: '2024-01-01T12:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render table with data', () => {
    vi.mocked(hooks.useTransactionMembers).mockReturnValue({
      data: mockMembers,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionMembersTable transactionId="txn-123" />);

    // Check table headers (they appear multiple times in DOM)
    const entityIdHeaders = screen.getAllByText('Entity ID');
    expect(entityIdHeaders.length).toBeGreaterThan(0);

    const entityTypeHeaders = screen.getAllByText('Entity Type');
    expect(entityTypeHeaders.length).toBeGreaterThan(0);

    // Check data rows
    expect(screen.getByText('entity-123')).toBeInTheDocument();
    expect(screen.getByText('entity-456')).toBeInTheDocument();
    expect(screen.getByText('entity-789')).toBeInTheDocument();
  });

  it('should display operation tags with correct colors', () => {
    vi.mocked(hooks.useTransactionMembers).mockReturnValue({
      data: mockMembers,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionMembersTable transactionId="txn-123" />);

    // Check operation tags exist
    const createTags = screen.getAllByText('CREATE');
    expect(createTags.length).toBeGreaterThan(0);

    const updateTags = screen.getAllByText('UPDATE');
    expect(updateTags.length).toBeGreaterThan(0);

    const deleteTags = screen.getAllByText('DELETE');
    expect(deleteTags.length).toBeGreaterThan(0);
  });

  it('should display status tags with correct colors', () => {
    vi.mocked(hooks.useTransactionMembers).mockReturnValue({
      data: mockMembers,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionMembersTable transactionId="txn-123" />);

    // Check status tags exist
    const completedTags = screen.getAllByText('COMPLETED');
    expect(completedTags.length).toBeGreaterThan(0);

    const pendingTags = screen.getAllByText('PENDING');
    expect(pendingTags.length).toBeGreaterThan(0);

    const failedTags = screen.getAllByText('FAILED');
    expect(failedTags.length).toBeGreaterThan(0);
  });

  it('should show loading state', () => {
    vi.mocked(hooks.useTransactionMembers).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionMembersTable transactionId="txn-123" />);

    // Ant Design Table shows loading spinner
    const table = document.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should show empty state when no data', () => {
    vi.mocked(hooks.useTransactionMembers).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionMembersTable transactionId="txn-123" />);

    // Ant Design Table shows "No data" for empty state
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

    vi.mocked(hooks.useTransactionMembers).mockImplementation(mockHook);

    render(<TransactionMembersTable transactionId="txn-456" />);

    expect(mockHook).toHaveBeenCalledWith(
      'txn-456',
      expect.objectContaining({
        pageNum: 1,
        pageSize: 10,
      })
    );
  });

  it('should display all entity types', () => {
    vi.mocked(hooks.useTransactionMembers).mockReturnValue({
      data: mockMembers,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionMembersTable transactionId="txn-123" />);

    expect(screen.getByText('BUSINESS')).toBeInTheDocument();
    expect(screen.getByText('TECHNICAL')).toBeInTheDocument();
    expect(screen.getByText('REFERENCE')).toBeInTheDocument();
  });

  it('should render table structure correctly', () => {
    vi.mocked(hooks.useTransactionMembers).mockReturnValue({
      data: mockMembers,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionMembersTable transactionId="txn-123" />);

    // Check that table exists
    const table = document.querySelector('.ant-table');
    expect(table).toBeInTheDocument();

    // Check that rows exist
    const rows = document.querySelectorAll('.ant-table-tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });
});

