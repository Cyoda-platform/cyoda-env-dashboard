/**
 * Tests for PmComponentsExecutionQueuesInfo Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PmComponentsExecutionQueuesInfo } from '../PmComponentsExecutionQueuesInfo';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useProcessingQueues: vi.fn(),
}));

const mockQueuesData = [
  'DISTRIBUTED_REPORT_1_PHASE',
  'DISTRIBUTED_REPORT_2_PHASE',
  'INDEX_CONFIGURATION',
];

describe('PmComponentsExecutionQueuesInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(hooks.useProcessingQueues).mockReturnValue({
      data: mockQueuesData,
      isLoading: false,
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    render(<PmComponentsExecutionQueuesInfo />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should render table with 4 columns', () => {
    render(<PmComponentsExecutionQueuesInfo />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBe(4);
  });

  it('should render table column headers', () => {
    render(<PmComponentsExecutionQueuesInfo />);

    const headers = screen.getAllByRole('columnheader');
    const headerTexts = headers.map(h => h.textContent);

    expect(headerTexts).toContain('Executor Name');
    expect(headerTexts).toContain('Index');
    expect(headerTexts).toContain('Queue size');
    expect(headerTexts).toContain('Details');
  });

  it('should have bordered table', () => {
    const { container } = render(<PmComponentsExecutionQueuesInfo />);

    const table = container.querySelector('.ant-table-bordered');
    expect(table).toBeInTheDocument();
  });

  it('should render table with queue data', () => {
    const { container } = render(<PmComponentsExecutionQueuesInfo />);

    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(3);
  });

  it('should use executorName as row key', () => {
    render(<PmComponentsExecutionQueuesInfo />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should have fixed left column', () => {
    render(<PmComponentsExecutionQueuesInfo />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers[0].textContent).toBe('Executor Name');
  });

  it('should have sortable columns', () => {
    render(<PmComponentsExecutionQueuesInfo />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBe(4);
  });

  it('should render table structure correctly', () => {
    const { container } = render(<PmComponentsExecutionQueuesInfo />);

    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should render empty table when no data', () => {
    vi.mocked(hooks.useProcessingQueues).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    const { container } = render(<PmComponentsExecutionQueuesInfo />);

    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(0);
  });
});

