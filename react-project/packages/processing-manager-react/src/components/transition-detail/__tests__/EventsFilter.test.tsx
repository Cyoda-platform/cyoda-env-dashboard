/**
 * Tests for EventsFilter Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventsFilter } from '../EventsFilter';
import * as hooks from '../../../hooks';
import { createRef } from 'react';
import type { EventsFilterRef } from '../EventsFilter';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useEntitiesListPossible: vi.fn(),
  useTransactionEventStatusesList: vi.fn(),
  useProcessingQueues: vi.fn(),
}));

describe('EventsFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock returns
    vi.mocked(hooks.useEntitiesListPossible).mockReturnValue({
      data: ['EntityClass1', 'EntityClass2', 'EntityClass3'],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(hooks.useTransactionEventStatusesList).mockReturnValue({
      data: ['PENDING', 'COMPLETED', 'FAILED'],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(hooks.useProcessingQueues).mockReturnValue({
      data: ['queue-1', 'queue-2', 'queue-3'],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);
  });

  it('should render the component', () => {
    render(<EventsFilter onChange={mockOnChange} />);
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    render(<EventsFilter onChange={mockOnChange} />);
    
    expect(screen.getByText('Queue')).toBeInTheDocument();
    expect(screen.getByText('Entity class')).toBeInTheDocument();
    expect(screen.getByText('Transaction Status')).toBeInTheDocument();
    expect(screen.getByText('Has error')).toBeInTheDocument();
    expect(screen.getByText('Sort')).toBeInTheDocument();
  });

  it('should render Load button', () => {
    render(<EventsFilter onChange={mockOnChange} />);
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).toBeInTheDocument();
  });

  it('should call onChange when Load button is clicked', async () => {
    const user = userEvent.setup();
    render(<EventsFilter onChange={mockOnChange} />);
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        queue: '',
        status: '',
        entityClass: '',
        hasErrors: false,
        sort: 'ASC',
      });
    });
  });

  it('should render queue select with options', async () => {
    const user = userEvent.setup();
    render(<EventsFilter onChange={mockOnChange} />);

    const queueSelects = screen.getAllByRole('combobox');
    await user.click(queueSelects[0]);

    // Verify queue options are rendered
    await waitFor(() => {
      expect(screen.getAllByText('queue-1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('queue-2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('queue-3').length).toBeGreaterThan(0);
    });
  });

  it('should render entity class select with options', async () => {
    const user = userEvent.setup();
    render(<EventsFilter onChange={mockOnChange} />);

    const selects = screen.getAllByRole('combobox');
    await user.click(selects[1]);

    // Verify entity class options are rendered
    await waitFor(() => {
      expect(screen.getAllByText('EntityClass1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('EntityClass2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('EntityClass3').length).toBeGreaterThan(0);
    });
  });

  it('should render transaction status select with options', async () => {
    const user = userEvent.setup();
    render(<EventsFilter onChange={mockOnChange} />);

    const selects = screen.getAllByRole('combobox');
    await user.click(selects[2]);

    // Verify status options are rendered
    await waitFor(() => {
      expect(screen.getAllByText('PENDING').length).toBeGreaterThan(0);
      expect(screen.getAllByText('COMPLETED').length).toBeGreaterThan(0);
      expect(screen.getAllByText('FAILED').length).toBeGreaterThan(0);
    });
  });

  it('should update has error field', async () => {
    const user = userEvent.setup();
    render(<EventsFilter onChange={mockOnChange} />);
    
    const selects = screen.getAllByRole('combobox');
    await user.click(selects[3]);
    
    const trueOption = await screen.findByText('True');
    await user.click(trueOption);
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          hasErrors: true,
        })
      );
    });
  });

  it('should update sort field', async () => {
    const user = userEvent.setup();
    render(<EventsFilter onChange={mockOnChange} />);
    
    const selects = screen.getAllByRole('combobox');
    await user.click(selects[4]);
    
    const descOption = await screen.findByText('Desc');
    await user.click(descOption);
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: 'DESC',
        })
      );
    });
  });

  it('should show loading state on button', () => {
    render(<EventsFilter onChange={mockOnChange} isLoading={true} />);
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).toHaveClass('ant-btn-loading');
  });

  it('should expose form values via ref', () => {
    const ref = createRef<EventsFilterRef>();
    render(<EventsFilter ref={ref} onChange={mockOnChange} />);
    
    expect(ref.current?.form).toEqual({
      queue: '',
      status: '',
      entityClass: '',
      hasErrors: false,
      sort: 'ASC',
    });
  });

  it('should handle empty entity classes data', () => {
    vi.mocked(hooks.useEntitiesListPossible).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<EventsFilter onChange={mockOnChange} />);
    
    expect(screen.getByText('Entity class')).toBeInTheDocument();
  });

  it('should handle empty statuses data', () => {
    vi.mocked(hooks.useTransactionEventStatusesList).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<EventsFilter onChange={mockOnChange} />);
    
    expect(screen.getByText('Transaction Status')).toBeInTheDocument();
  });

  it('should handle empty queues data', () => {
    vi.mocked(hooks.useProcessingQueues).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<EventsFilter onChange={mockOnChange} />);
    
    expect(screen.getByText('Queue')).toBeInTheDocument();
  });

  it('should have showSearch on queue select', () => {
    const { container } = render(<EventsFilter onChange={mockOnChange} />);
    
    const selects = container.querySelectorAll('.ant-select-show-search');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('should have allowClear on queue select', () => {
    const { container } = render(<EventsFilter onChange={mockOnChange} />);
    
    const selects = container.querySelectorAll('.ant-select-allow-clear');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('should render with correct className', () => {
    const { container } = render(<EventsFilter onChange={mockOnChange} />);
    
    expect(container.querySelector('.events-filter')).toBeInTheDocument();
  });

  it('should render Card with title', () => {
    render(<EventsFilter onChange={mockOnChange} />);
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should handle onChange not provided', async () => {
    const user = userEvent.setup();
    render(<EventsFilter />);
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);
    
    // Should not throw error
    expect(loadButton).toBeInTheDocument();
  });
});

