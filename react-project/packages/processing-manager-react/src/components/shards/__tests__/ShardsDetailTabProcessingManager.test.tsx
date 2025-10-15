/**
 * Tests for ShardsDetailTabProcessingManager Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ShardsDetailTabProcessingManager from '../ShardsDetailTabProcessingManager';
import * as hooks from '../../../hooks/useProcessing';

// Mock the child components
vi.mock('../ActualShards', () => ({
  ActualShards: ({ actualShardsTable }: any) => (
    <div data-testid="actual-shards">
      ActualShards: {actualShardsTable.length} shards
    </div>
  ),
}));

vi.mock('../Tasks', () => ({
  Tasks: ({ tasksByEntity, runningTaskCount, lastTaskFinishTime }: any) => (
    <div data-testid="tasks">
      Tasks: {runningTaskCount} running, {tasksByEntity.length} entities, {lastTaskFinishTime}
    </div>
  ),
}));

vi.mock('../PendingTasksCount', () => ({
  PendingTasksCount: ({ pendingTaskCount }: any) => (
    <div data-testid="pending-tasks">
      Pending: {pendingTaskCount}
    </div>
  ),
}));

vi.mock('../Resources', () => ({
  Resources: ({ poolInfo }: any) => (
    <div data-testid="resources">
      Resources: {poolInfo.length} pools
    </div>
  ),
}));

vi.mock('../../../hooks/useProcessing', () => ({
  useSummary: vi.fn(),
}));

const mockSummaryData = {
  actualShards: [
    { shardId: '1', state: 'ACTIVE', processesCount: 5 },
    { shardId: '2', state: 'INACTIVE', processesCount: 0 },
  ],
  tasksByEntity: [
    {
      id: 'entity1',
      events: [
        {
          id: 'event1',
          shardId: 1,
          queueName: 'queue1',
          processIds: ['proc1', 'proc2'],
        },
      ],
    },
  ],
  runningTaskCount: 5,
  lastTaskFinishTime: '2025-10-15T10:00:00Z',
  pendingTaskCount: 10,
  poolInfo: [
    { type: 'cpu', available: 4, poolSize: 8, size: 8 },
    { type: 'memory', available: 2048, poolSize: 4096, size: 4096 },
  ],
};

describe('ShardsDetailTabProcessingManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = render(<ShardsDetailTabProcessingManager />);

    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('should render error state', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: 'Failed to load summary',
    });

    render(<ShardsDetailTabProcessingManager />);

    expect(screen.getByText('Error loading summary')).toBeInTheDocument();
    expect(screen.getByText('Failed to load summary')).toBeInTheDocument();
  });

  it('should render no data state', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<ShardsDetailTabProcessingManager />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should render all child components with data', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: mockSummaryData,
      isLoading: false,
      error: null,
    });

    render(<ShardsDetailTabProcessingManager />);

    expect(screen.getByTestId('actual-shards')).toBeInTheDocument();
    expect(screen.getByTestId('tasks')).toBeInTheDocument();
    expect(screen.getByTestId('pending-tasks')).toBeInTheDocument();
    expect(screen.getByTestId('resources')).toBeInTheDocument();
  });

  it('should pass correct data to ActualShards', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: mockSummaryData,
      isLoading: false,
      error: null,
    });

    render(<ShardsDetailTabProcessingManager />);

    expect(screen.getByText('ActualShards: 2 shards')).toBeInTheDocument();
  });

  it('should pass correct data to Tasks', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: mockSummaryData,
      isLoading: false,
      error: null,
    });

    render(<ShardsDetailTabProcessingManager />);

    expect(screen.getByText(/Tasks: 5 running, 1 entities/)).toBeInTheDocument();
  });

  it('should pass correct data to PendingTasksCount', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: mockSummaryData,
      isLoading: false,
      error: null,
    });

    render(<ShardsDetailTabProcessingManager />);

    expect(screen.getByText('Pending: 10')).toBeInTheDocument();
  });

  it('should pass correct data to Resources', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: mockSummaryData,
      isLoading: false,
      error: null,
    });

    render(<ShardsDetailTabProcessingManager />);

    expect(screen.getByText('Resources: 2 pools')).toBeInTheDocument();
  });

  it('should handle missing actualShards', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: { ...mockSummaryData, actualShards: undefined },
      isLoading: false,
      error: null,
    });

    render(<ShardsDetailTabProcessingManager />);

    expect(screen.getByText('ActualShards: 0 shards')).toBeInTheDocument();
  });

  it('should handle missing tasksByEntity', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: { ...mockSummaryData, tasksByEntity: undefined },
      isLoading: false,
      error: null,
    });

    render(<ShardsDetailTabProcessingManager />);

    expect(screen.getByText(/Tasks: 5 running, 0 entities/)).toBeInTheDocument();
  });

  it('should handle missing runningTaskCount', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: { ...mockSummaryData, runningTaskCount: undefined },
      isLoading: false,
      error: null,
    });

    render(<ShardsDetailTabProcessingManager />);

    expect(screen.getByText(/Tasks: 0 running/)).toBeInTheDocument();
  });

  it('should handle missing lastTaskFinishTime', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: { ...mockSummaryData, lastTaskFinishTime: undefined },
      isLoading: false,
      error: null,
    });

    render(<ShardsDetailTabProcessingManager />);

    expect(screen.getByTestId('tasks')).toBeInTheDocument();
  });

  it('should handle missing pendingTaskCount', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: { ...mockSummaryData, pendingTaskCount: undefined },
      isLoading: false,
      error: null,
    });

    render(<ShardsDetailTabProcessingManager />);

    expect(screen.getByText('Pending: 0')).toBeInTheDocument();
  });

  it('should handle missing poolInfo', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: { ...mockSummaryData, poolInfo: undefined },
      isLoading: false,
      error: null,
    });

    render(<ShardsDetailTabProcessingManager />);

    expect(screen.getByText('Resources: 0 pools')).toBeInTheDocument();
  });

  it('should convert shardId to integer', () => {
    (hooks.useSummary as any).mockReturnValue({
      data: {
        ...mockSummaryData,
        actualShards: [{ shardId: '123', state: 'ACTIVE', processesCount: 5 }],
      },
      isLoading: false,
      error: null,
    });

    render(<ShardsDetailTabProcessingManager />);

    // Component should render without errors
    expect(screen.getByTestId('actual-shards')).toBeInTheDocument();
  });
});

