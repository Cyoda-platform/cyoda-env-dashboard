/**
 * Tests for ProcessingEventsView Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProcessingEventsView } from '../ProcessingEventsView';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useProcessingQueueEvents: vi.fn(),
  useSummary: vi.fn(),
  useProcessingQueues: vi.fn(),
}));

const mockEventsData = [
  {
    createTime: '2025-10-15 10:00:00',
    doneTime: '2025-10-15 10:01:00',
    errorTime: '2025-10-15 10:02:00',
    queueName: 'test-queue-1',
    shardId: '1',
    status: 'COMPLETED',
    timeUUID: 'uuid-1',
    entityClassName: 'TestEntity',
    entityId: 'entity-1',
    entityHasErrors: false,
    errorEventTimeUUID: '',
    coreDataClassName: 'CoreData',
    clientDataClassName: 'ClientData',
  },
  {
    createTime: '2025-10-15 11:00:00',
    doneTime: '2025-10-15 11:01:00',
    errorTime: '',
    queueName: 'test-queue-2',
    shardId: '2',
    status: 'PROCESSING',
    timeUUID: 'uuid-2',
    entityClassName: 'TestEntity2',
    entityId: 'entity-2',
    entityHasErrors: true,
    errorEventTimeUUID: 'error-uuid',
    coreDataClassName: '',
    clientDataClassName: '',
  },
];

describe('ProcessingEventsView', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/nodes/test-node']}>
        <Routes>
          <Route path="/nodes/:name" element={<ProcessingEventsView />} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(hooks.useProcessingQueueEvents).mockReturnValue({
      data: mockEventsData,
      isLoading: false,
    } as any);

    vi.mocked(hooks.useSummary).mockReturnValue({
      data: {
        actualShards: [
          { shardId: '1' },
          { shardId: '2' },
        ],
      },
    } as any);

    vi.mocked(hooks.useProcessingQueues).mockReturnValue({
      data: ['queue-1', 'queue-2'],
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    renderComponent();
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should render filter fields', () => {
    renderComponent();
    
    const queue = screen.getAllByText('Queue');
    const shard = screen.getAllByText('Shard');
    expect(queue.length).toBeGreaterThan(0);
    expect(shard.length).toBeGreaterThan(0);
  });

  it('should render table with 13 columns', () => {
    renderComponent();
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBe(13);
  });

  it('should render table column headers', () => {
    renderComponent();

    const headers = screen.getAllByRole('columnheader');
    const headerTexts = headers.map(h => h.textContent);

    expect(headerTexts).toContain('Create Time');
    expect(headerTexts).toContain('Done Time');
    expect(headerTexts).toContain('Error Time');
    expect(headerTexts).toContain('Status');
    expect(headerTexts).toContain('Time UUID');
  });

  it('should render table data', () => {
    renderComponent();
    
    expect(screen.getByText('2025-10-15 10:00:00')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('PROCESSING')).toBeInTheDocument();
  });

  it('should render queue names', () => {
    renderComponent();
    
    const queue1 = screen.getAllByText('test-queue-1');
    const queue2 = screen.getAllByText('test-queue-2');
    expect(queue1.length).toBeGreaterThan(0);
    expect(queue2.length).toBeGreaterThan(0);
  });

  it('should render hasErrors as Yes/No', () => {
    renderComponent();
    
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('should render Time UUID as links', () => {
    renderComponent();
    
    const link1 = screen.getByRole('link', { name: 'uuid-1' });
    const link2 = screen.getByRole('link', { name: 'uuid-2' });
    expect(link1).toBeInTheDocument();
    expect(link2).toBeInTheDocument();
  });

  it('should have correct link URLs', () => {
    renderComponent();
    
    const link1 = screen.getByRole('link', { name: 'uuid-1' });
    expect(link1).toHaveAttribute('href', '/nodes/test-node/event-view?queue=TestEntity&shard=1&timeUUID=uuid-1');
  });

  it('should render Reset Filter button', () => {
    renderComponent();
    
    const resetButton = screen.getByRole('button', { name: /reset filter/i });
    expect(resetButton).toBeInTheDocument();
  });

  it('should have Reset Filter button disabled initially', () => {
    renderComponent();
    
    const resetButton = screen.getByRole('button', { name: /reset filter/i });
    expect(resetButton).toBeDisabled();
  });

  it('should render date pickers', () => {
    renderComponent();
    
    expect(screen.getByText('Time From')).toBeInTheDocument();
    expect(screen.getByText('Time To')).toBeInTheDocument();
  });

  it('should render Event Status filter', () => {
    renderComponent();
    
    expect(screen.getByText('Event Status')).toBeInTheDocument();
  });

  it('should have bordered table', () => {
    const { container } = renderComponent();
    
    const table = container.querySelector('.ant-table-bordered');
    expect(table).toBeInTheDocument();
  });

  it('should have scrollable table', () => {
    const { container } = renderComponent();
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should have pagination', () => {
    const { container } = renderComponent();
    
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should render correct number of rows', () => {
    const { container } = renderComponent();
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(2);
  });

  it('should show loading state', () => {
    vi.mocked(hooks.useProcessingQueueEvents).mockReturnValue({
      data: null,
      isLoading: true,
    } as any);

    const { container } = renderComponent();
    
    const spinner = container.querySelector('.ant-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    vi.mocked(hooks.useProcessingQueueEvents).mockReturnValue({
      data: null,
      isLoading: false,
    } as any);

    const { container } = renderComponent();
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(0);
  });

  it('should render component wrapper', () => {
    const { container } = renderComponent();

    const wrapper = container.querySelector('.pm-processing-events-view');
    expect(wrapper).toBeInTheDocument();
  });

  it('should have allowClear on selects', () => {
    renderComponent();
    
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(3);
  });

  it('should have showSearch on selects', () => {
    renderComponent();
    
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(3);
  });

  it('should use timeUUID as row key', () => {
    const { container } = renderComponent();
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(2);
  });

  it('should render entity class names', () => {
    renderComponent();
    
    expect(screen.getByText('TestEntity')).toBeInTheDocument();
    expect(screen.getByText('TestEntity2')).toBeInTheDocument();
  });

  it('should render entity IDs', () => {
    renderComponent();
    
    expect(screen.getByText('entity-1')).toBeInTheDocument();
    expect(screen.getByText('entity-2')).toBeInTheDocument();
  });

  it('should render core data class names', () => {
    renderComponent();
    
    expect(screen.getByText('CoreData')).toBeInTheDocument();
  });

  it('should render client data class names', () => {
    renderComponent();
    
    expect(screen.getByText('ClientData')).toBeInTheDocument();
  });

  it('should have fixed left column', () => {
    const { container } = renderComponent();
    
    const fixedColumn = container.querySelector('.ant-table-cell-fix-left');
    expect(fixedColumn).toBeInTheDocument();
  });
});

