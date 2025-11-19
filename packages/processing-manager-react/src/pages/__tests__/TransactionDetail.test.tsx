/**
 * Tests for TransactionDetail Page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TransactionDetail from '../TransactionDetail';
import * as hooks from '../../hooks';

// Mock the child components
vi.mock('../../components', () => ({
  TransactionStatistics: ({ transaction }: any) => (
    <div data-testid="transaction-statistics">
      Transaction Statistics: {transaction.id}
    </div>
  ),
  TransactionMembersTable: ({ transactionId }: any) => (
    <div data-testid="transaction-members">
      Members Table: {transactionId}
    </div>
  ),
  TransactionEventsTable: ({ transactionId }: any) => (
    <div data-testid="transaction-events">
      Events Table: {transactionId}
    </div>
  ),
}));

// Mock the Layout component
vi.mock('../../components/layout', () => ({
  Layout: ({ children }: any) => <div data-testid="layout">{children}</div>,
}));

// Mock the hooks
vi.mock('../../hooks', () => ({
  useTransaction: vi.fn(),
}));

const mockTransaction = {
  id: 'tx-123',
  status: 'COMPLETED',
  entityId: 'entity-456',
  entityType: 'TestEntity',
  startTime: '2025-10-15T10:00:00Z',
  endTime: '2025-10-15T10:05:00Z',
  duration: 300000,
  user: 'test-user',
};

const renderWithRouter = (initialPath = '/processing-ui/nodes/test-node/transactions/tx-123') => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/processing-ui/nodes/:name/transactions/:transactionId" element={<TransactionDetail />} />
      </Routes>
    </BrowserRouter>,
    {
      wrapper: ({ children }) => {
        window.history.pushState({}, '', initialPath);
        return <>{children}</>;
      },
    }
  );
};

describe('TransactionDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    (hooks.useTransaction as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = renderWithRouter();

    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('should render error state when error occurs', () => {
    (hooks.useTransaction as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: 'Failed to fetch',
    });

    renderWithRouter();

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load transaction details')).toBeInTheDocument();
  });

  it('should render error state when no transaction data', () => {
    (hooks.useTransaction as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    renderWithRouter();

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load transaction details')).toBeInTheDocument();
  });

  it('should render transaction detail with data', () => {
    (hooks.useTransaction as any).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    });

    const { container } = renderWithRouter();

    expect(screen.getByText('Transaction Detail')).toBeInTheDocument();
    expect(screen.getByText(/Node:/)).toBeInTheDocument();
    // Check for text content in the paragraph
    const paragraph = container.querySelector('p');
    expect(paragraph).toHaveTextContent('Node: test-node');
    expect(paragraph).toHaveTextContent('Transaction ID: tx-123');
  });

  it('should render breadcrumb navigation', () => {
    (hooks.useTransaction as any).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    });

    const { container } = renderWithRouter();

    expect(container.querySelector('.ant-breadcrumb')).toBeInTheDocument();
  });

  it('should render all tab labels', () => {
    (hooks.useTransaction as any).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    });

    renderWithRouter();

    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  it('should show Statistics tab content by default', () => {
    (hooks.useTransaction as any).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    });

    renderWithRouter();

    expect(screen.getByTestId('transaction-statistics')).toBeInTheDocument();
    expect(screen.getByText('Transaction Statistics: tx-123')).toBeInTheDocument();
  });

  it('should switch to Members tab when clicked', async () => {
    const user = userEvent.setup();
    (hooks.useTransaction as any).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    });

    renderWithRouter();

    const membersTab = screen.getByText('Members');
    await user.click(membersTab);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-members')).toBeInTheDocument();
      expect(screen.getByText('Members Table: tx-123')).toBeInTheDocument();
    });
  });

  it('should switch to Events tab when clicked', async () => {
    const user = userEvent.setup();
    (hooks.useTransaction as any).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    });

    renderWithRouter();

    const eventsTab = screen.getByText('Events');
    await user.click(eventsTab);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-events')).toBeInTheDocument();
      expect(screen.getByText('Events Table: tx-123')).toBeInTheDocument();
    });
  });

  it('should render tabs component', () => {
    (hooks.useTransaction as any).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    });

    const { container } = renderWithRouter();

    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });

  it('should have three tabs', () => {
    (hooks.useTransaction as any).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    });

    const { container } = renderWithRouter();

    const tabs = container.querySelectorAll('.ant-tabs-tab');
    expect(tabs).toHaveLength(3);
  });

  it('should render without errors', () => {
    (hooks.useTransaction as any).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    });

    expect(() => renderWithRouter()).not.toThrow();
  });

  it('should pass transaction to TransactionStatistics', () => {
    (hooks.useTransaction as any).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    });

    renderWithRouter();

    expect(screen.getByText('Transaction Statistics: tx-123')).toBeInTheDocument();
  });

  it('should pass transactionId to TransactionMembersTable', async () => {
    const user = userEvent.setup();
    (hooks.useTransaction as any).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    });

    renderWithRouter();

    await user.click(screen.getByText('Members'));

    await waitFor(() => {
      expect(screen.getByText('Members Table: tx-123')).toBeInTheDocument();
    });
  });

  it('should pass transactionId to TransactionEventsTable', async () => {
    const user = userEvent.setup();
    (hooks.useTransaction as any).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    });

    renderWithRouter();

    await user.click(screen.getByText('Events'));

    await waitFor(() => {
      expect(screen.getByText('Events Table: tx-123')).toBeInTheDocument();
    });
  });

  it('should render card component', () => {
    (hooks.useTransaction as any).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    });

    const { container } = renderWithRouter();

    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should render loading spinner', () => {
    (hooks.useTransaction as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = renderWithRouter();

    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
    expect(container.querySelector('.ant-spin-lg')).toBeInTheDocument();
  });

  it('should render alert with error icon', () => {
    (hooks.useTransaction as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: 'Failed to fetch',
    });

    const { container } = renderWithRouter();

    expect(container.querySelector('.ant-alert-error')).toBeInTheDocument();
  });
});

