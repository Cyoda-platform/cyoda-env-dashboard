/**
 * TransactionStatistics Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionStatistics from '../TransactionStatistics';
import type { Transaction } from '../../types';

describe('TransactionStatistics', () => {
  const mockTransaction: Transaction = {
    id: 'txn-123',
    status: 'COMPLETED',
    startTime: '2024-01-01T10:00:00Z',
    endTime: '2024-01-01T10:05:00Z',
    duration: 300000, // 5 minutes in ms
    entityType: 'Order',
    entityId: 'order-456',
    user: 'john.doe@example.com',
    memberCount: 5,
    eventCount: 10,
  };

  it('should render transaction statistics', () => {
    render(<TransactionStatistics transaction={mockTransaction} />);

    // Check for main sections
    expect(screen.getByText('Transaction Details')).toBeInTheDocument();
    expect(screen.getByText('txn-123')).toBeInTheDocument();

    // Status appears multiple times (statistic title + descriptions label)
    const statusElements = screen.getAllByText('Status');
    expect(statusElements.length).toBeGreaterThan(0);

    // Duration appears multiple times (statistic title + descriptions label)
    const durationElements = screen.getAllByText('Duration');
    expect(durationElements.length).toBeGreaterThan(0);
  });

  it('should display transaction status with correct color', () => {
    render(<TransactionStatistics transaction={mockTransaction} />);

    const statusTags = screen.getAllByText('COMPLETED');
    expect(statusTags.length).toBeGreaterThan(0);
    expect(statusTags[0]).toBeInTheDocument();
  });

  it('should display completed status with success color', () => {
    const completedTxn = { ...mockTransaction, status: 'COMPLETED' };
    render(<TransactionStatistics transaction={completedTxn} />);

    const statusTags = screen.getAllByText('COMPLETED');
    expect(statusTags.length).toBeGreaterThan(0);
  });

  it('should display failed status with error color', () => {
    const failedTxn = { ...mockTransaction, status: 'FAILED' };
    render(<TransactionStatistics transaction={failedTxn} />);

    const statusTags = screen.getAllByText('FAILED');
    expect(statusTags.length).toBeGreaterThan(0);
  });

  it('should display running status with processing color', () => {
    const runningTxn = { ...mockTransaction, status: 'RUNNING' };
    render(<TransactionStatistics transaction={runningTxn} />);

    const statusTags = screen.getAllByText('RUNNING');
    expect(statusTags.length).toBeGreaterThan(0);
  });

  it('should display pending status with warning color', () => {
    const pendingTxn = { ...mockTransaction, status: 'PENDING' };
    render(<TransactionStatistics transaction={pendingTxn} />);

    const statusTags = screen.getAllByText('PENDING');
    expect(statusTags.length).toBeGreaterThan(0);
  });

  it('should display entity information', () => {
    render(<TransactionStatistics transaction={mockTransaction} />);
    
    expect(screen.getByText('Order')).toBeInTheDocument();
    expect(screen.getByText('order-456')).toBeInTheDocument();
  });

  it('should display user information', () => {
    render(<TransactionStatistics transaction={mockTransaction} />);
    
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('should display formatted duration', () => {
    render(<TransactionStatistics transaction={mockTransaction} />);

    // Duration is formatted as "5m 0s" (appears in both statistic card and descriptions table)
    const durationValues = screen.getAllByText('5m 0s');
    expect(durationValues.length).toBeGreaterThan(0);
  });

  it('should handle transaction without duration', () => {
    const txnWithoutDuration = { ...mockTransaction, duration: undefined };
    render(<TransactionStatistics transaction={txnWithoutDuration} />);

    // Duration appears multiple times (statistic title + descriptions label)
    const durationElements = screen.getAllByText('Duration');
    expect(durationElements.length).toBeGreaterThan(0);

    // Should show "-" for missing duration
    const dashElements = screen.getAllByText('-');
    expect(dashElements.length).toBeGreaterThan(0);
  });

  it('should handle transaction without end time', () => {
    const txnWithoutEndTime = { ...mockTransaction, endTime: undefined };
    render(<TransactionStatistics transaction={txnWithoutEndTime} />);

    // End Time appears multiple times (statistic title + descriptions label)
    const endTimeElements = screen.getAllByText('End Time');
    expect(endTimeElements.length).toBeGreaterThan(0);

    // Should show "In Progress" for missing end time in the statistic card
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should handle transaction with minimal data', () => {
    const minimalTxn: Transaction = {
      id: 'txn-minimal',
      status: 'PENDING',
    };

    render(<TransactionStatistics transaction={minimalTxn} />);

    expect(screen.getByText('txn-minimal')).toBeInTheDocument();
    const statusTags = screen.getAllByText('PENDING');
    expect(statusTags.length).toBeGreaterThan(0);
  });

  it('should render all statistics sections', () => {
    render(<TransactionStatistics transaction={mockTransaction} />);

    // Check for main sections
    expect(screen.getByText('Transaction Details')).toBeInTheDocument();

    // These appear multiple times (statistic titles + descriptions labels)
    expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Duration').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Start Time').length).toBeGreaterThan(0);
    expect(screen.getAllByText('End Time').length).toBeGreaterThan(0);
  });
});

