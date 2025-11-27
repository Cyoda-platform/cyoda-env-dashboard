/**
 * Tests for EventViewModal Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { EventViewModal } from '../EventViewModal';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useProcessingQueueErrorEventByEntity: vi.fn(),
}));

// Mock ErrorViewActions component
vi.mock('../../common/ErrorViewActions', () => ({
  ErrorViewActions: vi.fn(({ params }) => (
    <div data-testid="error-view-actions">
      ErrorViewActions: {params?.queue}
    </div>
  )),
}));

// Mock CodeEditor from ui-lib-react
vi.mock('@cyoda/ui-lib-react', () => ({
  CodeEditor: vi.fn(({ value }) => <pre data-testid="code-editor">{value}</pre>),
}));

const mockEventData = {
  event: {
    createTime: '2024-01-01 10:00:00',
    queueName: 'test-queue',
    shardId: '1',
    status: 'COMPLETED',
    timeUUID: 'test-uuid-123',
    entityClassName: 'com.cyoda.TestEntity',
    entityId: 'entity-123',
    entityHasErrors: false,
    errorEventTimeUUID: '',
    coreDataClassName: 'CoreClass',
    clientDataClassName: 'ClientClass',
    coreData: {
      field1: 'value1',
      field2: 'value2',
    },
  },
  done: true,
};

describe('EventViewModal', () => {
  const mockOnClose = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(hooks.useProcessingQueueErrorEventByEntity).mockReturnValue({
      data: mockEventData,
      refetch: mockRefetch,
      isLoading: false,
      error: null,
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render modal when open is true', () => {
    render(
      <EventViewModal
        open={true}
        onClose={mockOnClose}
        queue="test-queue"
        shard="1"
        timeUUID="test-uuid-123"
      />
    );

    expect(screen.getByText('Event view')).toBeInTheDocument();
  });

  it('should not render modal when open is false', () => {
    render(
      <EventViewModal
        open={false}
        onClose={mockOnClose}
        queue="test-queue"
        shard="1"
        timeUUID="test-uuid-123"
      />
    );

    expect(screen.queryByText('Event view')).not.toBeInTheDocument();
  });

  it('should call onClose when modal is closed', () => {
    render(
      <EventViewModal
        open={true}
        onClose={mockOnClose}
        queue="test-queue"
        shard="1"
        timeUUID="test-uuid-123"
      />
    );

    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    fireEvent.click(closeButtons[0]);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display event details', () => {
    render(
      <EventViewModal
        open={true}
        onClose={mockOnClose}
        queue="test-queue"
        shard="1"
        timeUUID="test-uuid-123"
      />
    );

    expect(screen.getByText('2024-01-01 10:00:00')).toBeInTheDocument();
    expect(screen.getAllByText('test-queue').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('test-uuid-123')).toBeInTheDocument();
    // Entity-Class field shows queueName, not entityClassName
    expect(screen.getAllByText('test-queue').length).toBeGreaterThan(0);
    expect(screen.getByText('entity-123')).toBeInTheDocument();
  });

  it('should display "No" for hasErrors when false', () => {
    render(
      <EventViewModal
        open={true}
        onClose={mockOnClose}
        queue="test-queue"
        shard="1"
        timeUUID="test-uuid-123"
      />
    );

    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('should display "Yes" for hasErrors when true', () => {
    const dataWithErrors = {
      ...mockEventData,
      event: {
        ...mockEventData.event,
        entityHasErrors: true,
      },
    };

    vi.mocked(hooks.useProcessingQueueErrorEventByEntity).mockReturnValue({
      data: dataWithErrors,
      refetch: mockRefetch,
      isLoading: false,
      error: null,
    } as any);

    render(
      <EventViewModal
        open={true}
        onClose={mockOnClose}
        queue="test-queue"
        shard="1"
        timeUUID="test-uuid-123"
      />
    );

    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('should render ErrorViewActions when event is not done', () => {
    const dataNotDone = {
      ...mockEventData,
      done: false,
    };

    vi.mocked(hooks.useProcessingQueueErrorEventByEntity).mockReturnValue({
      data: dataNotDone,
      refetch: mockRefetch,
      isLoading: false,
      error: null,
    } as any);

    render(
      <EventViewModal
        open={true}
        onClose={mockOnClose}
        queue="test-queue"
        shard="1"
        timeUUID="test-uuid-123"
      />
    );

    expect(screen.getByTestId('error-view-actions')).toBeInTheDocument();
  });

  it('should not render ErrorViewActions when event is done', () => {
    render(
      <EventViewModal
        open={true}
        onClose={mockOnClose}
        queue="test-queue"
        shard="1"
        timeUUID="test-uuid-123"
      />
    );

    expect(screen.queryByTestId('error-view-actions')).not.toBeInTheDocument();
  });

  it('should render core event data with code editor', () => {
    render(
      <EventViewModal
        open={true}
        onClose={mockOnClose}
        queue="test-queue"
        shard="1"
        timeUUID="test-uuid-123"
      />
    );

    const codeEditor = screen.getByTestId('code-editor');
    expect(codeEditor).toBeInTheDocument();
  });

  it('should show loading state', () => {
    vi.mocked(hooks.useProcessingQueueErrorEventByEntity).mockReturnValue({
      data: null,
      refetch: mockRefetch,
      isLoading: true,
      error: null,
    } as any);

    render(
      <EventViewModal
        open={true}
        onClose={mockOnClose}
        queue="test-queue"
        shard="1"
        timeUUID="test-uuid-123"
      />
    );

    expect(screen.getByText('Event view')).toBeInTheDocument();
  });

  it('should call useProcessingQueueErrorEventByEntity with correct params', () => {
    render(
      <EventViewModal
        open={true}
        onClose={mockOnClose}
        queue="test-queue"
        shard="1"
        timeUUID="test-uuid-123"
      />
    );

    expect(hooks.useProcessingQueueErrorEventByEntity).toHaveBeenCalledWith(
      {
        queue: 'test-queue',
        shard: '1',
        timeUUID: 'test-uuid-123',
      },
      expect.objectContaining({
        enabled: true,
      })
    );
  });

  it('should not fetch data when modal is closed', () => {
    vi.clearAllMocks();

    render(
      <EventViewModal
        open={false}
        onClose={mockOnClose}
        queue="test-queue"
        shard="1"
        timeUUID="test-uuid-123"
      />
    );

    expect(hooks.useProcessingQueueErrorEventByEntity).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        enabled: false,
      })
    );
  });
});

