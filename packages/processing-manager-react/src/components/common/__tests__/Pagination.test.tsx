/**
 * Tests for Pagination Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination';

describe('Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    const { container } = render(<Pagination />);
    
    expect(container.querySelector('.pagination')).toBeInTheDocument();
  });

  it('should show First and Prev buttons when not on first page', () => {
    render(<Pagination firstPage={false} />);
    
    expect(screen.getByRole('button', { name: /First/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Prev/i })).toBeInTheDocument();
  });

  it('should hide First and Prev buttons when on first page', () => {
    render(<Pagination firstPage={true} />);
    
    expect(screen.queryByRole('button', { name: /First/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Prev/i })).not.toBeInTheDocument();
  });

  it('should show Next and Last buttons when not on last page', () => {
    render(<Pagination lastPage={false} />);
    
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Last/i })).toBeInTheDocument();
  });

  it('should hide Next and Last buttons when on last page', () => {
    render(<Pagination lastPage={true} />);
    
    expect(screen.queryByRole('button', { name: /Next/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Last/i })).not.toBeInTheDocument();
  });

  it('should render page size selector', () => {
    render(<Pagination />);
    
    expect(screen.getByText('25/page')).toBeInTheDocument();
  });

  it('should have default page size of 25', () => {
    render(<Pagination />);
    
    expect(screen.getByText('25/page')).toBeInTheDocument();
  });

  it('should call onChange when First button is clicked', () => {
    const onChange = vi.fn();
    render(<Pagination firstPage={false} onChange={onChange} />);
    
    const firstButton = screen.getByRole('button', { name: /First/i });
    fireEvent.click(firstButton);
    
    expect(onChange).toHaveBeenCalledWith({
      pageSize: 25,
      requestLast: false,
      nextCursor: null,
      prevCursor: null,
    });
  });

  it('should call onChange when Prev button is clicked', () => {
    const onChange = vi.fn();
    render(<Pagination firstPage={false} prevCursor="prev123" onChange={onChange} />);
    
    const prevButton = screen.getByRole('button', { name: /Prev/i });
    fireEvent.click(prevButton);
    
    expect(onChange).toHaveBeenCalledWith({
      pageSize: 25,
      requestLast: false,
      nextCursor: null,
      prevCursor: 'prev123',
    });
  });

  it('should call onChange when Next button is clicked', () => {
    const onChange = vi.fn();
    render(<Pagination lastPage={false} nextCursor="next123" onChange={onChange} />);
    
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);
    
    expect(onChange).toHaveBeenCalledWith({
      pageSize: 25,
      requestLast: false,
      nextCursor: 'next123',
      prevCursor: null,
    });
  });

  it('should call onChange when Last button is clicked', () => {
    const onChange = vi.fn();
    render(<Pagination lastPage={false} onChange={onChange} />);
    
    const lastButton = screen.getByRole('button', { name: /Last/i });
    fireEvent.click(lastButton);
    
    expect(onChange).toHaveBeenCalledWith({
      pageSize: 25,
      requestLast: true,
      nextCursor: null,
      prevCursor: null,
    });
  });

  it('should call onChange when page size is changed', () => {
    const onChange = vi.fn();
    render(<Pagination onChange={onChange} />);
    
    const select = screen.getByText('25/page');
    fireEvent.mouseDown(select);
    
    const option50 = screen.getByText('50/page');
    fireEvent.click(option50);
    
    expect(onChange).toHaveBeenCalledWith({
      pageSize: 50,
      requestLast: false,
      nextCursor: null,
      prevCursor: null,
    });
  });

  it('should have all page size options', () => {
    render(<Pagination />);

    const select = screen.getAllByText('25/page')[0];
    fireEvent.mouseDown(select);

    expect(screen.getByText('10/page')).toBeInTheDocument();
    expect(screen.getAllByText('25/page').length).toBeGreaterThan(0);
    expect(screen.getByText('50/page')).toBeInTheDocument();
    expect(screen.getByText('100/page')).toBeInTheDocument();
    expect(screen.getByText('200/page')).toBeInTheDocument();
    expect(screen.getByText('500/page')).toBeInTheDocument();
  });

  it('should handle missing onChange prop', () => {
    render(<Pagination firstPage={false} />);
    
    const firstButton = screen.getByRole('button', { name: /First/i });
    fireEvent.click(firstButton);
    
    // Should not throw error
    expect(firstButton).toBeInTheDocument();
  });

  it('should use default props when not provided', () => {
    render(<Pagination />);
    
    // Should show Next and Last (not on last page by default)
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Last/i })).toBeInTheDocument();
  });

  it('should have primary buttons', () => {
    render(<Pagination firstPage={false} lastPage={false} />);
    
    const firstButton = screen.getByRole('button', { name: /First/i });
    expect(firstButton).toHaveClass('ant-btn-primary');
  });

  it('should have correct icons on buttons', () => {
    render(<Pagination firstPage={false} lastPage={false} />);
    
    const firstButton = screen.getByRole('button', { name: /First/i });
    const prevButton = screen.getByRole('button', { name: /Prev/i });
    const nextButton = screen.getByRole('button', { name: /Next/i });
    const lastButton = screen.getByRole('button', { name: /Last/i });
    
    expect(firstButton.querySelector('.anticon-double-left')).toBeInTheDocument();
    expect(prevButton.querySelector('.anticon-left')).toBeInTheDocument();
    expect(nextButton.querySelector('.anticon-right')).toBeInTheDocument();
    expect(lastButton.querySelector('.anticon-double-right')).toBeInTheDocument();
  });

  it('should render with pagination class', () => {
    const { container } = render(<Pagination />);
    
    expect(container.querySelector('.pagination')).toBeInTheDocument();
  });

  it('should render with row class', () => {
    const { container } = render(<Pagination />);
    
    expect(container.querySelector('.row')).toBeInTheDocument();
  });

  it('should use Space component for layout', () => {
    const { container } = render(<Pagination />);
    
    expect(container.querySelector('.ant-space')).toBeInTheDocument();
  });

  it('should handle empty cursors', () => {
    const onChange = vi.fn();
    render(<Pagination firstPage={false} nextCursor="" prevCursor="" onChange={onChange} />);
    
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);
    
    expect(onChange).toHaveBeenCalledWith({
      pageSize: 25,
      requestLast: false,
      nextCursor: '',
      prevCursor: null,
    });
  });

  it('should update internal state when navigating', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Pagination firstPage={false} onChange={onChange} />);
    
    const firstButton = screen.getByRole('button', { name: /First/i });
    fireEvent.click(firstButton);
    
    expect(onChange).toHaveBeenCalledTimes(1);
    
    rerender(<Pagination firstPage={false} onChange={onChange} />);
    
    const prevButton = screen.getByRole('button', { name: /Prev/i });
    fireEvent.click(prevButton);
    
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('should maintain page size when navigating', () => {
    const onChange = vi.fn();
    render(<Pagination firstPage={false} onChange={onChange} />);
    
    // Change page size first
    const select = screen.getByText('25/page');
    fireEvent.mouseDown(select);
    const option100 = screen.getByText('100/page');
    fireEvent.click(option100);
    
    // Then navigate
    const firstButton = screen.getByRole('button', { name: /First/i });
    fireEvent.click(firstButton);
    
    expect(onChange).toHaveBeenLastCalledWith({
      pageSize: 100,
      requestLast: false,
      nextCursor: null,
      prevCursor: null,
    });
  });

  it('should have page-size class on select', () => {
    const { container } = render(<Pagination />);
    
    expect(container.querySelector('.page-size')).toBeInTheDocument();
  });
});

