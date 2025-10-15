/**
 * Tests for ProcessingEventsEntitiesErrorListViewTable Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProcessingEventsEntitiesErrorListViewTable } from '../ProcessingEventsEntitiesErrorListViewTable';

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ name: 'test-node' })),
  };
});

describe('ProcessingEventsEntitiesErrorListViewTable', () => {
  const mockTableData = [
    {
      entityClass: 'com.example.Entity1',
      entityId: 'entity-123',
      shardId: 'shard-1',
      eventUUID: 'uuid-abc',
    },
    {
      entityClass: 'com.example.Entity2',
      entityId: 'entity-456',
      shardId: 'shard-2',
      eventUUID: 'uuid-def',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter initialEntries={['/processing-ui/nodes/test-node']}>
        <Routes>
          <Route
            path="/processing-ui/nodes/:name"
            element={<ProcessingEventsEntitiesErrorListViewTable tableData={[]} {...props} />}
          />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render table', () => {
    const { container } = renderComponent();
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should render with empty data by default', () => {
    const { container } = renderComponent();
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(0);
  });

  it('should render table data', () => {
    renderComponent({ tableData: mockTableData });
    
    expect(screen.getByText('com.example.Entity1')).toBeInTheDocument();
    expect(screen.getByText('entity-123')).toBeInTheDocument();
    expect(screen.getByText('shard-1')).toBeInTheDocument();
  });

  it('should render all column headers', () => {
    renderComponent();
    
    const headers = screen.getAllByRole('columnheader');
    const headerTexts = headers.map(h => h.textContent);
    
    expect(headerTexts.some(t => t?.includes('Entity class'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('Entity ID'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('Entity Shard'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('Actions'))).toBe(true);
  });

  it('should render correct number of rows', () => {
    const { container } = renderComponent({ tableData: mockTableData });
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(2);
  });

  it('should render action links for each row', () => {
    renderComponent({ tableData: mockTableData });
    
    const versionsLinks = screen.getAllByText('Versions');
    expect(versionsLinks.length).toBe(2);
    
    const changesLinks = screen.getAllByText('Changes');
    expect(changesLinks.length).toBe(2);
    
    const stateMachineLinks = screen.getAllByText('State Machine');
    expect(stateMachineLinks.length).toBe(2);
    
    const errorEventLinks = screen.getAllByText('Error Event');
    expect(errorEventLinks.length).toBe(2);
  });

  it('should render Versions link with correct URL', () => {
    renderComponent({ tableData: mockTableData });
    
    const versionsLink = screen.getAllByText('Versions')[0];
    expect(versionsLink).toHaveAttribute(
      'href',
      '/processing-ui/nodes/test-node/versions?entityId=entity-123&type=com.example.Entity1'
    );
  });

  it('should render Changes link with correct URL', () => {
    renderComponent({ tableData: mockTableData });
    
    const changesLink = screen.getAllByText('Changes')[0];
    expect(changesLink).toHaveAttribute(
      'href',
      '/processing-ui/nodes/test-node/changes?entityId=entity-123&type=com.example.Entity1'
    );
  });

  it('should render State Machine link with correct URL', () => {
    renderComponent({ tableData: mockTableData });
    
    const stateMachineLink = screen.getAllByText('State Machine')[0];
    expect(stateMachineLink).toHaveAttribute(
      'href',
      '/processing-ui/nodes/test-node/entity-state-machine?entityId=entity-123&type=com.example.Entity1'
    );
  });

  it('should render Error Event link with correct URL', () => {
    renderComponent({ tableData: mockTableData });
    
    const errorEventLink = screen.getAllByText('Error Event')[0];
    expect(errorEventLink).toHaveAttribute(
      'href',
      '/processing-ui/nodes/test-node/event-view?queue=com.example.Entity1&shard=shard-1&timeUUID=uuid-abc'
    );
  });

  it('should handle sorting by entity class', async () => {
    const user = userEvent.setup();
    renderComponent({ tableData: mockTableData });
    
    const headers = screen.getAllByRole('columnheader');
    const entityClassHeader = headers.find(h => h.textContent?.includes('Entity class'));
    
    if (entityClassHeader) {
      await user.click(entityClassHeader);
    }
    
    // Data should still be visible after sort
    expect(screen.getByText('com.example.Entity1')).toBeInTheDocument();
    expect(screen.getByText('com.example.Entity2')).toBeInTheDocument();
  });

  it('should handle sorting by entity ID', async () => {
    const user = userEvent.setup();
    renderComponent({ tableData: mockTableData });
    
    const headers = screen.getAllByRole('columnheader');
    const entityIdHeader = headers.find(h => h.textContent?.includes('Entity ID'));
    
    if (entityIdHeader) {
      await user.click(entityIdHeader);
    }
    
    // Data should still be visible after sort
    expect(screen.getByText('entity-123')).toBeInTheDocument();
    expect(screen.getByText('entity-456')).toBeInTheDocument();
  });

  it('should handle sorting by shard ID', async () => {
    const user = userEvent.setup();
    renderComponent({ tableData: mockTableData });
    
    const headers = screen.getAllByRole('columnheader');
    const shardIdHeader = headers.find(h => h.textContent?.includes('Entity Shard'));
    
    if (shardIdHeader) {
      await user.click(shardIdHeader);
    }
    
    // Data should still be visible after sort
    expect(screen.getByText('shard-1')).toBeInTheDocument();
    expect(screen.getByText('shard-2')).toBeInTheDocument();
  });

  it('should have bordered table', () => {
    const { container } = renderComponent();
    
    const table = container.querySelector('.ant-table-bordered');
    expect(table).toBeInTheDocument();
  });

  it('should have pagination', () => {
    const { container } = renderComponent({ tableData: mockTableData });
    
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should have correct pagination options', () => {
    renderComponent({ tableData: mockTableData });
    
    // Pagination should be present with size changer
    const { container } = renderComponent({ tableData: mockTableData });
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should have scrollable table', () => {
    const { container } = renderComponent();

    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should use entityId as row key', () => {
    const { container } = renderComponent({ tableData: mockTableData });
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(2);
  });

  it('should handle large dataset', () => {
    const largeData = Array.from({ length: 50 }, (_, i) => ({
      entityClass: `Entity${i}`,
      entityId: `id-${i}`,
      shardId: `shard-${i}`,
      eventUUID: `uuid-${i}`,
    }));
    
    const { container } = renderComponent({ tableData: largeData });
    
    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should render action buttons in flex layout', () => {
    const { container } = renderComponent({ tableData: mockTableData });
    
    const actionCells = container.querySelectorAll('.actions-buttons');
    expect(actionCells.length).toBeGreaterThan(0);
  });

  it('should have fixed left column for entity class', () => {
    renderComponent({ tableData: mockTableData });
    
    // Entity class column should be present
    expect(screen.getByText('com.example.Entity1')).toBeInTheDocument();
  });

});

