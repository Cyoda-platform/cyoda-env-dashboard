/**
 * HttpParametersEditor Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HttpParametersEditor from '../HttpParametersEditor';
import type { HttpParameterDto } from '../../../../types';

describe('HttpParametersEditor', () => {
  const mockOnChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<HttpParametersEditor parameters={[]} onChange={mockOnChange} />);
    expect(screen.getByText('Add Parameter')).toBeInTheDocument();
  });

  it('displays existing parameters', () => {
    const parameters: HttpParameterDto[] = [
      {
        type: 'REQUEST_PARAM',
        name: 'userId',
        required: true,
        defaultValue: '123',
        secure: false,
      },
    ];

    render(<HttpParametersEditor parameters={parameters} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('userId')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123')).toBeInTheDocument();
  });

  it('adds a new parameter', async () => {
    const user = userEvent.setup();
    render(<HttpParametersEditor parameters={[]} onChange={mockOnChange} />);

    const addButton = screen.getByText('Add Parameter');
    await user.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        type: 'REQUEST_PARAM',
        name: '',
        required: false,
        defaultValue: '',
        secure: false,
        excludeFromCacheKey: false,
      },
    ]);
  });

  it('updates parameter name', async () => {
    const user = userEvent.setup();
    const parameters: HttpParameterDto[] = [
      {
        type: 'REQUEST_PARAM',
        name: 'oldName',
        required: false,
        defaultValue: '',
        secure: false,
      },
    ];

    render(<HttpParametersEditor parameters={parameters} onChange={mockOnChange} />);

    const nameInput = screen.getByDisplayValue('oldName');
    await user.clear(nameInput);
    await user.type(nameInput, 'newName');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('toggles required switch', async () => {
    const user = userEvent.setup();
    const parameters: HttpParameterDto[] = [
      {
        type: 'REQUEST_PARAM',
        name: 'param1',
        required: false,
        defaultValue: '',
        secure: false,
      },
    ];

    render(<HttpParametersEditor parameters={parameters} onChange={mockOnChange} />);

    const requiredSwitch = screen.getByRole('switch', { name: /required/i });
    await user.click(requiredSwitch);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('toggles secure switch', async () => {
    const user = userEvent.setup();
    const parameters: HttpParameterDto[] = [
      {
        type: 'REQUEST_PARAM',
        name: 'param1',
        required: false,
        defaultValue: '',
        secure: false,
      },
    ];

    render(<HttpParametersEditor parameters={parameters} onChange={mockOnChange} />);

    const secureSwitch = screen.getByRole('switch', { name: /secure/i });
    await user.click(secureSwitch);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('deletes a parameter', async () => {
    const user = userEvent.setup();
    const parameters: HttpParameterDto[] = [
      {
        type: 'REQUEST_PARAM',
        name: 'param1',
        required: false,
        defaultValue: '',
        secure: false,
      },
    ];

    render(<HttpParametersEditor parameters={parameters} onChange={mockOnChange} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByText('Delete');
    await user.click(confirmButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('displays multiple parameters', () => {
    const parameters: HttpParameterDto[] = [
      {
        type: 'REQUEST_PARAM',
        name: 'param1',
        required: true,
        defaultValue: 'value1',
        secure: false,
      },
      {
        type: 'PATH_VARIABLE',
        name: 'param2',
        required: false,
        defaultValue: 'value2',
        secure: true,
      },
    ];

    render(<HttpParametersEditor parameters={parameters} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('param1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('param2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('value1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('value2')).toBeInTheDocument();
  });

  it('handles empty parameters array', () => {
    render(<HttpParametersEditor parameters={[]} onChange={mockOnChange} />);
    expect(screen.getByText('Add Parameter')).toBeInTheDocument();
  });
});

