/**
 * HeadersEditor Component Tests
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HeadersEditor from '../HeadersEditor';

describe('HeadersEditor', () => {
  const mockOnChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<HeadersEditor headers={{}} onChange={mockOnChange} />);
    expect(screen.getByText('Add Header')).toBeInTheDocument();
  });

  it('displays existing headers', () => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token123',
    };

    render(<HeadersEditor headers={headers} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('Content-Type')).toBeInTheDocument();
    expect(screen.getByDisplayValue('application/json')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Authorization')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bearer token123')).toBeInTheDocument();
  });

  it('adds a new header', () => {
    render(<HeadersEditor headers={{}} onChange={mockOnChange} />);

    const addButton = screen.getByText('Add Header');
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith({ '': '' });
  });

  it('updates header key', () => {
    const headers = { 'Old-Key': 'value' };
    render(<HeadersEditor headers={headers} onChange={mockOnChange} />);

    const keyInput = screen.getByDisplayValue('Old-Key');
    fireEvent.change(keyInput, { target: { value: 'New-Key' } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('updates header value', () => {
    const headers = { 'Content-Type': 'text/plain' };
    render(<HeadersEditor headers={headers} onChange={mockOnChange} />);

    const valueInput = screen.getByDisplayValue('text/plain');
    fireEvent.change(valueInput, { target: { value: 'application/json' } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('shows delete button for headers', () => {
    const headers = { 'Content-Type': 'application/json' };
    render(<HeadersEditor headers={headers} onChange={mockOnChange} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('handles empty headers object', () => {
    render(<HeadersEditor headers={{}} onChange={mockOnChange} />);
    expect(screen.getByText('Add Header')).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeInTheDocument();
  });

  it('displays multiple headers', () => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token',
      'X-Custom-Header': 'custom-value',
    };

    render(<HeadersEditor headers={headers} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('Content-Type')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Authorization')).toBeInTheDocument();
    expect(screen.getByDisplayValue('X-Custom-Header')).toBeInTheDocument();
  });

});

