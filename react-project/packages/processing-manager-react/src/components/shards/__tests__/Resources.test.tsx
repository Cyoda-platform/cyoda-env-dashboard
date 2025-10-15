/**
 * Tests for Resources Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Resources from '../Resources';

const mockPoolInfo = [
  { type: 'cpu', available: 8, poolSize: 10, size: 10 },
  { type: 'memory', available: 2, poolSize: 16, size: 16 },
  { type: 'disk', available: 50, poolSize: 100, size: 100 },
];

describe('Resources', () => {
  it('should render the component', () => {
    const { container } = render(<Resources poolInfo={[]} />);
    
    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should render card title', () => {
    render(<Resources poolInfo={[]} />);
    
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });

  it('should render progress bars for each resource', () => {
    const { container } = render(<Resources poolInfo={mockPoolInfo} />);
    
    const progressBars = container.querySelectorAll('.ant-progress');
    expect(progressBars.length).toBe(3);
  });

  it('should capitalize resource type names', () => {
    render(<Resources poolInfo={mockPoolInfo} />);
    
    expect(screen.getByText('Cpu')).toBeInTheDocument();
    expect(screen.getByText('Memory')).toBeInTheDocument();
    expect(screen.getByText('Disk')).toBeInTheDocument();
  });

  it('should display available/poolSize labels', () => {
    render(<Resources poolInfo={mockPoolInfo} />);
    
    expect(screen.getByText('8/10')).toBeInTheDocument();
    expect(screen.getByText('2/16')).toBeInTheDocument();
    expect(screen.getByText('50/100')).toBeInTheDocument();
  });

  it('should display size values', () => {
    render(<Resources poolInfo={mockPoolInfo} />);
    
    // Size values are displayed as bold text
    const { container } = render(<Resources poolInfo={mockPoolInfo} />);
    const boldElements = container.querySelectorAll('.bold');
    expect(boldElements.length).toBe(3);
  });

  it('should render empty when no pool info', () => {
    const { container } = render(<Resources poolInfo={[]} />);
    
    const progressBars = container.querySelectorAll('.ant-progress');
    expect(progressBars.length).toBe(0);
  });

  it('should render card with margin', () => {
    const { container } = render(<Resources poolInfo={mockPoolInfo} />);
    
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should render progress containers', () => {
    const { container } = render(<Resources poolInfo={mockPoolInfo} />);
    
    const containers = container.querySelectorAll('.progress-container');
    expect(containers.length).toBe(3);
  });

  it('should render without errors', () => {
    const { container } = render(<Resources poolInfo={mockPoolInfo} />);
    
    expect(container).toBeInTheDocument();
  });

  it('should handle single resource', () => {
    const singleResource = [{ type: 'cpu', available: 5, poolSize: 10, size: 10 }];
    const { container } = render(<Resources poolInfo={singleResource} />);
    
    const progressBars = container.querySelectorAll('.ant-progress');
    expect(progressBars.length).toBe(1);
  });

  it('should display resource titles', () => {
    const { container } = render(<Resources poolInfo={mockPoolInfo} />);
    
    const titles = container.querySelectorAll('.title');
    expect(titles.length).toBe(3);
  });

  it('should display labels section', () => {
    const { container } = render(<Resources poolInfo={mockPoolInfo} />);
    
    const labels = container.querySelectorAll('.labels');
    expect(labels.length).toBe(3);
  });

  it('should handle zero available resources', () => {
    const zeroResource = [{ type: 'cpu', available: 0, poolSize: 10, size: 10 }];
    render(<Resources poolInfo={zeroResource} />);
    
    expect(screen.getByText('0/10')).toBeInTheDocument();
  });

  it('should handle full pool', () => {
    const fullResource = [{ type: 'memory', available: 16, poolSize: 16, size: 16 }];
    render(<Resources poolInfo={fullResource} />);
    
    expect(screen.getByText('16/16')).toBeInTheDocument();
  });

  it('should render multiple resource types', () => {
    render(<Resources poolInfo={mockPoolInfo} />);
    
    expect(screen.getByText('Cpu')).toBeInTheDocument();
    expect(screen.getByText('Memory')).toBeInTheDocument();
    expect(screen.getByText('Disk')).toBeInTheDocument();
  });

  it('should handle different pool sizes', () => {
    const resources = [
      { type: 'small', available: 1, poolSize: 5, size: 5 },
      { type: 'large', available: 50, poolSize: 100, size: 100 },
    ];
    render(<Resources poolInfo={resources} />);
    
    expect(screen.getByText('1/5')).toBeInTheDocument();
    expect(screen.getByText('50/100')).toBeInTheDocument();
  });

  it('should capitalize first letter only', () => {
    const resource = [{ type: 'networkBandwidth', available: 5, poolSize: 10, size: 10 }];
    render(<Resources poolInfo={resource} />);
    
    expect(screen.getByText('NetworkBandwidth')).toBeInTheDocument();
  });
});

