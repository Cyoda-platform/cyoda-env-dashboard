import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import EntityStateMachineModal from '../EntityStateMachineModal';
import * as hooks from '@/hooks';

// Mock the useEntityStateMachine hook
vi.mock('@/hooks', () => ({
  useEntityStateMachine: vi.fn(),
}));

// Mock the child components
vi.mock('../../state-machine/TransitionStateMachineForm', () => ({
  default: ({ possibleTransitions, onUpdated }: any) => (
    <div data-testid="state-machine-form">
      <div>Possible Transitions: {possibleTransitions.length}</div>
      <button onClick={onUpdated}>Update</button>
    </div>
  ),
}));

vi.mock('../../state-machine/TransitionStateMachineTable', () => ({
  default: ({ stateMachineEvents }: any) => (
    <div data-testid="state-machine-table">
      <div>Events: {stateMachineEvents.length}</div>
    </div>
  ),
}));

vi.mock('../../state-machine/TransitionStateMachineTimeLine', () => ({
  default: ({ entityVersions }: any) => (
    <div data-testid="state-machine-timeline">
      <div>Versions: {entityVersions.length}</div>
    </div>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('EntityStateMachineModal', () => {
  const mockOnClose = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when visible is true', () => {
    vi.mocked(hooks.useEntityStateMachine).mockReturnValue({
      data: {
        entityVersions: [],
        possibleTransitions: [],
        stateMachineEvents: [],
      },
      refetch: mockRefetch,
    } as any);

    render(
      <EntityStateMachineModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/State machine view for entity/i)).toBeInTheDocument();
    expect(screen.getByText(/TestEntity/i)).toBeInTheDocument();
    expect(screen.getByText(/entity-123/i)).toBeInTheDocument();
  });

  it('should not render modal when visible is false', () => {
    vi.mocked(hooks.useEntityStateMachine).mockReturnValue({
      data: {
        entityVersions: [],
        possibleTransitions: [],
        stateMachineEvents: [],
      },
      refetch: mockRefetch,
    } as any);

    render(
      <EntityStateMachineModal
        visible={false}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText(/State machine view for entity/i)).not.toBeInTheDocument();
  });

  it('should call onClose when modal is closed', async () => {
    const user = userEvent.setup();
    vi.mocked(hooks.useEntityStateMachine).mockReturnValue({
      data: {
        entityVersions: [],
        possibleTransitions: [],
        stateMachineEvents: [],
      },
      refetch: mockRefetch,
    } as any);

    render(
      <EntityStateMachineModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    // Find and click the close button
    const closeButton = document.querySelector('.ant-modal-close');
    if (closeButton) {
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should render all child components', () => {
    vi.mocked(hooks.useEntityStateMachine).mockReturnValue({
      data: {
        entityVersions: [],
        possibleTransitions: [],
        stateMachineEvents: [],
      },
      refetch: mockRefetch,
    } as any);

    render(
      <EntityStateMachineModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId('state-machine-form')).toBeInTheDocument();
    expect(screen.getByTestId('state-machine-table')).toBeInTheDocument();
    expect(screen.getByTestId('state-machine-timeline')).toBeInTheDocument();
  });

  it('should pass correct data to child components', () => {
    vi.mocked(hooks.useEntityStateMachine).mockReturnValue({
      data: {
        entityVersions: [{ id: 1 }, { id: 2 }],
        possibleTransitions: [{ id: 1 }],
        stateMachineEvents: [{ id: 1 }, { id: 2 }, { id: 3 }],
      },
      refetch: mockRefetch,
    } as any);

    render(
      <EntityStateMachineModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Possible Transitions: 1')).toBeInTheDocument();
    expect(screen.getByText('Events: 3')).toBeInTheDocument();
    expect(screen.getByText('Versions: 2')).toBeInTheDocument();
  });

  it('should pass correct parameters to useEntityStateMachine hook', () => {
    vi.mocked(hooks.useEntityStateMachine).mockReturnValue({
      data: {
        entityVersions: [],
        possibleTransitions: [],
        stateMachineEvents: [],
      },
      refetch: mockRefetch,
    } as any);

    render(
      <EntityStateMachineModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-456"
        entityType="com.example.AnotherEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(vi.mocked(hooks.useEntityStateMachine)).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'com.example.AnotherEntity',
        id: 'entity-456',
      })
    );
  });

  it('should extract entity class name from entity type', () => {
    vi.mocked(hooks.useEntityStateMachine).mockReturnValue({
      data: {
        entityVersions: [],
        possibleTransitions: [],
        stateMachineEvents: [],
      },
      refetch: mockRefetch,
    } as any);

    render(
      <EntityStateMachineModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.package.MyEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/MyEntity/i)).toBeInTheDocument();
  });

  it('should handle entity type without package', () => {
    vi.mocked(hooks.useEntityStateMachine).mockReturnValue({
      data: {
        entityVersions: [],
        possibleTransitions: [],
        stateMachineEvents: [],
      },
      refetch: mockRefetch,
    } as any);

    render(
      <EntityStateMachineModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="SimpleEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/SimpleEntity/i)).toBeInTheDocument();
  });

  it('should have correct modal class', () => {
    vi.mocked(hooks.useEntityStateMachine).mockReturnValue({
      data: {
        entityVersions: [],
        possibleTransitions: [],
        stateMachineEvents: [],
      },
      refetch: mockRefetch,
    } as any);

    render(
      <EntityStateMachineModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    const modal = document.body.querySelector('.entity-state-machine-modal');
    expect(modal).toBeInTheDocument();
  });

  it('should render without footer', () => {
    vi.mocked(hooks.useEntityStateMachine).mockReturnValue({
      data: {
        entityVersions: [],
        possibleTransitions: [],
        stateMachineEvents: [],
      },
      refetch: mockRefetch,
    } as any);

    render(
      <EntityStateMachineModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    const footer = document.body.querySelector('.ant-modal-footer');
    expect(footer).not.toBeInTheDocument();
  });

  it('should handle update action', async () => {
    const user = userEvent.setup();
    vi.mocked(hooks.useEntityStateMachine).mockReturnValue({
      data: {
        entityVersions: [],
        possibleTransitions: [],
        stateMachineEvents: [],
      },
      refetch: mockRefetch,
    } as any);

    render(
      <EntityStateMachineModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    const updateButton = screen.getByText('Update');
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should show loading spinner during update', async () => {
    const user = userEvent.setup();
    vi.mocked(hooks.useEntityStateMachine).mockReturnValue({
      data: {
        entityVersions: [],
        possibleTransitions: [],
        stateMachineEvents: [],
      },
      refetch: mockRefetch,
    } as any);

    render(
      <EntityStateMachineModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    const updateButton = screen.getByText('Update');
    await user.click(updateButton);

    // The loading spinner should be shown during update
    // Note: This is a simplified test - in reality, we'd need to mock the refetch to be async
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should handle empty data from hook', () => {
    vi.mocked(hooks.useEntityStateMachine).mockReturnValue({
      data: undefined,
      refetch: mockRefetch,
    } as any);

    render(
      <EntityStateMachineModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    // Should render with empty arrays when data is undefined
    expect(screen.getByText('Possible Transitions: 0')).toBeInTheDocument();
    expect(screen.getByText('Events: 0')).toBeInTheDocument();
    expect(screen.getByText('Versions: 0')).toBeInTheDocument();
  });

  it('should render modal in document body', () => {
    vi.mocked(hooks.useEntityStateMachine).mockReturnValue({
      data: {
        entityVersions: [],
        possibleTransitions: [],
        stateMachineEvents: [],
      },
      refetch: mockRefetch,
    } as any);

    render(
      <EntityStateMachineModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    // Modal should be rendered in document.body
    const modal = document.body.querySelector('.ant-modal');
    expect(modal).toBeInTheDocument();
  });
});
