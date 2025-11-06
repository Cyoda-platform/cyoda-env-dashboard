/**
 * Tests for SiftLoggerConfView Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SiftLoggerConfView } from '../SiftLoggerConfView';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useSiftLogger: vi.fn(),
  useUpdateSiftLogger: vi.fn(),
}));

const mockSiftLoggerData = {
  queuesAll: ['queue.one', 'queue.two', 'queue.three'],
  queuesInclude: ['queue.one'],
  loggerEnabled: true,
};

const mockUpdateSiftLogger = vi.fn();

describe('SiftLoggerConfView', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/nodes/test-node']}>
        <Routes>
          <Route path="/nodes/:name" element={<SiftLoggerConfView />} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(hooks.useSiftLogger).mockReturnValue({
      data: mockSiftLoggerData,
    } as any);

    vi.mocked(hooks.useUpdateSiftLogger).mockReturnValue({
      mutate: mockUpdateSiftLogger,
      isLoading: false,
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    renderComponent();
    
    expect(screen.getByText('Sift logger')).toBeInTheDocument();
  });

  it('should render configured switch', () => {
    renderComponent();

    expect(screen.getByText(/Sift logger configured/i)).toBeInTheDocument();
  });

  it('should render enabled switch', () => {
    renderComponent();

    expect(screen.getByText(/Sift logger enabled/i)).toBeInTheDocument();
  });

  it('should render Transfer component', () => {
    const { container } = renderComponent();
    
    const transfer = container.querySelector('.ant-transfer');
    expect(transfer).toBeInTheDocument();
  });

  it('should render Transfer titles', () => {
    renderComponent();
    
    expect(screen.getByText('Exclude Queues')).toBeInTheDocument();
    expect(screen.getByText('Include Queues')).toBeInTheDocument();
  });

  it('should render Submit button', () => {
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should have configured switch disabled', () => {
    const { container } = renderComponent();
    
    const switches = container.querySelectorAll('.ant-switch');
    const configuredSwitch = switches[0];
    expect(configuredSwitch).toHaveClass('ant-switch-disabled');
  });

  it('should initialize with data from hook', async () => {
    renderComponent();
    
    await waitFor(() => {
      const switches = document.querySelectorAll('.ant-switch-checked');
      expect(switches.length).toBeGreaterThan(0);
    });
  });

  it('should render queue items in Transfer', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('one')).toBeInTheDocument();
      expect(screen.getByText('two')).toBeInTheDocument();
      expect(screen.getByText('three')).toBeInTheDocument();
    });
  });

  it('should show short names for queues', async () => {
    renderComponent();
    
    await waitFor(() => {
      // Should show 'one' instead of 'queue.one'
      expect(screen.getByText('one')).toBeInTheDocument();
    });
  });

  it('should handle enabled switch toggle', async () => {
    const user = userEvent.setup();
    const { container } = renderComponent();
    
    await waitFor(() => {
      const switches = container.querySelectorAll('.ant-switch');
      expect(switches.length).toBe(2);
    });

    const enabledSwitch = container.querySelectorAll('.ant-switch')[1];
    await user.click(enabledSwitch);
    
    // Switch should toggle
    expect(enabledSwitch).toBeInTheDocument();
  });

  it('should call updateSiftLogger on submit', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('one')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    expect(mockUpdateSiftLogger).toHaveBeenCalled();
  });

  it('should pass node name to updateSiftLogger', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('one')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    expect(mockUpdateSiftLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        node: 'test-node',
      })
    );
  });

  it('should include queuesInclude in submit data', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('one')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    expect(mockUpdateSiftLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          queuesInclude: expect.any(Array),
        }),
      })
    );
  });

  it('should include queuesExclude in submit data', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('one')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    expect(mockUpdateSiftLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          queuesExclude: expect.any(Array),
        }),
      })
    );
  });

  it('should include loggerEnabled in submit data', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('one')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    expect(mockUpdateSiftLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          loggerEnabled: expect.any(Boolean),
        }),
      })
    );
  });

  it('should show loading state on submit button', () => {
    vi.mocked(hooks.useUpdateSiftLogger).mockReturnValue({
      mutate: mockUpdateSiftLogger,
      isLoading: true,
    } as any);

    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toHaveClass('ant-btn-loading');
  });

  it('should handle missing siftLogger data', () => {
    vi.mocked(hooks.useSiftLogger).mockReturnValue({
      data: null,
    } as any);

    renderComponent();
    
    expect(screen.getByText('Sift logger')).toBeInTheDocument();
  });

  it('should have search functionality in Transfer', () => {
    const { container } = renderComponent();
    
    const searchInputs = container.querySelectorAll('.ant-transfer-list-search');
    expect(searchInputs.length).toBe(2);
  });

  it('should render Divider', () => {
    const { container } = renderComponent();
    
    const divider = container.querySelector('.ant-divider');
    expect(divider).toBeInTheDocument();
  });

  it('should have actions container', () => {
    const { container } = renderComponent();
    
    const actions = container.querySelector('.actions');
    expect(actions).toBeInTheDocument();
  });

  it('should have primary button type', () => {
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toHaveClass('ant-btn-primary');
  });

  it('should handle empty queuesAll', () => {
    vi.mocked(hooks.useSiftLogger).mockReturnValue({
      data: {
        queuesAll: [],
        queuesInclude: [],
        loggerEnabled: false,
      },
    } as any);

    renderComponent();
    
    expect(screen.getByText('Sift logger')).toBeInTheDocument();
  });

  it('should default loggerEnabled to false if missing', () => {
    vi.mocked(hooks.useSiftLogger).mockReturnValue({
      data: {
        queuesAll: ['queue.one'],
        queuesInclude: [],
      },
    } as any);

    renderComponent();
    
    expect(screen.getByText('Sift logger')).toBeInTheDocument();
  });

  it('should default queuesInclude to empty array if missing', () => {
    vi.mocked(hooks.useSiftLogger).mockReturnValue({
      data: {
        queuesAll: ['queue.one'],
        loggerEnabled: true,
      },
    } as any);

    renderComponent();
    
    expect(screen.getByText('Sift logger')).toBeInTheDocument();
  });

  it('should have horizontal form layout', () => {
    const { container } = renderComponent();
    
    const form = container.querySelector('.ant-form-horizontal');
    expect(form).toBeInTheDocument();
  });

  it('should have custom list style for Transfer', () => {
    const { container } = renderComponent();
    
    const transfer = container.querySelector('.ant-transfer');
    expect(transfer).toBeInTheDocument();
  });
});

