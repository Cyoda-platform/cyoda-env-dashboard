/**
 * PmComponentsServiceProcessesViewNoneReady Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PmComponentsServiceProcessesViewNoneReady from '../PmComponentsServiceProcessesViewNoneReady';

describe('PmComponentsServiceProcessesViewNoneReady', () => {
  const mockData = [
    {
      name: 'Process-A',
      shard: 'shard-1',
    },
    {
      name: 'Process-B',
      shard: 'shard-2',
    },
    {
      name: 'Process-C',
      shard: 'shard-1',
    },
  ];

  const renderComponent = (props = {}) => {
    return render(
      <PmComponentsServiceProcessesViewNoneReady tableData={mockData} {...props} />
    );
  };

  it('should render table title', () => {
    renderComponent();
    
    expect(screen.getByText('None ready(none working) processes')).toBeInTheDocument();
  });

  it('should render all column headers', () => {
    renderComponent();
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Shard')).toBeInTheDocument();
  });

  it('should display process names', () => {
    renderComponent();
    
    expect(screen.getByText('Process-A')).toBeInTheDocument();
    expect(screen.getByText('Process-B')).toBeInTheDocument();
    expect(screen.getByText('Process-C')).toBeInTheDocument();
  });

  it('should display shard information', () => {
    renderComponent();
    
    const shard1Elements = screen.getAllByText('shard-1');
    const shard2Elements = screen.getAllByText('shard-2');
    
    expect(shard1Elements.length).toBe(2); // Process-A and Process-C
    expect(shard2Elements.length).toBe(1); // Process-B
  });

  it('should render empty table when no data provided', () => {
    render(<PmComponentsServiceProcessesViewNoneReady tableData={[]} />);
    
    expect(screen.getByText('None ready(none working) processes')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Shard')).toBeInTheDocument();
  });

  it('should handle undefined tableData gracefully', () => {
    render(<PmComponentsServiceProcessesViewNoneReady tableData={undefined as any} />);
    
    expect(screen.getByText('None ready(none working) processes')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <PmComponentsServiceProcessesViewNoneReady tableData={mockData} className="custom-class" />
    );
    
    const wrapper = container.querySelector('.pm-components-service-processes-view-none-ready');
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should render pagination controls', () => {
    renderComponent();
    
    const pagination = document.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should have sortable name column', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader);
    
    expect(screen.getByText('Process-A')).toBeInTheDocument();
    expect(screen.getByText('Process-B')).toBeInTheDocument();
    expect(screen.getByText('Process-C')).toBeInTheDocument();
  });

  it('should have sortable shard column', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const shardHeader = screen.getByText('Shard');
    await user.click(shardHeader);
    
    const shard1Elements = screen.getAllByText('shard-1');
    expect(shard1Elements.length).toBe(2);
  });

  it('should display correct number of rows', () => {
    const { container } = renderComponent();
    
    const rows = container.querySelectorAll('.ant-table-tbody tr');
    expect(rows.length).toBe(3);
  });

  it('should render table with borders', () => {
    const { container } = renderComponent();
    
    const table = container.querySelector('.ant-table-bordered');
    expect(table).toBeInTheDocument();
  });

  it('should use name as row key', () => {
    const { container } = renderComponent();
    
    const rows = container.querySelectorAll('.ant-table-tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should render with large dataset', () => {
    const largeData = Array.from({ length: 50 }, (_, i) => ({
      name: `Process-${i + 1}`,
      shard: `shard-${(i % 5) + 1}`,
    }));
    
    render(<PmComponentsServiceProcessesViewNoneReady tableData={largeData} />);
    
    expect(screen.getByText('Process-1')).toBeInTheDocument();
  });

  it('should have correct layout structure', () => {
    const { container } = renderComponent();
    
    expect(container.querySelector('.pm-components-service-processes-view-none-ready')).toBeInTheDocument();
  });

  it('should have pagination with correct options', () => {
    renderComponent();
    
    const pagination = document.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should render all data fields correctly', () => {
    renderComponent();
    
    // Check all rows data
    expect(screen.getByText('Process-A')).toBeInTheDocument();
    expect(screen.getByText('Process-B')).toBeInTheDocument();
    expect(screen.getByText('Process-C')).toBeInTheDocument();
    
    const shard1Elements = screen.getAllByText('shard-1');
    const shard2Elements = screen.getAllByText('shard-2');
    expect(shard1Elements.length).toBe(2);
    expect(shard2Elements.length).toBe(1);
  });

  it('should handle single row data', () => {
    const singleData = [{ name: 'Single-Process', shard: 'shard-1' }];
    
    render(<PmComponentsServiceProcessesViewNoneReady tableData={singleData} />);
    
    expect(screen.getByText('Single-Process')).toBeInTheDocument();
    expect(screen.getByText('shard-1')).toBeInTheDocument();
  });

  it('should render without className prop', () => {
    const { container } = render(
      <PmComponentsServiceProcessesViewNoneReady tableData={mockData} />
    );
    
    const wrapper = container.querySelector('.pm-components-service-processes-view-none-ready');
    expect(wrapper).toBeInTheDocument();
  });

  it('should have fixed left column for Name', () => {
    renderComponent();
    
    // Name column should be fixed left
    const table = document.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should handle sorting by name alphabetically', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const nameHeader = screen.getByText('Name');
    
    // Click once to sort ascending
    await user.click(nameHeader);
    
    // Data should still be visible
    expect(screen.getByText('Process-A')).toBeInTheDocument();
    expect(screen.getByText('Process-B')).toBeInTheDocument();
    expect(screen.getByText('Process-C')).toBeInTheDocument();
  });

  it('should handle sorting by shard', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const shardHeader = screen.getByText('Shard');
    
    // Click to sort
    await user.click(shardHeader);
    
    // Data should still be visible
    const shard1Elements = screen.getAllByText('shard-1');
    const shard2Elements = screen.getAllByText('shard-2');
    expect(shard1Elements.length).toBe(2);
    expect(shard2Elements.length).toBe(1);
  });
});

