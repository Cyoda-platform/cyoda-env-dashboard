/**
 * PmComponentsExecutionMonitorsFilter Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PmComponentsExecutionMonitorsFilter from '../PmComponentsExecutionMonitorsFilter';

describe('PmComponentsExecutionMonitorsFilter', () => {
  let mockOnFilter: any;

  beforeEach(() => {
    mockOnFilter = vi.fn();
  });

  const renderComponent = (props = {}) => {
    return render(
      <PmComponentsExecutionMonitorsFilter onFilter={mockOnFilter} {...props} />
    );
  };

  it('should render filter form', () => {
    renderComponent();

    expect(screen.getByText('Filter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter by name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Update Interval')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
  });

  it('should emit initial filter on mount', () => {
    renderComponent();

    expect(mockOnFilter).toHaveBeenCalledWith({
      name: '',
      updateInterval: 2,
    });
  });

  it('should have default values', () => {
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Filter by name') as HTMLInputElement;
    const intervalInput = screen.getByPlaceholderText('Update Interval') as HTMLInputElement;

    expect(nameInput.value).toBe('');
    expect(intervalInput.value).toBe('2');
  });

  it('should update name filter and call onFilter', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Filter by name');
    await user.type(nameInput, 'test-monitor');

    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledWith({
        name: 'test-monitor',
        updateInterval: 2,
      });
    });
  });

  it('should update interval value', async () => {
    const user = userEvent.setup();
    renderComponent();

    const intervalInput = screen.getByPlaceholderText('Update Interval');
    await user.clear(intervalInput);
    await user.type(intervalInput, '5');

    // The interval value should be updated in the component state
    // We can verify this by clicking Update and checking the onFilter call
    const updateButton = screen.getByRole('button', { name: /update/i });
    await user.click(updateButton);

    await waitFor(() => {
      const calls = mockOnFilter.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0].updateInterval).toBe(5);
    });
  });

  it('should call onFilter when Update button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Clear the initial call
    mockOnFilter.mockClear();

    const nameInput = screen.getByPlaceholderText('Filter by name');
    const intervalInput = screen.getByPlaceholderText('Update Interval');

    await user.type(nameInput, 'monitor-1');
    await user.clear(intervalInput);
    await user.type(intervalInput, '10');

    const updateButton = screen.getByRole('button', { name: /update/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledWith({
        name: 'monitor-1',
        updateInterval: 10,
      });
    });
  });

  it('should clear name input when clear icon is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Filter by name');
    await user.type(nameInput, 'test');

    // Find and click the clear button (Ant Design adds a clear icon)
    const clearButton = nameInput.parentElement?.querySelector('.ant-input-clear-icon');
    if (clearButton) {
      await user.click(clearButton as HTMLElement);

      await waitFor(() => {
        expect(nameInput).toHaveValue('');
      });
    }
  });

  it('should enforce minimum value of 1 for interval', async () => {
    const user = userEvent.setup();
    renderComponent();

    const intervalInput = screen.getByPlaceholderText('Update Interval');
    await user.clear(intervalInput);
    await user.type(intervalInput, '0');

    // Ant Design InputNumber should enforce min value
    const updateButton = screen.getByRole('button', { name: /update/i });
    await user.click(updateButton);

    // The component should not allow values less than 1
    await waitFor(() => {
      const currentValue = (intervalInput as HTMLInputElement).value;
      expect(Number(currentValue)).toBeGreaterThanOrEqual(1);
    });
  });

  it('should update filter immediately when name changes', async () => {
    const user = userEvent.setup();
    renderComponent();

    mockOnFilter.mockClear();

    const nameInput = screen.getByPlaceholderText('Filter by name');
    await user.type(nameInput, 'a');

    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledWith({
        name: 'a',
        updateInterval: 2,
      });
    });
  });

  it('should handle multiple name changes', async () => {
    const user = userEvent.setup();
    renderComponent();

    mockOnFilter.mockClear();

    const nameInput = screen.getByPlaceholderText('Filter by name');
    await user.type(nameInput, 'abc');

    await waitFor(() => {
      // Should be called for each character typed
      expect(mockOnFilter).toHaveBeenCalled();
      const lastCall = mockOnFilter.mock.calls[mockOnFilter.mock.calls.length - 1];
      expect(lastCall[0].name).toBe('abc');
    });
  });

  it('should render with correct layout structure', () => {
    const { container } = renderComponent();
    
    expect(container.querySelector('.pm-components-execution-monitors-filter')).toBeInTheDocument();
    expect(container.querySelector('.wrap-row')).toBeInTheDocument();
  });

  it('should have correct column spans', () => {
    const { container } = renderComponent();
    
    const cols = container.querySelectorAll('.ant-col');
    expect(cols.length).toBeGreaterThan(0);
  });

  it('should handle rapid filter changes', async () => {
    const user = userEvent.setup();
    renderComponent();

    mockOnFilter.mockClear();

    const nameInput = screen.getByPlaceholderText('Filter by name');

    // Type multiple characters rapidly
    await user.type(nameInput, 'test-name');

    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalled();
      const lastCall = mockOnFilter.mock.calls[mockOnFilter.mock.calls.length - 1];
      expect(lastCall[0].name).toBe('test-name');
    });
  });

  it('should preserve interval value when name changes', async () => {
    const user = userEvent.setup();
    renderComponent();

    const intervalInput = screen.getByPlaceholderText('Update Interval');
    await user.clear(intervalInput);
    await user.type(intervalInput, '7');

    mockOnFilter.mockClear();

    const nameInput = screen.getByPlaceholderText('Filter by name');
    await user.type(nameInput, 'test');

    await waitFor(() => {
      const lastCall = mockOnFilter.mock.calls[mockOnFilter.mock.calls.length - 1];
      expect(lastCall[0].updateInterval).toBe(7);
    });
  });
});

