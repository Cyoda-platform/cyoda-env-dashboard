/**
 * Tests for ShardsDetailTabTransactions Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import ShardsDetailTabTransactions from '../ShardsDetailTabTransactions';
import type { ReactNode } from 'react';

// Mock the child components
vi.mock('../../transactions', () => ({
  TransactionsExecuting: () => <div data-testid="transactions-executing">Executing Transactions</div>,
  TransactionsView: () => <div data-testid="transactions-view">Transactions View</div>,
  TransactionsEntities: () => <div data-testid="transactions-entities">Transactions Entities</div>,
}));

describe('ShardsDetailTabTransactions', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should render the component', () => {
    const { container } = render(<ShardsDetailTabTransactions />, { wrapper });

    expect(container.querySelector('.transactions-tab')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<ShardsDetailTabTransactions />, { wrapper });
    
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('should render Clear button', () => {
    render(<ShardsDetailTabTransactions />, { wrapper });
    
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('should render all tab labels', () => {
    render(<ShardsDetailTabTransactions />, { wrapper });
    
    expect(screen.getByText('Executing transactions')).toBeInTheDocument();
    expect(screen.getByText('Transactions view')).toBeInTheDocument();
    expect(screen.getByText('Entities list view')).toBeInTheDocument();
  });

  it('should show Executing transactions tab content by default', () => {
    render(<ShardsDetailTabTransactions />, { wrapper });
    
    expect(screen.getByTestId('transactions-executing')).toBeInTheDocument();
    expect(screen.getByText('Executing Transactions')).toBeInTheDocument();
  });

  it('should switch to Transactions view tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabTransactions />, { wrapper });
    
    const tab = screen.getByText('Transactions view');
    await user.click(tab);
    
    expect(screen.getByTestId('transactions-view')).toBeInTheDocument();
    expect(screen.getByText('Transactions View')).toBeInTheDocument();
  });

  it('should switch to Entities list view tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabTransactions />, { wrapper });
    
    const tab = screen.getByText('Entities list view');
    await user.click(tab);
    
    expect(screen.getByTestId('transactions-entities')).toBeInTheDocument();
    expect(screen.getByText('Transactions Entities')).toBeInTheDocument();
  });

  it('should call handleClear when Clear button is clicked', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<ShardsDetailTabTransactions />, { wrapper });
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Clear transactions');
    consoleSpy.mockRestore();
  });

  it('should render tabs component', () => {
    const { container } = render(<ShardsDetailTabTransactions />, { wrapper });
    
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });

  it('should have three tabs', () => {
    const { container } = render(<ShardsDetailTabTransactions />, { wrapper });
    
    const tabs = container.querySelectorAll('.ant-tabs-tab');
    expect(tabs).toHaveLength(3);
  });

  it('should render Clear button with icon', () => {
    const { container } = render(<ShardsDetailTabTransactions />, { wrapper });
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toBeInTheDocument();
    expect(clearButton.querySelector('.anticon-clear')).toBeInTheDocument();
  });

  it('should render without errors', () => {
    expect(() => render(<ShardsDetailTabTransactions />, { wrapper })).not.toThrow();
  });

  it('should maintain active tab state', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabTransactions />, { wrapper });
    
    // Click second tab
    await user.click(screen.getByText('Transactions view'));
    expect(screen.getByTestId('transactions-view')).toBeInTheDocument();
    
    // Click third tab
    await user.click(screen.getByText('Entities list view'));
    expect(screen.getByTestId('transactions-entities')).toBeInTheDocument();
    
    // Click first tab
    await user.click(screen.getByText('Executing transactions'));
    expect(screen.getByTestId('transactions-executing')).toBeInTheDocument();
  });

  it('should render title and button in header', () => {
    render(<ShardsDetailTabTransactions />, { wrapper });
    
    const title = screen.getByText('Transactions');
    const button = screen.getByRole('button', { name: /clear/i });
    
    expect(title).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });
});

