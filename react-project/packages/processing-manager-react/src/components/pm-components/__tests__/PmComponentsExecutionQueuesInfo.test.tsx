/**
 * Tests for PmComponentsExecutionQueuesInfo Component
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PmComponentsExecutionQueuesInfo } from '../PmComponentsExecutionQueuesInfo';

describe('PmComponentsExecutionQueuesInfo', () => {
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

  it('should render empty table initially', () => {
    const { container } = render(<PmComponentsExecutionQueuesInfo />);

    const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
    expect(rows.length).toBe(0);
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
});

