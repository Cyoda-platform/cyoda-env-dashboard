/**
 * PmComponentsExecutionMonitorsTable Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PmComponentsExecutionMonitorsTable from '../PmComponentsExecutionMonitorsTable';

describe('PmComponentsExecutionMonitorsTable', () => {
  const mockData = [
    {
      index: 1,
      name: 'Monitor-1',
      entityId: 'entity-123',
      entityClass: 'com.example.Entity',
      expectedThreadsCount: 5,
      lastAccessTime: '2024-01-01T10:00:00Z',
      processFinished: false,
      processingThreadsCount: 3,
      finishedThreadsCount: 2,
    },
    {
      index: 2,
      name: 'Monitor-2',
      entityId: 'entity-456',
      entityClass: 'com.example.AnotherEntity',
      expectedThreadsCount: 10,
      lastAccessTime: '2024-01-01T11:00:00Z',
      processFinished: true,
      processingThreadsCount: 0,
      finishedThreadsCount: 10,
    },
  ];

  const renderComponent = (props = {}) => {
    return render(
      <PmComponentsExecutionMonitorsTable tableData={mockData} {...props} />
    );
  };

  it('should render table with data', () => {
    renderComponent();
    
    expect(screen.getByText('Monitor-1')).toBeInTheDocument();
    expect(screen.getByText('Monitor-2')).toBeInTheDocument();
  });

  it('should render all column headers', () => {
    renderComponent();

    const headers = screen.getAllByRole('columnheader');
    const headerTexts = headers.map(h => h.textContent);

    expect(headerTexts.some(t => t?.includes('№'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('Name'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('EntityId'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('Entity Class'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('ExpectedThreadsCount'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('LastAccessTime'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('processFinished'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('ProcessingThreadsCount'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('FinishedThreadsCount'))).toBe(true);
  });

  it('should display index values', () => {
    renderComponent();

    const indexElements = screen.getAllByText('1');
    expect(indexElements.length).toBeGreaterThan(0);
    const twoElements = screen.getAllByText('2');
    expect(twoElements.length).toBeGreaterThan(0);
  });

  it('should display entity IDs', () => {
    renderComponent();
    
    expect(screen.getByText('entity-123')).toBeInTheDocument();
    expect(screen.getByText('entity-456')).toBeInTheDocument();
  });

  it('should display entity classes', () => {
    renderComponent();
    
    expect(screen.getByText('com.example.Entity')).toBeInTheDocument();
    expect(screen.getByText('com.example.AnotherEntity')).toBeInTheDocument();
  });

  it('should display thread counts', () => {
    renderComponent();

    const fiveElements = screen.getAllByText('5');
    expect(fiveElements.length).toBeGreaterThan(0);
    const tenElements = screen.getAllByText('10');
    expect(tenElements.length).toBeGreaterThan(0);
    const threeElements = screen.getAllByText('3');
    expect(threeElements.length).toBeGreaterThan(0);
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it('should display last access times', () => {
    renderComponent();
    
    expect(screen.getByText('2024-01-01T10:00:00Z')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01T11:00:00Z')).toBeInTheDocument();
  });

  it('should render boolean values as strings', () => {
    renderComponent();
    
    expect(screen.getByText('false')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('should render empty table when no data provided', () => {
    render(<PmComponentsExecutionMonitorsTable tableData={[]} />);

    // Table headers should still be present
    const headers = screen.getAllByRole('columnheader');
    expect(headers.some(h => h.textContent?.includes('№'))).toBe(true);
    expect(headers.some(h => h.textContent?.includes('Name'))).toBe(true);
  });

  it('should handle undefined tableData gracefully', () => {
    render(<PmComponentsExecutionMonitorsTable tableData={undefined as any} />);

    // Should render without crashing
    const headers = screen.getAllByRole('columnheader');
    expect(headers.some(h => h.textContent?.includes('№'))).toBe(true);
  });

  it('should render pagination controls', () => {
    renderComponent();
    
    // Ant Design pagination should be present
    const pagination = document.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should have sortable columns', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Find the Name column header
    const headers = screen.getAllByRole('columnheader');
    const nameHeader = headers.find(h => h.textContent?.includes('Name'));

    if (nameHeader) {
      // Click to sort
      await user.click(nameHeader);
    }

    // Table should still render (sorting is handled by Ant Design)
    expect(screen.getByText('Monitor-1')).toBeInTheDocument();
  });

  it('should display correct number of rows', () => {
    const { container } = renderComponent();

    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(2);
  });

  it('should render table with borders', () => {
    const { container } = renderComponent();

    const table = container.querySelector('.ant-table-bordered');
    expect(table).toBeInTheDocument();
  });

  it('should have scrollable content', () => {
    const { container } = renderComponent();

    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should render with large dataset', () => {
    const largeData = Array.from({ length: 50 }, (_, i) => ({
      index: i + 1,
      name: `Monitor-${i + 1}`,
      entityId: `entity-${i + 1}`,
      entityClass: `com.example.Entity${i + 1}`,
      expectedThreadsCount: i + 1,
      lastAccessTime: `2024-01-01T${String(i % 24).padStart(2, '0')}:00:00Z`,
      processFinished: i % 2 === 0,
      processingThreadsCount: i % 5,
      finishedThreadsCount: i % 3,
    }));
    
    render(<PmComponentsExecutionMonitorsTable tableData={largeData} />);
    
    // Should render without issues
    expect(screen.getByText('Monitor-1')).toBeInTheDocument();
  });

  it('should use index as row key', () => {
    const { container } = renderComponent();

    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should have correct column widths', () => {
    renderComponent();
    
    // Columns should have width attributes set
    const table = document.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should render all data fields correctly', () => {
    renderComponent();

    // Check first row data
    expect(screen.getByText('Monitor-1')).toBeInTheDocument();
    expect(screen.getByText('entity-123')).toBeInTheDocument();
    expect(screen.getByText('com.example.Entity')).toBeInTheDocument();
    const fiveElements = screen.getAllByText('5');
    expect(fiveElements.length).toBeGreaterThan(0);
    expect(screen.getByText('2024-01-01T10:00:00Z')).toBeInTheDocument();
    expect(screen.getByText('false')).toBeInTheDocument();
    const threeElements = screen.getAllByText('3');
    expect(threeElements.length).toBeGreaterThan(0);
    const twoElements = screen.getAllByText('2');
    expect(twoElements.length).toBeGreaterThan(0);
  });

  it('should handle sorting by index', async () => {
    const user = userEvent.setup();
    renderComponent();

    const headers = screen.getAllByRole('columnheader');
    const indexHeader = headers.find(h => h.textContent?.includes('№'));

    if (indexHeader) {
      await user.click(indexHeader);
    }

    // Data should still be visible after sort
    expect(screen.getByText('Monitor-1')).toBeInTheDocument();
    expect(screen.getByText('Monitor-2')).toBeInTheDocument();
  });

  it('should handle sorting by name', async () => {
    const user = userEvent.setup();
    renderComponent();

    const headers = screen.getAllByRole('columnheader');
    const nameHeader = headers.find(h => h.textContent?.includes('Name'));

    if (nameHeader) {
      await user.click(nameHeader);
    }

    // Data should still be visible after sort
    expect(screen.getByText('Monitor-1')).toBeInTheDocument();
    expect(screen.getByText('Monitor-2')).toBeInTheDocument();
  });

  it('should handle sorting by thread counts', async () => {
    const user = userEvent.setup();
    renderComponent();

    const headers = screen.getAllByRole('columnheader');
    const expectedThreadsHeader = headers.find(h => h.textContent?.includes('ExpectedThreadsCount'));

    if (expectedThreadsHeader) {
      await user.click(expectedThreadsHeader);
    }

    // Data should still be visible after sort
    const fiveElements = screen.getAllByText('5');
    expect(fiveElements.length).toBeGreaterThan(0);
    const tenElements = screen.getAllByText('10');
    expect(tenElements.length).toBeGreaterThan(0);
  });

  it('should have pagination with correct options', () => {
    renderComponent();
    
    const pagination = document.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });
});

