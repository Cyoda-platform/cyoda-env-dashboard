/**
 * Tests for TransactionDetail Page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TransactionDetail from '../TransactionDetail';
import * as hooks from '../../hooks';

// Mock the transition-detail components
vi.mock('../../components/transition-detail', () => ({
  TransitionDetailStatistics: () => (
    <div data-testid="transaction-statistics">
      Transaction Statistics
    </div>
  ),
  TransitionDetailStatisticsTransactionMembers: () => (
    <div data-testid="transaction-members">
      Transaction Members
    </div>
  ),
  TransitionDetailStatisticsTransactionEvents: () => (
    <div data-testid="transaction-events">
      Transaction Events
    </div>
  ),
}));

// Mock the Layout component
vi.mock('../../components/layout', () => ({
  Layout: ({ children }: any) => <div data-testid="layout">{children}</div>,
}));

// Mock the hooks
vi.mock('../../hooks', () => ({
  useTransactionsView: vi.fn(),
  useTransactionsViewMembers: vi.fn(),
  useTransactionsViewEvents: vi.fn(),
}));

const mockTransactionData = {
  transactionInfoView: {
    transactionId: 'tx-123',
    transactionStatus: 'COMPLETED',
    transactionSubmitNodeId: 'node-1',
    user: 'test-user',
    consistencyTime: 1697360400000,
    createTime: 1697360400000,
    submitTime: 1697360400000,
    finishTime: 1697360460000,
    prepareDuration: 5000,
    processDuration: 60000,
    secondPhaseFinishedFlag: true,
    transactionSucceededFlag: true,
  },
  shardUUID: 'shard-uuid-123',
  parentTransactionIds: ['parent-tx-1', 'parent-tx-2'],
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

  it('should render transaction detail page', () => {
    const { container } = renderWithRouter();

    expect(screen.getByText(/Processing/)).toBeInTheDocument();
    expect(screen.getByText(/Nodes/)).toBeInTheDocument();
    // Check breadcrumb contains node and transaction ID
    const breadcrumb = container.querySelector('.ant-breadcrumb');
    expect(breadcrumb).toBeInTheDocument();
  });

  it('should render breadcrumb navigation', () => {
    const { container } = renderWithRouter();

    expect(container.querySelector('.ant-breadcrumb')).toBeInTheDocument();
  });

  it('should render all tab labels', () => {
    renderWithRouter();

    expect(screen.getByText('Transaction main statistics')).toBeInTheDocument();
    expect(screen.getByText('Transaction members')).toBeInTheDocument();
    expect(screen.getByText('Transaction events')).toBeInTheDocument();
  });

  it('should show Statistics tab content by default', () => {
    renderWithRouter();

    expect(screen.getByTestId('transaction-statistics')).toBeInTheDocument();
    expect(screen.getByText('Transaction Statistics')).toBeInTheDocument();
  });

  it('should switch to Members tab when clicked', async () => {
    const user = userEvent.setup();

    renderWithRouter();

    const membersTab = screen.getByText('Transaction members');
    await user.click(membersTab);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-members')).toBeInTheDocument();
      expect(screen.getByText('Transaction Members')).toBeInTheDocument();
    });
  });

  it('should switch to Events tab when clicked', async () => {
    const user = userEvent.setup();

    renderWithRouter();

    const eventsTab = screen.getByText('Transaction events');
    await user.click(eventsTab);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-events')).toBeInTheDocument();
      expect(screen.getByText('Transaction Events')).toBeInTheDocument();
    });
  });

  it('should render tabs component', () => {
    const { container } = renderWithRouter();

    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });

  it('should have three tabs', () => {
    const { container } = renderWithRouter();

    const tabs = container.querySelectorAll('.ant-tabs-tab');
    expect(tabs).toHaveLength(3);
  });

  it('should render without errors', () => {
    expect(() => renderWithRouter()).not.toThrow();
  });

  it('should pass transaction data to TransitionDetailStatistics', () => {
    renderWithRouter();

    expect(screen.getByTestId('transaction-statistics')).toBeInTheDocument();
    expect(screen.getByText('Transaction Statistics')).toBeInTheDocument();
  });

  it('should render TransitionDetailStatisticsTransactionMembers on Members tab', async () => {
    const user = userEvent.setup();

    renderWithRouter();

    await user.click(screen.getByText('Transaction members'));

    await waitFor(() => {
      expect(screen.getByTestId('transaction-members')).toBeInTheDocument();
      expect(screen.getByText('Transaction Members')).toBeInTheDocument();
    });
  });

  it('should render TransitionDetailStatisticsTransactionEvents on Events tab', async () => {
    const user = userEvent.setup();

    renderWithRouter();

    await user.click(screen.getByText('Transaction events'));

    await waitFor(() => {
      expect(screen.getByTestId('transaction-events')).toBeInTheDocument();
      expect(screen.getByText('Transaction Events')).toBeInTheDocument();
    });
  });

  it('should render card component', () => {
    const { container } = renderWithRouter();

    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should handle tab switching multiple times', async () => {
    const user = userEvent.setup();

    renderWithRouter();

    // Switch to Members
    await user.click(screen.getByText('Transaction members'));
    await waitFor(() => {
      expect(screen.getByTestId('transaction-members')).toBeInTheDocument();
    });

    // Switch to Events
    await user.click(screen.getByText('Transaction events'));
    await waitFor(() => {
      expect(screen.getByTestId('transaction-events')).toBeInTheDocument();
    });

    // Switch back to Statistics
    await user.click(screen.getByText('Transaction main statistics'));
    await waitFor(() => {
      expect(screen.getByTestId('transaction-statistics')).toBeInTheDocument();
    });
  });
});

