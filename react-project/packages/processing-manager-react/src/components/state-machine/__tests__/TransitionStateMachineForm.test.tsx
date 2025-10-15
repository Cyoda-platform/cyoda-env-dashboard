import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import TransitionStateMachineForm from '../TransitionStateMachineForm';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useDoManualTransition: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

const mockUseLocation = vi.mocked(
  (await import('react-router-dom')).useLocation
);

const mockPossibleTransitions = ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'];

describe('TransitionStateMachineForm (state-machine)', () => {
  const mockMutate = vi.fn();
  const mockOnUpdated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseLocation.mockReturnValue({
      pathname: '/test',
      search: '?type=Article&entityId=456',
      hash: '',
      state: null,
      key: 'default',
    });
    
    (hooks.useDoManualTransition as any).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });
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
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={[]} />
      </BrowserRouter>
    );

    const select = container.querySelector('.ant-select');
    expect(select).toBeInTheDocument();
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
      const draftOptions = screen.getAllByText('DRAFT');
      const reviewOptions = screen.getAllByText('REVIEW');
      const publishedOptions = screen.getAllByText('PUBLISHED');
      const archivedOptions = screen.getAllByText('ARCHIVED');

      expect(draftOptions.length).toBeGreaterThan(0);
      expect(reviewOptions.length).toBeGreaterThan(0);
      expect(publishedOptions.length).toBeGreaterThan(0);
      expect(archivedOptions.length).toBeGreaterThan(0);
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
      const draftOptions = screen.getAllByText('DRAFT');
      expect(draftOptions[draftOptions.length - 1]).toBeInTheDocument();
    });

    const draftOptions = screen.getAllByText('DRAFT');
    await user.click(draftOptions[draftOptions.length - 1]);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).not.toBeDisabled();
  });

  it('should call mutate with correct parameters on submit', async () => {
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
      const reviewOptions = screen.getAllByText('REVIEW');
      expect(reviewOptions[reviewOptions.length - 1]).toBeInTheDocument();
    });

    const reviewOptions = screen.getAllByText('REVIEW');
    await user.click(reviewOptions[reviewOptions.length - 1]);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);
    
    expect(mockMutate).toHaveBeenCalledWith({
      entityClass: 'Article',
      entityId: '456',
      transition: 'REVIEW',
      transactional: false,
      async: false,
      values: [],
    });
  });

  it('should call onUpdated callback after successful submission', async () => {
    const user = userEvent.setup();

    // Mock successful mutation
    (hooks.useDoManualTransition as any).mockReturnValue({
      mutate: (params: any) => {
        mockMutate(params);
        mockOnUpdated();
      },
      isLoading: false,
    });

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
      const publishedOptions = screen.getAllByText('PUBLISHED');
      expect(publishedOptions[publishedOptions.length - 1]).toBeInTheDocument();
    });

    const publishedOptions = screen.getAllByText('PUBLISHED');
    await user.click(publishedOptions[publishedOptions.length - 1]);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);
    
    expect(mockOnUpdated).toHaveBeenCalled();
  });

  it('should reset selected state after successful submission', async () => {
    const user = userEvent.setup();

    // Mock successful mutation that calls onSuccess
    (hooks.useDoManualTransition as any).mockImplementation(({ onSuccess }: any) => ({
      mutate: () => {
        onSuccess();
      },
      isLoading: false,
    }));

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
      const archivedOptions = screen.getAllByText('ARCHIVED');
      expect(archivedOptions[archivedOptions.length - 1]).toBeInTheDocument();
    });

    const archivedOptions = screen.getAllByText('ARCHIVED');
    await user.click(archivedOptions[archivedOptions.length - 1]);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should show loading state on Submit button', () => {
    (hooks.useDoManualTransition as any).mockReturnValue({
      mutate: mockMutate,
      isLoading: true,
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
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={[]} />
      </BrowserRouter>
    );

    const select = container.querySelector('.ant-select');
    expect(select).toBeInTheDocument();
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
      const draftOptions = screen.getAllByText('DRAFT');
      expect(draftOptions[draftOptions.length - 1]).toBeInTheDocument();
    });

    const draftOptions = screen.getAllByText('DRAFT');
    await user.click(draftOptions[draftOptions.length - 1]);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    expect(mockMutate).toHaveBeenCalled();
  });

  it('should use location search params for entityClass and entityId', async () => {
    const user = userEvent.setup();

    mockUseLocation.mockReturnValue({
      pathname: '/test',
      search: '?type=CustomEntity&entityId=999',
      hash: '',
      state: null,
      key: 'default',
    });

    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={mockPossibleTransitions} />
      </BrowserRouter>
    );

    const select = container.querySelector('.ant-select-selector');
    await user.click(select!);

    await waitFor(() => {
      const draftOptions = screen.getAllByText('DRAFT');
      expect(draftOptions[draftOptions.length - 1]).toBeInTheDocument();
    });

    const draftOptions = screen.getAllByText('DRAFT');
    await user.click(draftOptions[draftOptions.length - 1]);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);
    
    expect(mockMutate).toHaveBeenCalledWith({
      entityClass: 'CustomEntity',
      entityId: '999',
      transition: 'DRAFT',
      transactional: false,
      async: false,
      values: [],
    });
  });

  it('should handle missing query params gracefully', async () => {
    const user = userEvent.setup();

    mockUseLocation.mockReturnValue({
      pathname: '/test',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });

    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineForm possibleTransitions={mockPossibleTransitions} />
      </BrowserRouter>
    );

    const select = container.querySelector('.ant-select-selector');
    await user.click(select!);

    await waitFor(() => {
      const draftOptions = screen.getAllByText('DRAFT');
      expect(draftOptions[draftOptions.length - 1]).toBeInTheDocument();
    });

    const draftOptions = screen.getAllByText('DRAFT');
    await user.click(draftOptions[draftOptions.length - 1]);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);
    
    expect(mockMutate).toHaveBeenCalledWith({
      entityClass: '',
      entityId: '',
      transition: 'DRAFT',
      transactional: false,
      async: false,
      values: [],
    });
  });
});

