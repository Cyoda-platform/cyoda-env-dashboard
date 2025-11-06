/**
 * Tests for PendingTasksCount Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PendingTasksCount from '../PendingTasksCount';

describe('PendingTasksCount', () => {
  it('should render the component', () => {
    const { container } = render(<PendingTasksCount pendingTaskCount={0} />);
    
    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should render card title', () => {
    render(<PendingTasksCount pendingTaskCount={0} />);
    
    expect(screen.getByText('Pending Tasks count')).toBeInTheDocument();
  });

  it('should display pending task count', () => {
    render(<PendingTasksCount pendingTaskCount={42} />);
    
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should display zero count', () => {
    render(<PendingTasksCount pendingTaskCount={0} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should display large numbers', () => {
    render(<PendingTasksCount pendingTaskCount={1000} />);
    
    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  it('should render statistic component', () => {
    const { container } = render(<PendingTasksCount pendingTaskCount={10} />);
    
    expect(container.querySelector('.ant-statistic')).toBeInTheDocument();
  });

  it('should render card with margin', () => {
    const { container } = render(<PendingTasksCount pendingTaskCount={5} />);
    
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should handle negative numbers', () => {
    render(<PendingTasksCount pendingTaskCount={-1} />);
    
    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = render(<PendingTasksCount pendingTaskCount={100} />);
    
    expect(container).toBeInTheDocument();
  });

  it('should display single digit numbers', () => {
    render(<PendingTasksCount pendingTaskCount={5} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should display double digit numbers', () => {
    render(<PendingTasksCount pendingTaskCount={99} />);
    
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('should display triple digit numbers', () => {
    render(<PendingTasksCount pendingTaskCount={999} />);
    
    expect(screen.getByText('999')).toBeInTheDocument();
  });

  it('should render card and statistic together', () => {
    const { container } = render(<PendingTasksCount pendingTaskCount={25} />);
    
    expect(container.querySelector('.ant-card')).toBeInTheDocument();
    expect(container.querySelector('.ant-statistic')).toBeInTheDocument();
  });
});

