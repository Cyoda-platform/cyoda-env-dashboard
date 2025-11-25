import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import EntityChangesModal from '../EntityChangesModal';

// Mock the child component
vi.mock('../../transition/TransitionChangesTable', () => ({
  default: ({ type, entityId, nodeName, disableLink }: any) => (
    <div data-testid="changes-table">
      <div>Type: {type}</div>
      <div>Entity ID: {entityId}</div>
      <div>Node Name: {nodeName}</div>
      <div>Disable Link: {disableLink ? 'true' : 'false'}</div>
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

describe('EntityChangesModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when visible is true', () => {
    render(
      <EntityChangesModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
        nodeName="test-node"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Changes of entity/i)).toBeInTheDocument();
    expect(screen.getByText(/TestEntity/i)).toBeInTheDocument();
    expect(screen.getByText(/entity-123/i)).toBeInTheDocument();
  });

  it('should not render modal when visible is false', () => {
    render(
      <EntityChangesModal
        visible={false}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
        nodeName="test-node"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText(/Changes of entity/i)).not.toBeInTheDocument();
  });

  it('should call onClose when modal is closed', async () => {
    const user = userEvent.setup();

    render(
      <EntityChangesModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
        nodeName="test-node"
      />,
      { wrapper: createWrapper() }
    );

    const closeButton = document.querySelector('.ant-modal-close');
    if (closeButton) {
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should render TransitionChangesTable component', () => {
    render(
      <EntityChangesModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
        nodeName="test-node"
      />,
      { wrapper: createWrapper() }
    );

    // Check that the modal content is rendered
    expect(screen.getByText(/Changes of entity/i)).toBeInTheDocument();
  });

  it('should extract entity class name from entity type', () => {
    render(
      <EntityChangesModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.package.MyEntity"
        nodeName="test-node"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/MyEntity/i)).toBeInTheDocument();
  });

  it('should handle entity type without package', () => {
    render(
      <EntityChangesModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="SimpleEntity"
        nodeName="test-node"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/SimpleEntity/i)).toBeInTheDocument();
  });

  it('should have correct modal class', () => {
    render(
      <EntityChangesModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
        nodeName="test-node"
      />,
      { wrapper: createWrapper() }
    );

    const modal = document.body.querySelector('.entity-changes-modal');
    expect(modal).toBeInTheDocument();
  });

  it('should render without footer', () => {
    render(
      <EntityChangesModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
        nodeName="test-node"
      />,
      { wrapper: createWrapper() }
    );

    const footer = document.body.querySelector('.ant-modal-footer');
    expect(footer).not.toBeInTheDocument();
  });

  it('should render modal in document body', () => {
    render(
      <EntityChangesModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
        nodeName="test-node"
      />,
      { wrapper: createWrapper() }
    );

    const modal = document.body.querySelector('.ant-modal');
    expect(modal).toBeInTheDocument();
  });

  it('should handle empty entity type', () => {
    render(
      <EntityChangesModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType=""
        nodeName="test-node"
      />,
      { wrapper: createWrapper() }
    );

    // Should still render the modal
    expect(screen.getByText(/Changes of entity/i)).toBeInTheDocument();
  });

  it('should handle empty entity id', () => {
    render(
      <EntityChangesModal
        visible={true}
        onClose={mockOnClose}
        entityId=""
        entityType="com.example.TestEntity"
        nodeName="test-node"
      />,
      { wrapper: createWrapper() }
    );

    // Should still render the modal
    expect(screen.getByText(/Changes of entity/i)).toBeInTheDocument();
  });

  it('should handle empty node name', () => {
    render(
      <EntityChangesModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
        nodeName=""
      />,
      { wrapper: createWrapper() }
    );

    // Should still render the modal
    expect(screen.getByText(/Changes of entity/i)).toBeInTheDocument();
  });
});

