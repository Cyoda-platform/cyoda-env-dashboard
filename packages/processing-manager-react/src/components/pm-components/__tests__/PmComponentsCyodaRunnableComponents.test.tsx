/**
 * Tests for PmComponentsCyodaRunnableComponents Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PmComponentsCyodaRunnableComponents } from '../PmComponentsCyodaRunnableComponents';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useLoadRunnableComponents: vi.fn(),
  useStartRunnableComponent: vi.fn(),
  useStopRunnableComponent: vi.fn(),
}));

const mockRefetch = vi.fn();
const mockStartComponent = vi.fn();
const mockStopComponent = vi.fn();

const mockData = [
  { id: '1', name: 'Component 1', running: true },
  { id: '2', name: 'Component 2', running: false },
];

describe('PmComponentsCyodaRunnableComponents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(hooks.useLoadRunnableComponents).mockReturnValue({
      data: mockData,
      refetch: mockRefetch,
    } as any);

    vi.mocked(hooks.useStartRunnableComponent).mockReturnValue({
      mutateAsync: mockStartComponent,
    } as any);

    vi.mocked(hooks.useStopRunnableComponent).mockReturnValue({
      mutateAsync: mockStopComponent,
    } as any);

    mockStartComponent.mockResolvedValue({});
    mockStopComponent.mockResolvedValue({});
    mockRefetch.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should render table columns', () => {
    render(<PmComponentsCyodaRunnableComponents />);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Operations')).toBeInTheDocument();
  });

  it('should have 2 columns', () => {
    render(<PmComponentsCyodaRunnableComponents />);
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBe(2);
  });

  it('should render component names', async () => {
    render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      expect(screen.getByText('Component 1')).toBeInTheDocument();
      expect(screen.getByText('Component 2')).toBeInTheDocument();
    });
  });

  it('should render running icon for running component', async () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      const runningIcon = container.querySelector('.icon-running');
      expect(runningIcon).toBeInTheDocument();
    });
  });

  it('should render stop icon for stopped component', async () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      const stopIcon = container.querySelector('.icon-stop');
      expect(stopIcon).toBeInTheDocument();
    });
  });

  it('should render operation buttons', async () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      const buttons = container.querySelectorAll('.operations-buttons button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('should have start button', async () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      const playIcon = container.querySelector('.anticon-play-circle');
      expect(playIcon).toBeInTheDocument();
    });
  });

  it('should have stop button', async () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      const stopIcons = container.querySelectorAll('.anticon-stop');
      expect(stopIcons.length).toBeGreaterThan(0);
    });
  });

  it('should have reload button', async () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      const syncIcon = container.querySelector('.anticon-sync');
      expect(syncIcon).toBeInTheDocument();
    });
  });

  it('should disable start button for running component', async () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      const rows = container.querySelectorAll('.ant-table-tbody tr');
      const firstRow = rows[0];
      const startButton = firstRow.querySelector('.ant-btn-primary');
      expect(startButton).toHaveAttribute('disabled');
    });
  });

  it('should enable start button for stopped component', async () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      const rows = container.querySelectorAll('.ant-table-tbody tr');
      const secondRow = rows[1];
      const startButton = secondRow.querySelector('.ant-btn-primary');
      expect(startButton).not.toHaveAttribute('disabled');
    });
  });

  it('should disable stop button for stopped component', async () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      const rows = container.querySelectorAll('.ant-table-tbody tr');
      const secondRow = rows[1];
      const stopButton = secondRow.querySelector('.ant-btn-dangerous');
      expect(stopButton).toHaveAttribute('disabled');
    });
  });

  it('should call startComponent on start button click', async () => {
    const user = userEvent.setup();
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      expect(screen.getByText('Component 2')).toBeInTheDocument();
    });

    const rows = container.querySelectorAll('.ant-table-tbody tr');
    const secondRow = rows[1];
    const startButton = secondRow.querySelector('.ant-btn-primary') as HTMLElement;
    
    await user.click(startButton);
    
    await waitFor(() => {
      expect(mockStartComponent).toHaveBeenCalledWith({ id: '2' });
    });
  });

  it('should call stopComponent on stop button click', async () => {
    const user = userEvent.setup();
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      expect(screen.getByText('Component 1')).toBeInTheDocument();
    });

    const rows = container.querySelectorAll('.ant-table-tbody tr');
    const firstRow = rows[0];
    const stopButton = firstRow.querySelector('.ant-btn-dangerous') as HTMLElement;
    
    await user.click(stopButton);
    
    await waitFor(() => {
      expect(mockStopComponent).toHaveBeenCalledWith({ id: '1' });
    });
  });

  it('should call refetch after start', async () => {
    const user = userEvent.setup();
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      expect(screen.getByText('Component 2')).toBeInTheDocument();
    });

    const rows = container.querySelectorAll('.ant-table-tbody tr');
    const secondRow = rows[1];
    const startButton = secondRow.querySelector('.ant-btn-primary') as HTMLElement;
    
    await user.click(startButton);
    
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should call refetch after stop', async () => {
    const user = userEvent.setup();
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      expect(screen.getByText('Component 1')).toBeInTheDocument();
    });

    const rows = container.querySelectorAll('.ant-table-tbody tr');
    const firstRow = rows[0];
    const stopButton = firstRow.querySelector('.ant-btn-dangerous') as HTMLElement;
    
    await user.click(stopButton);
    
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should have bordered table', () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    const table = container.querySelector('.ant-table-bordered');
    expect(table).toBeInTheDocument();
  });

  it('should have pagination', () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should render correct number of rows', async () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
      expect(rows.length).toBe(2);
    });
  });

  it('should handle empty data', () => {
    vi.mocked(hooks.useLoadRunnableComponents).mockReturnValue({
      data: null,
      refetch: mockRefetch,
    } as any);

    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(0);
  });

  it('should use id as row key', async () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
      expect(rows.length).toBe(2);
    });
  });

  it('should have circle shape buttons', async () => {
    const { container } = render(<PmComponentsCyodaRunnableComponents />);
    
    await waitFor(() => {
      const circleButtons = container.querySelectorAll('.ant-btn-circle');
      expect(circleButtons.length).toBeGreaterThan(0);
    });
  });
});

