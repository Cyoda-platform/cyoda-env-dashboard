import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import TransitionStateMachineForm from '../TransitionStateMachineForm';
import * as hooks from '../../../hooks/useProcessing';

// Mock the hooks
vi.mock('../../../hooks/useProcessing', () => ({
  useManualTransition: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: vi.fn(),
  };
});

const mockUseSearchParams = vi.mocked(
  (await import('react-router-dom')).useSearchParams
);

const mockPossibleTransitions = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];

describe('TransitionStateMachineForm', () => {
  const mockMutateAsync = vi.fn();
  const mockOnUpdated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSearchParams = new URLSearchParams('type=Order&entityId=123');
    mockUseSearchParams.mockReturnValue([mockSearchParams, vi.fn()]);

    (hooks.useManualTransition as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    mockMutateAsync.mockResolvedValue({});
  });

  it('should render the component', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={[]} />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  it('should render Card with title "Form"', () => {
    render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={[]} />
      </BrowserRouter>
    );

    expect(screen.getByText('Form')).toBeInTheDocument();
  });

  it('should have transition-state-machine-form class', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={[]} />
      </BrowserRouter>
    );

    const card = container.querySelector('.transition-state-machine-form');
    expect(card).toBeInTheDocument();
  });

  it('should render Form with inline layout', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={[]} />
      </BrowserRouter>
    );

    const form = container.querySelector('.ant-form-inline');
    expect(form).toBeInTheDocument();
  });

  it('should render label "Try transition"', () => {
    render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={[]} />
      </BrowserRouter>
    );

    expect(screen.getByText('Try transition')).toBeInTheDocument();
  });

  it('should render Select with placeholder', () => {
    render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={[]} />
      </BrowserRouter>
    );

    expect(screen.getByText('Select state')).toBeInTheDocument();
  });

  it('should render Submit button', () => {
    render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={[]} />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('should disable Submit button when no state selected', () => {
    render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={mockPossibleTransitions} />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();
  });

  it('should render all possible transitions in dropdown', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={mockPossibleTransitions} />
      </BrowserRouter>
    );

    const select = container.querySelector('.ant-select-selector');
    await user.click(select!);

    await waitFor(() => {
      const pendingOptions = screen.getAllByText('PENDING');
      const approvedOptions = screen.getAllByText('APPROVED');
      const rejectedOptions = screen.getAllByText('REJECTED');
      const completedOptions = screen.getAllByText('COMPLETED');

      expect(pendingOptions.length).toBeGreaterThan(0);
      expect(approvedOptions.length).toBeGreaterThan(0);
      expect(rejectedOptions.length).toBeGreaterThan(0);
      expect(completedOptions.length).toBeGreaterThan(0);
    });
  });

  it('should enable Submit button when state is selected', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={mockPossibleTransitions} />
      </BrowserRouter>
    );

    const select = container.querySelector('.ant-select-selector');
    await user.click(select!);

    await waitFor(() => {
      const options = screen.getAllByText('PENDING');
      expect(options[options.length - 1]).toBeInTheDocument();
    });

    const options = screen.getAllByText('PENDING');
    await user.click(options[options.length - 1]);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).not.toBeDisabled();
  });

  it('should call mutateAsync with correct parameters on submit', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm
          possibleTransitions={mockPossibleTransitions}
          onUpdated={mockOnUpdated}
        />
      </BrowserRouter>
    );

    const select = container.querySelector('.ant-select-selector');
    await user.click(select!);

    await waitFor(() => {
      expect(screen.getAllByText('APPROVED').length).toBeGreaterThan(0);
    });

    const options = screen.getAllByText('APPROVED');
    await user.click(options[options.length - 1]);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        entityClass: 'Order',
        entityId: '123',
        transition: 'APPROVED',
        transactional: true,
        async: false,
        values: [],
      });
    });
  });

  it('should call onUpdated callback after successful submission', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm
          possibleTransitions={mockPossibleTransitions}
          onUpdated={mockOnUpdated}
        />
      </BrowserRouter>
    );

    const select = container.querySelector('.ant-select-selector');
    await user.click(select!);

    await waitFor(() => {
      expect(screen.getAllByText('PENDING').length).toBeGreaterThan(0);
    });

    const options = screen.getAllByText('PENDING');
    await user.click(options[options.length - 1]);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnUpdated).toHaveBeenCalled();
    });
  });

  it('should reset selected state after successful submission', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm
          possibleTransitions={mockPossibleTransitions}
          onUpdated={mockOnUpdated}
        />
      </BrowserRouter>
    );

    const select = container.querySelector('.ant-select-selector');
    await user.click(select!);

    await waitFor(() => {
      expect(screen.getAllByText('REJECTED').length).toBeGreaterThan(0);
    });

    const options = screen.getAllByText('REJECTED');
    await user.click(options[options.length - 1]);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should show loading state on Submit button', () => {
    (hooks.useManualTransition as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={mockPossibleTransitions} />
      </BrowserRouter>
    );

    const submitButton = container.querySelector('.ant-btn');
    expect(submitButton).toHaveClass('ant-btn-loading');
  });

  it('should handle empty possibleTransitions array', () => {
    render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={[]} />
      </BrowserRouter>
    );

    expect(screen.getByText('Select state')).toBeInTheDocument();
  });

  it('should not call onUpdated if not provided', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={mockPossibleTransitions} />
      </BrowserRouter>
    );

    const select = container.querySelector('.ant-select-selector');
    await user.click(select!);

    await waitFor(() => {
      expect(screen.getAllByText('COMPLETED').length).toBeGreaterThan(0);
    });

    const options = screen.getAllByText('COMPLETED');
    await user.click(options[options.length - 1]);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  it('should handle mutation error gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockMutateAsync.mockRejectedValue(new Error('Transition failed'));

    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={mockPossibleTransitions} />
      </BrowserRouter>
    );

    const select = container.querySelector('.ant-select-selector');
    await user.click(select!);

    await waitFor(() => {
      expect(screen.getAllByText('PENDING').length).toBeGreaterThan(0);
    });

    const options = screen.getAllByText('PENDING');
    await user.click(options[options.length - 1]);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to perform transition:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});

