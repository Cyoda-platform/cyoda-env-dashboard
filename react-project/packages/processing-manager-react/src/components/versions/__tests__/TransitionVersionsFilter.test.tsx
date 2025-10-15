import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import TransitionVersionsFilter from '../TransitionVersionsFilter';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useTransactionStatuses: vi.fn(),
}));

describe('TransitionVersionsFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (hooks.useTransactionStatuses as any).mockReturnValue({
      data: [
        { id: 'PENDING', name: 'Pending' },
        { id: 'COMPLETED', name: 'Completed' },
      ],
    });
  });

  it('should render the component', () => {
    render(
      <BrowserRouter>
        <TransitionVersionsFilter />
      </BrowserRouter>
    );

    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    render(
      <BrowserRouter>
        <TransitionVersionsFilter />
      </BrowserRouter>
    );

    expect(screen.getByText('Date From')).toBeInTheDocument();
    expect(screen.getByText('Date To')).toBeInTheDocument();
    expect(screen.getByText('Action Type')).toBeInTheDocument();
    expect(screen.getByText('Sort')).toBeInTheDocument();
  });

  it('should render Load button', () => {
    render(
      <BrowserRouter>
        <TransitionVersionsFilter />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
  });

  it('should have default values', () => {
    render(
      <BrowserRouter>
        <TransitionVersionsFilter />
      </BrowserRouter>
    );

    // Action Type should default to ALL
    const actionTypeSelect = screen.getByText('ALL');
    expect(actionTypeSelect).toBeInTheDocument();

    // Sort should default to Asc
    const sortSelect = screen.getByText('Asc');
    expect(sortSelect).toBeInTheDocument();
  });

  it('should call onChange on mount with initial values', async () => {
    render(
      <BrowserRouter>
        <TransitionVersionsFilter onChange={mockOnChange} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionId: '',
          status: '',
          sort: 'ASC',
          actionTypeStr: 'ALL',
        })
      );
    });
  });

  it('should call onChange when Load button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <TransitionVersionsFilter onChange={mockOnChange} />
      </BrowserRouter>
    );

    // Clear the initial call
    mockOnChange.mockClear();

    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should show loading state on Load button', () => {
    render(
      <BrowserRouter>
        <TransitionVersionsFilter isLoading={true} />
      </BrowserRouter>
    );

    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).toHaveClass('ant-btn-loading');
  });

  it('should render Action Type dropdown options', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <TransitionVersionsFilter />
      </BrowserRouter>
    );

    // Click on Action Type select to open dropdown
    const actionTypeSelect = screen.getByText('ALL');
    await user.click(actionTypeSelect);

    // Wait for dropdown options to appear
    await waitFor(() => {
      const allOptions = screen.getAllByText('ALL');
      expect(allOptions.length).toBeGreaterThan(0);
    });
  });

  it('should render Sort dropdown options', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <TransitionVersionsFilter />
      </BrowserRouter>
    );

    // Click on Sort select to open dropdown
    const sortSelect = screen.getByText('Asc');
    await user.click(sortSelect);

    // Wait for dropdown options to appear
    await waitFor(() => {
      const ascOptions = screen.getAllByText('Asc');
      expect(ascOptions.length).toBeGreaterThan(0);
    });
  });

  it('should render Date From picker', () => {
    render(
      <BrowserRouter>
        <TransitionVersionsFilter />
      </BrowserRouter>
    );

    const dateFromInputs = screen.getAllByPlaceholderText('Pick a day');
    expect(dateFromInputs.length).toBeGreaterThan(0);
  });

  it('should render Date To picker', () => {
    render(
      <BrowserRouter>
        <TransitionVersionsFilter />
      </BrowserRouter>
    );

    const dateToInputs = screen.getAllByPlaceholderText('Pick a day');
    expect(dateToInputs.length).toBe(2); // Both Date From and Date To
  });

  it('should have transition-versions-filter class', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionVersionsFilter />
      </BrowserRouter>
    );

    const filterForm = container.querySelector('.transition-versions-filter');
    expect(filterForm).toBeInTheDocument();
  });

  it('should render inside a Card', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionVersionsFilter />
      </BrowserRouter>
    );

    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should call useTransactionStatuses hook', () => {
    render(
      <BrowserRouter>
        <TransitionVersionsFilter />
      </BrowserRouter>
    );

    expect(hooks.useTransactionStatuses).toHaveBeenCalled();
  });

  it('should handle onChange prop being undefined', () => {
    expect(() => {
      render(
        <BrowserRouter>
          <TransitionVersionsFilter />
        </BrowserRouter>
      );
    }).not.toThrow();
  });

  it('should have action-item class on Load button column', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionVersionsFilter />
      </BrowserRouter>
    );

    const actionItem = container.querySelector('.action-item');
    expect(actionItem).toBeInTheDocument();
  });

  it('should render with default isLoading as false', () => {
    render(
      <BrowserRouter>
        <TransitionVersionsFilter />
      </BrowserRouter>
    );

    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).not.toHaveClass('ant-btn-loading');
  });
});

