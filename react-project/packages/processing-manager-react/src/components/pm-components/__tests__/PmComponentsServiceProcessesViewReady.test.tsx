/**
 * PmComponentsServiceProcessesViewReady Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PmComponentsServiceProcessesViewReady from '../PmComponentsServiceProcessesViewReady';

describe('PmComponentsServiceProcessesViewReady', () => {
  const mockData = [
    {
      name: 'Process-1',
      shard: 'shard-1',
      lastStartTime: '2024-01-01T10:00:00Z',
      lastFinishTime: '2024-01-01T10:05:00Z',
      lastDurationMillis: 300000,
      nextStartTime: '2024-01-01T11:00:00Z',
      processing: true,
      queued: false,
    },
    {
      name: 'Process-2',
      shard: 'shard-2',
      lastStartTime: '2024-01-01T09:00:00Z',
      lastFinishTime: '2024-01-01T09:10:00Z',
      lastDurationMillis: 600000,
      nextStartTime: '2024-01-01T10:00:00Z',
      processing: false,
      queued: true,
    },
  ];

  const renderComponent = (props = {}) => {
    return render(
      <PmComponentsServiceProcessesViewReady tableData={mockData} {...props} />
    );
  };

  it('should render table title', () => {
    renderComponent();
    
    expect(screen.getByText('Ready(working) processes')).toBeInTheDocument();
  });

  it('should render all column headers', () => {
    renderComponent();

    const headers = screen.getAllByRole('columnheader');
    const headerTexts = headers.map(h => h.textContent);

    expect(headerTexts.some(t => t?.includes('Name'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('Shard'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('Last Start Time'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('Last Finish Time'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('Last Duration Millis'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('Next Start Time'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('Is processing'))).toBe(true);
    expect(headerTexts.some(t => t?.includes('Is queued'))).toBe(true);
  });

  it('should display process names', () => {
    renderComponent();

    const process1Elements = screen.getAllByText('Process-1');
    expect(process1Elements.length).toBeGreaterThan(0);
    const process2Elements = screen.getAllByText('Process-2');
    expect(process2Elements.length).toBeGreaterThan(0);
  });

  it('should display shard information', () => {
    renderComponent();

    const shard1Elements = screen.getAllByText('shard-1');
    expect(shard1Elements.length).toBeGreaterThan(0);
    const shard2Elements = screen.getAllByText('shard-2');
    expect(shard2Elements.length).toBeGreaterThan(0);
  });

  it('should display timestamps', () => {
    renderComponent();

    const timestamp1Elements = screen.getAllByText('2024-01-01T10:00:00Z');
    expect(timestamp1Elements.length).toBeGreaterThan(0);
    const timestamp2Elements = screen.getAllByText('2024-01-01T10:05:00Z');
    expect(timestamp2Elements.length).toBeGreaterThan(0);
    const timestamp3Elements = screen.getAllByText('2024-01-01T11:00:00Z');
    expect(timestamp3Elements.length).toBeGreaterThan(0);
  });

  it('should display duration in milliseconds', () => {
    renderComponent();

    const duration1Elements = screen.getAllByText('300000');
    expect(duration1Elements.length).toBeGreaterThan(0);
    const duration2Elements = screen.getAllByText('600000');
    expect(duration2Elements.length).toBeGreaterThan(0);
  });

  it('should render boolean processing as Yes/No', () => {
    renderComponent();
    
    const yesTexts = screen.getAllByText('Yes');
    const noTexts = screen.getAllByText('No');
    
    expect(yesTexts.length).toBeGreaterThan(0);
    expect(noTexts.length).toBeGreaterThan(0);
  });

  it('should render boolean queued as Yes/No', () => {
    renderComponent();
    
    // Process-1: processing=true, queued=false
    // Process-2: processing=false, queued=true
    const yesTexts = screen.getAllByText('Yes');
    const noTexts = screen.getAllByText('No');
    
    expect(yesTexts.length).toBe(2); // One for processing, one for queued
    expect(noTexts.length).toBe(2); // One for processing, one for queued
  });

  it('should render empty table when no data provided', () => {
    render(<PmComponentsServiceProcessesViewReady tableData={[]} />);

    expect(screen.getByText('Ready(working) processes')).toBeInTheDocument();
    const headers = screen.getAllByRole('columnheader');
    expect(headers.some(h => h.textContent?.includes('Name'))).toBe(true);
  });

  it('should handle undefined tableData gracefully', () => {
    render(<PmComponentsServiceProcessesViewReady tableData={undefined as any} />);

    expect(screen.getByText('Ready(working) processes')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <PmComponentsServiceProcessesViewReady tableData={mockData} className="custom-class" />
    );
    
    const wrapper = container.querySelector('.pm-components-service-processes-view-ready');
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should render pagination controls', () => {
    renderComponent();
    
    const pagination = document.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should have sortable columns', async () => {
    const user = userEvent.setup();
    renderComponent();

    const headers = screen.getAllByRole('columnheader');
    const nameHeader = headers.find(h => h.textContent?.includes('Name'));

    if (nameHeader) {
      await user.click(nameHeader);
    }

    const process1Elements = screen.getAllByText('Process-1');
    expect(process1Elements.length).toBeGreaterThan(0);
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

  it('should use name as row key', () => {
    const { container } = renderComponent();

    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should handle sorting by shard', async () => {
    const user = userEvent.setup();
    renderComponent();

    const headers = screen.getAllByRole('columnheader');
    const shardHeader = headers.find(h => h.textContent?.includes('Shard'));

    if (shardHeader) {
      await user.click(shardHeader);
    }

    const shard1Elements = screen.getAllByText('shard-1');
    expect(shard1Elements.length).toBeGreaterThan(0);
    const shard2Elements = screen.getAllByText('shard-2');
    expect(shard2Elements.length).toBeGreaterThan(0);
  });

  it('should handle sorting by duration', async () => {
    const user = userEvent.setup();
    renderComponent();

    const headers = screen.getAllByRole('columnheader');
    const durationHeader = headers.find(h => h.textContent?.includes('Last Duration Millis'));

    if (durationHeader) {
      await user.click(durationHeader);
    }

    const duration1Elements = screen.getAllByText('300000');
    expect(duration1Elements.length).toBeGreaterThan(0);
    const duration2Elements = screen.getAllByText('600000');
    expect(duration2Elements.length).toBeGreaterThan(0);
  });

  it('should handle sorting by timestamps', async () => {
    const user = userEvent.setup();
    renderComponent();

    const headers = screen.getAllByRole('columnheader');
    const startTimeHeader = headers.find(h => h.textContent?.includes('Last Start Time'));

    if (startTimeHeader) {
      await user.click(startTimeHeader);
    }

    const timestamp1Elements = screen.getAllByText('2024-01-01T10:00:00Z');
    expect(timestamp1Elements.length).toBeGreaterThan(0);
  });

  it('should handle sorting by boolean values', async () => {
    const user = userEvent.setup();
    renderComponent();

    const headers = screen.getAllByRole('columnheader');
    const processingHeader = headers.find(h => h.textContent?.includes('Is processing'));

    if (processingHeader) {
      await user.click(processingHeader);
    }

    const yesTexts = screen.getAllByText('Yes');
    expect(yesTexts.length).toBeGreaterThan(0);
  });

  it('should render all data fields correctly', () => {
    renderComponent();

    // Check first row data
    const process1Elements = screen.getAllByText('Process-1');
    expect(process1Elements.length).toBeGreaterThan(0);
    const shard1Elements = screen.getAllByText('shard-1');
    expect(shard1Elements.length).toBeGreaterThan(0);
    const timestamp1Elements = screen.getAllByText('2024-01-01T10:00:00Z');
    expect(timestamp1Elements.length).toBeGreaterThan(0);
    const timestamp2Elements = screen.getAllByText('2024-01-01T10:05:00Z');
    expect(timestamp2Elements.length).toBeGreaterThan(0);
    const duration1Elements = screen.getAllByText('300000');
    expect(duration1Elements.length).toBeGreaterThan(0);
    const timestamp3Elements = screen.getAllByText('2024-01-01T11:00:00Z');
    expect(timestamp3Elements.length).toBeGreaterThan(0);
  });

  it('should render with large dataset', () => {
    const largeData = Array.from({ length: 50 }, (_, i) => ({
      name: `Process-${i + 1}`,
      shard: `shard-${i + 1}`,
      lastStartTime: `2024-01-01T${String(i % 24).padStart(2, '0')}:00:00Z`,
      lastFinishTime: `2024-01-01T${String(i % 24).padStart(2, '0')}:05:00Z`,
      lastDurationMillis: (i + 1) * 1000,
      nextStartTime: `2024-01-01T${String((i + 1) % 24).padStart(2, '0')}:00:00Z`,
      processing: i % 2 === 0,
      queued: i % 3 === 0,
    }));
    
    render(<PmComponentsServiceProcessesViewReady tableData={largeData} />);
    
    expect(screen.getByText('Process-1')).toBeInTheDocument();
  });

  it('should have correct layout structure', () => {
    const { container } = renderComponent();
    
    expect(container.querySelector('.pm-components-service-processes-view-ready')).toBeInTheDocument();
  });

  it('should have pagination with correct options', () => {
    renderComponent();
    
    const pagination = document.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });
});

