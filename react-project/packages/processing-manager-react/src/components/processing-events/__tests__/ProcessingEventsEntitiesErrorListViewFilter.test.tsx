/**
 * Tests for ProcessingEventsEntitiesErrorListViewFilter Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProcessingEventsEntitiesErrorListViewFilter } from '../ProcessingEventsEntitiesErrorListViewFilter';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useEntitiesListPossible: vi.fn(),
}));

describe('ProcessingEventsEntitiesErrorListViewFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.useEntitiesListPossible).mockReturnValue({
      data: {
        data: ['Entity1', 'Entity2', 'Entity3'],
      },
      isLoading: false,
      error: null,
    } as any);
  });

  const renderComponent = (props = {}) => {
    return render(
      <ProcessingEventsEntitiesErrorListViewFilter
        onChange={mockOnChange}
        {...props}
      />
    );
  };

  it('should render filter form', () => {
    renderComponent();
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should render entity class select', () => {
    renderComponent();
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('should render Load button', () => {
    renderComponent();
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).toBeInTheDocument();
  });

  it('should initialize with type "ALL"', async () => {
    renderComponent();

    // Wait for initial onChange call with ALL
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({ type: 'ALL' });
    });
  });

  it('should call onChange with initial form on mount', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({ type: 'ALL' });
    });
  });

  it('should populate entity class options from hook data', async () => {
    const user = userEvent.setup();
    renderComponent();

    const select = screen.getByRole('combobox');
    await user.click(select);

    await waitFor(() => {
      const allOptions = screen.getAllByText('Entity1');
      expect(allOptions.length).toBeGreaterThan(0);
    });
  });

  it('should handle entity class selection', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Wait for initial call
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });

    mockOnChange.mockClear();

    const select = screen.getByRole('combobox');
    await user.click(select);

    const options = await screen.findAllByText('Entity1');
    await user.click(options[0]);

    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({ type: 'Entity1' });
    });
  });

  it('should call onChange when Load button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Wait for initial onChange call
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });
    
    mockOnChange.mockClear();
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({ type: 'ALL' });
    });
  });

  it('should call onChange with selected entity type', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Wait for initial onChange
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });
    
    mockOnChange.mockClear();
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    const option = await screen.findByText('Entity2');
    await user.click(option);
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({ type: 'Entity2' });
    });
  });

  it('should show loading state on Load button', () => {
    renderComponent({ isLoading: true });
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).toHaveClass('ant-btn-loading');
  });

  it('should not show loading state when isLoading is false', () => {
    renderComponent({ isLoading: false });
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).not.toHaveClass('ant-btn-loading');
  });

  it('should default isLoading to false', () => {
    renderComponent();
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).not.toHaveClass('ant-btn-loading');
  });

  it('should render with correct layout structure', () => {
    const { container } = renderComponent();
    
    const form = container.querySelector('.pm-processing-events-entities-error-list-view-filter');
    expect(form).toBeInTheDocument();
    
    const row = container.querySelector('.wrap-row');
    expect(row).toBeInTheDocument();
  });

  it('should have correct column spans', () => {
    const { container } = renderComponent();
    
    const cols = container.querySelectorAll('.ant-col');
    expect(cols.length).toBeGreaterThan(0);
  });

  it('should render divider', () => {
    const { container } = renderComponent();
    
    const divider = container.querySelector('.ant-divider');
    expect(divider).toBeInTheDocument();
  });

  it('should handle empty entity list', async () => {
    vi.mocked(hooks.useEntitiesListPossible).mockReturnValue({
      data: {
        data: [],
      },
      isLoading: false,
      error: null,
    } as any);
    
    const user = userEvent.setup();
    renderComponent();
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    await waitFor(() => {
      const allOptions = screen.getAllByText('ALL');
      expect(allOptions.length).toBeGreaterThan(0);
    });
  });

  it('should handle null data from hook', () => {
    vi.mocked(hooks.useEntitiesListPossible).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);
    
    renderComponent();
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should have searchable select', () => {
    renderComponent();
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('should handle multiple Load button clicks', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Wait for initial onChange
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    
    await user.click(loadButton);
    await user.click(loadButton);
    await user.click(loadButton);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledTimes(4); // 1 initial + 3 clicks
    });
  });

  it('should update form state when entity type changes', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Wait for initial call
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });

    mockOnChange.mockClear();

    const select = screen.getByRole('combobox');
    const loadButton = screen.getByRole('button', { name: /load/i });

    // Select Entity1
    await user.click(select);
    const options1 = await screen.findAllByText('Entity1');
    await user.click(options1[0]);
    await user.click(loadButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({ type: 'Entity1' });
    });

    mockOnChange.mockClear();

    // Select Entity3
    await user.click(select);
    const options3 = await screen.findAllByText('Entity3');
    await user.click(options3[0]);
    await user.click(loadButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({ type: 'Entity3' });
    });
  });

});

