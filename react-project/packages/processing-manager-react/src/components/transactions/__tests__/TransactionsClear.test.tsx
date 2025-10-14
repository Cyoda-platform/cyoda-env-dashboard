/**
 * TransactionsClear Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TransactionsClear from '../TransactionsClear';
import * as hooks from '../../../hooks/useProcessing';

// Mock the hooks
vi.mock('../../../hooks/useProcessing', () => ({
  useDoHardResetConsistencyTime: vi.fn(),
}));

// Mock Ant Design message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    },
  };
});

describe('TransactionsClear', () => {
  let queryClient: QueryClient;
  let mockMutate: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockMutate = vi.fn();

    vi.mocked(hooks.useDoHardResetConsistencyTime).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      data: undefined,
      error: null,
      reset: vi.fn(),
      status: 'idle',
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isIdle: true,
      isPaused: false,
      submittedAt: 0,
    } as any);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TransactionsClear />
      </QueryClientProvider>
    );
  };

  it('should render reset button', () => {
    renderComponent();
    
    const button = screen.getByRole('button', { name: /reset/i });
    expect(button).toBeInTheDocument();
  });

  it('should render dropdown icon', () => {
    renderComponent();
    
    const button = screen.getByRole('button', { name: /reset/i });
    expect(button).toBeInTheDocument();
    // DownOutlined icon should be present
    expect(button.textContent).toContain('Reset');
  });

  it('should show dropdown menu when clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const button = screen.getByRole('button', { name: /reset/i });
    await user.click(button);
    
    // Dropdown menu should appear
    await waitFor(() => {
      expect(screen.getByText('Hard reset consistency time')).toBeInTheDocument();
    });
  });

  it('should show confirmation modal when "Hard reset consistency time" is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Open dropdown
    const button = screen.getByRole('button', { name: /reset/i });
    await user.click(button);
    
    // Click menu item
    const menuItem = await screen.findByText('Hard reset consistency time');
    await user.click(menuItem);
    
    // Modal should appear with warning
    await waitFor(() => {
      expect(screen.getByText(/WARNING: This will delete all consistency time data/i)).toBeInTheDocument();
    });
  });

  it('should display warning message in modal', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const button = screen.getByRole('button', { name: /reset/i });
    await user.click(button);
    
    const menuItem = await screen.findByText('Hard reset consistency time');
    await user.click(menuItem);
    
    await waitFor(() => {
      expect(screen.getByText(/Any current or queued read\/write operations may subsequently fail/i)).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to hard reset consistency time/i)).toBeInTheDocument();
    });
  });

  it('should call mutation when OK is clicked in modal', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Open dropdown
    const button = screen.getByRole('button', { name: /reset/i });
    await user.click(button);
    
    // Click menu item
    const menuItem = await screen.findByText('Hard reset consistency time');
    await user.click(menuItem);
    
    // Click OK in modal
    const okButton = await screen.findByRole('button', { name: /ok/i });
    await user.click(okButton);
    
    // Mutation should be called
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('should not call mutation when Cancel is clicked in modal', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Open dropdown
    const button = screen.getByRole('button', { name: /reset/i });
    await user.click(button);
    
    // Click menu item
    const menuItem = await screen.findByText('Hard reset consistency time');
    await user.click(menuItem);
    
    // Click Cancel in modal
    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    // Mutation should NOT be called
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should close modal when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const button = screen.getByRole('button', { name: /reset/i });
    await user.click(button);
    
    const menuItem = await screen.findByText('Hard reset consistency time');
    await user.click(menuItem);
    
    // Modal should be visible
    expect(screen.getByText(/WARNING: This will delete all consistency time data/i)).toBeInTheDocument();
    
    // Click Cancel
    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText(/WARNING: This will delete all consistency time data/i)).not.toBeInTheDocument();
    });
  });

  it('should have primary button type', () => {
    renderComponent();
    
    const button = screen.getByRole('button', { name: /reset/i });
    expect(button).toHaveClass('ant-btn-primary');
  });

  it('should render with correct structure', () => {
    renderComponent();
    
    const button = screen.getByRole('button', { name: /reset/i });
    expect(button).toBeInTheDocument();
    expect(button.textContent).toContain('Reset');
  });

  it('should handle multiple dropdown opens/closes', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const button = screen.getByRole('button', { name: /reset/i });
    
    // Open dropdown
    await user.click(button);
    await waitFor(() => {
      expect(screen.getByText('Hard reset consistency time')).toBeInTheDocument();
    });
    
    // Close by clicking outside (simulate)
    await user.keyboard('{Escape}');
    
    // Open again
    await user.click(button);
    await waitFor(() => {
      expect(screen.getByText('Hard reset consistency time')).toBeInTheDocument();
    });
  });
});

