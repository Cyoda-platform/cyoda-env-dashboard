/**
 * TimeStatisticsClear Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TimeStatisticsClear from '../TimeStatisticsClear';
import * as hooks from '../../../hooks';
import { useProcessingStore } from '../../../stores/processingStore';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useClearTimeStats: vi.fn(),
}));

// Mock the processing store
vi.mock('../../../stores/processingStore', () => ({
  useProcessingStore: vi.fn(),
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

describe('TimeStatisticsClear', () => {
  let queryClient: QueryClient;
  let mockMutateAsync: any;
  let mockOnReload: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockMutateAsync = vi.fn().mockResolvedValue({});
    mockOnReload = vi.fn();

    vi.mocked(hooks.useClearTimeStats).mockReturnValue({
      mutateAsync: mockMutateAsync,
      mutate: vi.fn(),
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

    vi.mocked(useProcessingStore).mockImplementation((selector: any) => {
      const state = {
        nodesProcessing: [
          { baseUrl: 'http://node1.example.com' },
          { baseUrl: 'http://node2.example.com' },
        ],
      };
      return selector ? selector(state) : state;
    });
  });

  afterEach(() => {
    cleanup();
    // Clean up any remaining modals in the DOM
    document.body.innerHTML = '';
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TimeStatisticsClear onReload={mockOnReload} {...props} />
      </QueryClientProvider>
    );
  };

  it('should render clear button', () => {
    renderComponent();
    
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('should show dropdown menu when button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Clear time stats')).toBeInTheDocument();
      expect(screen.getByText('Clear time stats (ALL nodes)')).toBeInTheDocument();
    });
  });

  it('should show confirmation modal when "Clear time stats" is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Clear time stats')).toBeInTheDocument();
    });
    
    const clearOption = screen.getByText('Clear time stats');
    await user.click(clearOption);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Clear time stats. Continue?')).toBeInTheDocument();
    });
  });

  it('should call clearTimeStats when OK is clicked in confirmation modal', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Clear time stats')).toBeInTheDocument();
    });
    
    const clearOption = screen.getByText('Clear time stats');
    await user.click(clearOption);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const okButtons = screen.getAllByRole('button', { name: /ok/i });
    await user.click(okButtons[okButtons.length - 1]);
    
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  it('should call onReload after successful clear', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Clear time stats')).toBeInTheDocument();
    });
    
    const clearOption = screen.getByText('Clear time stats');
    await user.click(clearOption);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const okButtons = screen.getAllByRole('button', { name: /ok/i });
    await user.click(okButtons[okButtons.length - 1]);

    await waitFor(() => {
      expect(mockOnReload).toHaveBeenCalled();
    });
  });

  it('should show info message when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const { message } = await import('antd');
    renderComponent();

    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Clear time stats')).toBeInTheDocument();
    });

    const clearOption = screen.getByText('Clear time stats');
    await user.click(clearOption);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    await user.click(cancelButtons[cancelButtons.length - 1]);
    
    await waitFor(() => {
      expect(message.info).toHaveBeenCalledWith('Clear time stats canceled');
    });
  });

  it('should show confirmation modal when "Clear time stats (ALL nodes)" is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Clear time stats (ALL nodes)')).toBeInTheDocument();
    });
    
    const clearAllOption = screen.getByText('Clear time stats (ALL nodes)');
    await user.click(clearAllOption);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Clear timestats request send to all nodes. Continue?')).toBeInTheDocument();
    });
  });

  it('should call clearTimeStats for all nodes when OK is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Clear time stats (ALL nodes)')).toBeInTheDocument();
    });

    const clearAllOption = screen.getByText('Clear time stats (ALL nodes)');
    await user.click(clearAllOption);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const okButtons = screen.getAllByRole('button', { name: /ok/i });
    await user.click(okButtons[okButtons.length - 1]);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
      expect(mockMutateAsync).toHaveBeenCalledWith('http://node1.example.com');
      expect(mockMutateAsync).toHaveBeenCalledWith('http://node2.example.com');
    });
  });

  it('should call onReload after successful clear all', async () => {
    const user = userEvent.setup();
    renderComponent();

    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Clear time stats (ALL nodes)')).toBeInTheDocument();
    });

    const clearAllOption = screen.getByText('Clear time stats (ALL nodes)');
    await user.click(clearAllOption);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const okButtons = screen.getAllByRole('button', { name: /ok/i });
    await user.click(okButtons[okButtons.length - 1]);
    
    await waitFor(() => {
      expect(mockOnReload).toHaveBeenCalled();
    });
  });

  it('should handle errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockMutateAsync.mockRejectedValueOnce(new Error('Clear failed'));
    
    renderComponent();
    
    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Clear time stats')).toBeInTheDocument();
    });
    
    const clearOption = screen.getByText('Clear time stats');
    await user.click(clearOption);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const okButtons = screen.getAllByRole('button', { name: /ok/i });
    await user.click(okButtons[okButtons.length - 1]);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should work without onReload callback', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <TimeStatisticsClear />
      </QueryClientProvider>
    );

    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Clear time stats')).toBeInTheDocument();
    });

    const clearOption = screen.getByText('Clear time stats');
    await user.click(clearOption);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const okButtons = screen.getAllByRole('button', { name: /ok/i });
    await user.click(okButtons[okButtons.length - 1]);
    
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });
});

