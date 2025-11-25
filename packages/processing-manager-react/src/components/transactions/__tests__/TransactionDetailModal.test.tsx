/**
 * Transaction Detail Modal Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TransactionDetailModal from '../TransactionDetailModal';

// Mock the transition detail components
vi.mock('../../transition-detail', () => ({
  TransitionDetailStatistics: ({ transactionIdProp }: { transactionIdProp?: string }) => (
    <div data-testid="transaction-statistics">Statistics for {transactionIdProp}</div>
  ),
  TransitionDetailStatisticsTransactionMembers: ({ transactionIdProp }: { transactionIdProp?: string }) => (
    <div data-testid="transaction-members">Members for {transactionIdProp}</div>
  ),
  TransitionDetailStatisticsTransactionEvents: ({ transactionIdProp }: { transactionIdProp?: string }) => (
    <div data-testid="transaction-events">Events for {transactionIdProp}</div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TransactionDetailModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render modal when visible is true', () => {
    renderWithRouter(
      <TransactionDetailModal
        transactionId="test-transaction-123"
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Transaction test-transaction-123/i)).toBeInTheDocument();
  });

  it('should not render when transactionId is null', () => {
    const { container } = renderWithRouter(
      <TransactionDetailModal
        transactionId={null}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render all three tabs', () => {
    renderWithRouter(
      <TransactionDetailModal
        transactionId="test-transaction-123"
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Transaction main statistics')).toBeInTheDocument();
    expect(screen.getByText('Transaction members')).toBeInTheDocument();
    expect(screen.getByText('Transaction events')).toBeInTheDocument();
  });

  it('should pass transactionId to child components', () => {
    renderWithRouter(
      <TransactionDetailModal
        transactionId="test-transaction-456"
        visible={true}
        onClose={mockOnClose}
      />
    );

    // The statistics tab is active by default
    expect(screen.getByTestId('transaction-statistics')).toBeInTheDocument();
    expect(screen.getByText('Statistics for test-transaction-456')).toBeInTheDocument();
  });

  it('should have correct modal class', () => {
    renderWithRouter(
      <TransactionDetailModal
        transactionId="test-transaction-123"
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Modal is rendered in a portal, so we need to check document.body
    const modal = document.body.querySelector('.transaction-detail-modal');
    expect(modal).toBeInTheDocument();
  });

  it('should render without footer', () => {
    renderWithRouter(
      <TransactionDetailModal
        transactionId="test-transaction-123"
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Modal with footer={null} should not have footer
    const footer = document.body.querySelector('.ant-modal-footer');
    expect(footer).not.toBeInTheDocument();
  });

  it('should render modal in document body', () => {
    renderWithRouter(
      <TransactionDetailModal
        transactionId="test-transaction-123"
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Modal is rendered in a portal attached to document.body
    const modal = document.body.querySelector('.ant-modal');
    expect(modal).toBeInTheDocument();
  });
});

