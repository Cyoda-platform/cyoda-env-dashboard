/**
 * Tests for ProcessingEventsErrorViewTable Component
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProcessingEventsErrorViewTable } from '../ProcessingEventsErrorViewTable';

const mockTableData = [
  {
    queueName: 'test-queue-1',
    createTime: '2024-01-01 10:00:00',
    doneTime: '2024-01-01 10:05:00',
    errorTime: '2024-01-01 10:06:00',
    shardId: 'shard-1',
    status: 'ERROR',
    timeUUID: 'uuid-1',
    entityClassName: 'com.cyoda.TestEntity1',
    entityId: 'entity-1',
    entityHasErrors: true,
    errorEventTimeUUID: 'error-uuid-1',
    coreDataClassName: 'CoreClass1',
    clientDataClassName: 'ClientClass1',
  },
  {
    queueName: 'test-queue-2',
    createTime: '2024-01-02 11:00:00',
    doneTime: '2024-01-02 11:05:00',
    errorTime: '2024-01-02 11:06:00',
    shardId: 'shard-2',
    status: 'DONE',
    timeUUID: 'uuid-2',
    entityClassName: 'com.cyoda.TestEntity2',
    entityId: 'entity-2',
    entityHasErrors: false,
    errorEventTimeUUID: 'error-uuid-2',
    coreDataClassName: 'CoreClass2',
    clientDataClassName: 'ClientClass2',
  },
];

const renderComponent = (props = {}) => {
  return render(
    <MemoryRouter initialEntries={['/nodes/test-node']}>
      <Routes>
        <Route
          path="/nodes/:name"
          element={<ProcessingEventsErrorViewTable tableData={[]} {...props} />}
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProcessingEventsErrorViewTable', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    renderComponent();
    
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should render all column headers', () => {
    renderComponent();
    
    const headers = screen.getAllByRole('columnheader');
    const headerTexts = headers.map((h) => h.textContent);
    
    expect(headerTexts).toContain('Queue');
    expect(headerTexts).toContain('Create Time');
    expect(headerTexts).toContain('Done Time');
    expect(headerTexts).toContain('Error Time');
    expect(headerTexts).toContain('Shard');
    expect(headerTexts).toContain('Status');
    expect(headerTexts).toContain('Time-UUID');
    expect(headerTexts).toContain('Entity-Class');
    expect(headerTexts).toContain('Entity-ID');
    expect(headerTexts).toContain('Has Errors');
    expect(headerTexts).toContain('Error Event Time-UUID');
    expect(headerTexts).toContain('Core-Event-Data-Class');
    expect(headerTexts).toContain('Client-Event-Data-Class');
  });

  it('should have 13 columns', () => {
    renderComponent();
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBe(13);
  });

  it('should render table data', () => {
    renderComponent({ tableData: mockTableData });

    const queue1 = screen.getAllByText('test-queue-1');
    const queue2 = screen.getAllByText('test-queue-2');
    expect(queue1.length).toBeGreaterThan(0);
    expect(queue2.length).toBeGreaterThan(0);
  });

  it('should render create times', () => {
    renderComponent({ tableData: mockTableData });
    
    expect(screen.getByText('2024-01-01 10:00:00')).toBeInTheDocument();
    expect(screen.getByText('2024-01-02 11:00:00')).toBeInTheDocument();
  });

  it('should render done times', () => {
    renderComponent({ tableData: mockTableData });
    
    expect(screen.getByText('2024-01-01 10:05:00')).toBeInTheDocument();
    expect(screen.getByText('2024-01-02 11:05:00')).toBeInTheDocument();
  });

  it('should render error times', () => {
    renderComponent({ tableData: mockTableData });
    
    expect(screen.getByText('2024-01-01 10:06:00')).toBeInTheDocument();
    expect(screen.getByText('2024-01-02 11:06:00')).toBeInTheDocument();
  });

  it('should render shard IDs', () => {
    renderComponent({ tableData: mockTableData });
    
    expect(screen.getByText('shard-1')).toBeInTheDocument();
    expect(screen.getByText('shard-2')).toBeInTheDocument();
  });

  it('should render status values', () => {
    renderComponent({ tableData: mockTableData });
    
    expect(screen.getByText('ERROR')).toBeInTheDocument();
    expect(screen.getByText('DONE')).toBeInTheDocument();
  });

  it('should render entity IDs', () => {
    renderComponent({ tableData: mockTableData });
    
    expect(screen.getByText('entity-1')).toBeInTheDocument();
    expect(screen.getByText('entity-2')).toBeInTheDocument();
  });

  it('should render "Yes" for entityHasErrors true', () => {
    renderComponent({ tableData: mockTableData });
    
    const yesElements = screen.getAllByText('Yes');
    expect(yesElements.length).toBeGreaterThan(0);
  });

  it('should render "No" for entityHasErrors false', () => {
    renderComponent({ tableData: mockTableData });
    
    const noElements = screen.getAllByText('No');
    expect(noElements.length).toBeGreaterThan(0);
  });

  it('should render error event time UUIDs', () => {
    renderComponent({ tableData: mockTableData });
    
    expect(screen.getByText('error-uuid-1')).toBeInTheDocument();
    expect(screen.getByText('error-uuid-2')).toBeInTheDocument();
  });

  it('should render core data class names', () => {
    renderComponent({ tableData: mockTableData });
    
    expect(screen.getByText('CoreClass1')).toBeInTheDocument();
    expect(screen.getByText('CoreClass2')).toBeInTheDocument();
  });

  it('should render client data class names', () => {
    renderComponent({ tableData: mockTableData });
    
    expect(screen.getByText('ClientClass1')).toBeInTheDocument();
    expect(screen.getByText('ClientClass2')).toBeInTheDocument();
  });

  it('should render Time-UUID as clickable link', () => {
    renderComponent({ tableData: mockTableData });

    const link1 = screen.getByText('uuid-1');
    expect(link1).toBeInTheDocument();
    expect(link1.tagName).toBe('A');
    expect(link1).toHaveStyle({ cursor: 'pointer' });
  });

  it('should render multiple Time-UUID clickable links', () => {
    renderComponent({ tableData: mockTableData });

    const link1 = screen.getByText('uuid-1');
    const link2 = screen.getByText('uuid-2');

    expect(link1).toBeInTheDocument();
    expect(link2).toBeInTheDocument();
    expect(link1.tagName).toBe('A');
    expect(link2.tagName).toBe('A');
  });

  it('should render correct number of rows', () => {
    const { container } = renderComponent({ tableData: mockTableData });
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(2);
  });

  it('should render empty table when no data', () => {
    const { container } = renderComponent({ tableData: [] });
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(0);
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
    const { container } = renderComponent({ tableData: mockTableData });
    
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should use timeUUID as row key', () => {
    const { container } = renderComponent({ tableData: mockTableData });
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(2);
  });

  it('should handle large dataset', () => {
    const largeData = Array.from({ length: 50 }, (_, i) => ({
      queueName: `queue-${i}`,
      createTime: `2024-01-${String(i + 1).padStart(2, '0')} 10:00:00`,
      doneTime: `2024-01-${String(i + 1).padStart(2, '0')} 10:05:00`,
      errorTime: `2024-01-${String(i + 1).padStart(2, '0')} 10:06:00`,
      shardId: `shard-${i}`,
      status: i % 2 === 0 ? 'ERROR' : 'DONE',
      timeUUID: `uuid-${i}`,
      entityId: `entity-${i}`,
      entityHasErrors: i % 2 === 0,
      errorEventTimeUUID: `error-uuid-${i}`,
      coreDataClassName: `CoreClass${i}`,
      clientDataClassName: `ClientClass${i}`,
    }));

    const { container } = renderComponent({ tableData: largeData });
    
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });
});

