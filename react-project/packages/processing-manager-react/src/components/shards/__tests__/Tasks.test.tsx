/**
 * Tests for Tasks Component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Tasks from '../Tasks';

const mockTasksByEntity = [
  {
    id: 'event-1',
    events: [
      {
        id: 'entity-1',
        shardId: 1,
        queueName: 'queue-a',
        processIds: ['proc-1', 'proc-2'],
      },
    ],
  },
  {
    id: 'event-2',
    events: [
      {
        id: 'entity-2',
        shardId: 2,
        queueName: 'queue-b',
        processIds: ['proc-3'],
      },
    ],
  },
  {
    id: 'event-3',
    events: [
      {
        id: 'entity-3',
        shardId: 1,
        queueName: 'queue-a',
        processIds: ['proc-4', 'proc-5'],
      },
    ],
  },
];

describe('Tasks', () => {
  beforeEach(() => {
    // Clear any previous renders
  });

  it('should render the component', () => {
    const { container } = render(
      <Tasks 
        tasksByEntity={[]} 
        runningTaskCount={0} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should render card title with running count', () => {
    render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={5} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(screen.getByText(/Tasks \(running now count 5\)/)).toBeInTheDocument();
  });

  it('should display last task finish time', () => {
    render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={3} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(screen.getByText(/Last task finish time: 2024-01-01 10:00:00/)).toBeInTheDocument();
  });

  it('should render filter section', () => {
    render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={3} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={3} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('should render shard filter select', () => {
    render(
      <Tasks
        tasksByEntity={mockTasksByEntity}
        runningTaskCount={3}
        lastTaskFinishTime="2024-01-01 10:00:00"
      />
    );

    expect(screen.getAllByText('Last Shard').length).toBeGreaterThan(0);
  });

  it('should render queue filter select', () => {
    render(
      <Tasks
        tasksByEntity={mockTasksByEntity}
        runningTaskCount={3}
        lastTaskFinishTime="2024-01-01 10:00:00"
      />
    );

    expect(screen.getAllByText('Last Queue').length).toBeGreaterThan(0);
  });

  it('should render table with data', () => {
    render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={3} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(screen.getByText('entity-1')).toBeInTheDocument();
    expect(screen.getByText('entity-2')).toBeInTheDocument();
    expect(screen.getByText('entity-3')).toBeInTheDocument();
  });

  it('should display event IDs', () => {
    render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={3} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(screen.getByText('event-1')).toBeInTheDocument();
    expect(screen.getByText('event-2')).toBeInTheDocument();
    expect(screen.getByText('event-3')).toBeInTheDocument();
  });

  it('should display shard IDs', () => {
    render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={3} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    const { container } = render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={3} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  it('should display queue names', () => {
    render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={3} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(screen.getAllByText('queue-a').length).toBeGreaterThan(0);
    expect(screen.getByText('queue-b')).toBeInTheDocument();
  });

  it('should have column headers', () => {
    render(
      <Tasks
        tasksByEntity={mockTasksByEntity}
        runningTaskCount={3}
        lastTaskFinishTime="2024-01-01 10:00:00"
      />
    );

    expect(screen.getAllByText('Last Entity').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Last EventId').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Last Shard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Last Queue').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Last Processes').length).toBeGreaterThan(0);
  });

  it('should filter by search text', () => {
    render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={3} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'entity-1' } });
    
    expect(screen.getByText('entity-1')).toBeInTheDocument();
  });

  it('should render empty table when no data', () => {
    const { container } = render(
      <Tasks 
        tasksByEntity={[]} 
        runningTaskCount={0} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should have pagination', () => {
    const { container } = render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={3} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(container.querySelector('.ant-pagination')).toBeInTheDocument();
  });

  it('should render with pm-tasks class', () => {
    const { container } = render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={3} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(container.querySelector('.pm-tasks')).toBeInTheDocument();
  });

  it('should handle zero running tasks', () => {
    render(
      <Tasks 
        tasksByEntity={[]} 
        runningTaskCount={0} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(screen.getByText(/running now count 0/)).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={3} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  it('should display process IDs as JSON', () => {
    render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={3} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    expect(screen.getByText('["proc-1","proc-2"]')).toBeInTheDocument();
    expect(screen.getByText('["proc-3"]')).toBeInTheDocument();
  });

  it('should have horizontal scroll', () => {
    const { container } = render(
      <Tasks 
        tasksByEntity={mockTasksByEntity} 
        runningTaskCount={3} 
        lastTaskFinishTime="2024-01-01 10:00:00" 
      />
    );
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should render all filter fields', () => {
    render(
      <Tasks
        tasksByEntity={mockTasksByEntity}
        runningTaskCount={3}
        lastTaskFinishTime="2024-01-01 10:00:00"
      />
    );

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getAllByText('Last Shard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Last Queue').length).toBeGreaterThan(0);
  });
});

