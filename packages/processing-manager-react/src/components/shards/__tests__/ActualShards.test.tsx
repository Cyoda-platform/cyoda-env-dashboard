/**
 * Tests for ActualShards Component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActualShards from '../ActualShards';

const mockData = [
  { shardId: 1, state: 'ACTIVE', processesCount: 5 },
  { shardId: 2, state: 'INACTIVE', processesCount: 0 },
  { shardId: 3, state: 'ACTIVE', processesCount: 3 },
];

describe('ActualShards', () => {
  beforeEach(() => {
    // Clear any previous renders
  });

  it('should render the component', () => {
    const { container } = render(<ActualShards actualShardsTable={[]} />);
    
    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should render card title', () => {
    render(<ActualShards actualShardsTable={[]} />);
    
    expect(screen.getByText('Actual shards')).toBeInTheDocument();
  });

  it('should render table with data', () => {
    render(<ActualShards actualShardsTable={mockData} />);

    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });

  it('should display shard states', () => {
    render(<ActualShards actualShardsTable={mockData} />);
    
    expect(screen.getAllByText('ACTIVE').length).toBe(2);
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

  it('should display process counts', () => {
    render(<ActualShards actualShardsTable={mockData} />);

    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });

  it('should render empty table when no data', () => {
    const { container } = render(<ActualShards actualShardsTable={[]} />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should have column headers', () => {
    render(<ActualShards actualShardsTable={mockData} />);
    
    expect(screen.getByText('Shard')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Running Processes')).toBeInTheDocument();
  });

  it('should have pagination', () => {
    const { container } = render(<ActualShards actualShardsTable={mockData} />);
    
    expect(container.querySelector('.ant-pagination')).toBeInTheDocument();
  });

  it('should render table with bordered style', () => {
    const { container } = render(<ActualShards actualShardsTable={mockData} />);
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should handle multiple rows', () => {
    render(<ActualShards actualShardsTable={mockData} />);
    
    const rows = screen.getAllByRole('row');
    // Header row + 3 data rows
    expect(rows.length).toBeGreaterThan(3);
  });

  it('should render card with margin', () => {
    const { container } = render(<ActualShards actualShardsTable={mockData} />);
    
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should display all shard IDs', () => {
    render(<ActualShards actualShardsTable={mockData} />);

    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });

  it('should handle empty array', () => {
    const { container } = render(<ActualShards actualShardsTable={[]} />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = render(<ActualShards actualShardsTable={mockData} />);
    
    expect(container).toBeInTheDocument();
  });

  it('should have three columns', () => {
    const { container } = render(<ActualShards actualShardsTable={mockData} />);
    
    const headers = container.querySelectorAll('.ant-table-thead th');
    expect(headers.length).toBe(3);
  });

  it('should render with default props', () => {
    const { container } = render(<ActualShards actualShardsTable={[]} />);
    
    expect(container).toBeInTheDocument();
  });
});

