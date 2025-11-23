/**
 * Tests for EventsTable Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EventsTable } from '../EventsTable';

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ name: 'test-node' })),
  };
});

const mockEventData = [
  {
    createTime: '2024-01-01 10:00:00',
    doneTime: '2024-01-01 10:00:05',
    errorTime: '',
    totalTimeMillis: 5000,
    queueName: 'test-queue',
    shardId: 'shard-1',
    status: 'COMPLETED',
    timeUUID: 'uuid-123',
    entityClassName: 'TestEntity',
    entityId: 'entity-1',
    entityHasErrors: false,
    errorEventTimeUUID: '',
    coreDataClassName: 'CoreData',
    versionCheckResult: 'OK',
  },
  {
    createTime: '2024-01-01 11:00:00',
    doneTime: '',
    errorTime: '2024-01-01 11:00:10',
    totalTimeMillis: 10000,
    queueName: 'error-queue',
    shardId: 'shard-2',
    status: 'FAILED',
    timeUUID: 'uuid-456',
    entityClassName: 'ErrorEntity',
    entityId: 'entity-2',
    entityHasErrors: true,
    errorEventTimeUUID: 'error-uuid-789',
    coreDataClassName: 'ErrorCoreData',
    versionCheckResult: 'MISMATCH',
  },
];

describe('EventsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    render(
      <BrowserRouter>
        <EventsTable tableData={[]} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Transaction Events')).toBeInTheDocument();
  });

  it('should render table with data', () => {
    render(
      <BrowserRouter>
        <EventsTable tableData={mockEventData} />
      </BrowserRouter>
    );
    
    // Check that data is rendered
    expect(screen.getByText('test-queue')).toBeInTheDocument();
    expect(screen.getByText('error-queue')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('FAILED')).toBeInTheDocument();
  });

  it('should render all column headers', () => {
    render(
      <BrowserRouter>
        <EventsTable tableData={mockEventData} />
      </BrowserRouter>
    );

    // Ant Design renders duplicate headers (one in thead, one in measurement row)
    expect(screen.getAllByText('Create Time').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Done Time').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Error Time').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Total Time(ms)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Queue').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Shard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Time UUID').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Entity Class').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Entity ID').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Has Errors').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Error Event Time UUID').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Core Event Data Class').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Client Event Data Class').length).toBeGreaterThan(0);
  });

  it('should render time UUID as link', () => {
    render(
      <BrowserRouter>
        <EventsTable tableData={mockEventData} />
      </BrowserRouter>
    );
    
    const link = screen.getByRole('link', { name: 'uuid-123' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      '/nodes/test-node/event-view?queue=test-queue&shard=shard-1&timeUUID=uuid-123'
    );
  });

  it('should render "Yes" for entityHasErrors true', () => {
    render(
      <BrowserRouter>
        <EventsTable tableData={mockEventData} />
      </BrowserRouter>
    );
    
    const yesTexts = screen.getAllByText('Yes');
    expect(yesTexts.length).toBeGreaterThan(0);
  });

  it('should render "No" for entityHasErrors false', () => {
    render(
      <BrowserRouter>
        <EventsTable tableData={mockEventData} />
      </BrowserRouter>
    );
    
    const noTexts = screen.getAllByText('No');
    expect(noTexts.length).toBeGreaterThan(0);
  });

  it('should show loading spinner when isLoading is true', () => {
    const { container } = render(
      <BrowserRouter>
        <EventsTable tableData={mockEventData} isLoading={true} />
      </BrowserRouter>
    );
    
    // Ant Design Spin adds a spinning class
    const spinElement = container.querySelector('.ant-spin-spinning');
    expect(spinElement).toBeInTheDocument();
  });

  it('should not show loading spinner when isLoading is false', () => {
    const { container } = render(
      <BrowserRouter>
        <EventsTable tableData={mockEventData} isLoading={false} />
      </BrowserRouter>
    );
    
    const spinElement = container.querySelector('.ant-spin-spinning');
    expect(spinElement).not.toBeInTheDocument();
  });

  it('should render empty table when no data provided', () => {
    render(
      <BrowserRouter>
        <EventsTable tableData={[]} />
      </BrowserRouter>
    );

    // Component shows custom empty text "No transaction events found"
    const emptyText = screen.getByText('No transaction events found');
    expect(emptyText).toBeInTheDocument();
  });

  it('should render table with bordered prop', () => {
    const { container } = render(
      <BrowserRouter>
        <EventsTable tableData={mockEventData} />
      </BrowserRouter>
    );
    
    const table = container.querySelector('.ant-table-bordered');
    expect(table).toBeInTheDocument();
  });

  it('should render Card with correct title', () => {
    render(
      <BrowserRouter>
        <EventsTable tableData={mockEventData} />
      </BrowserRouter>
    );
    
    const cardTitle = screen.getByText('Transaction Events');
    expect(cardTitle).toBeInTheDocument();
  });

  it('should render all entity class names', () => {
    render(
      <BrowserRouter>
        <EventsTable tableData={mockEventData} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('TestEntity')).toBeInTheDocument();
    expect(screen.getByText('ErrorEntity')).toBeInTheDocument();
  });

  it('should render all entity IDs', () => {
    render(
      <BrowserRouter>
        <EventsTable tableData={mockEventData} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('entity-1')).toBeInTheDocument();
    expect(screen.getByText('entity-2')).toBeInTheDocument();
  });

  it('should render shard IDs', () => {
    render(
      <BrowserRouter>
        <EventsTable tableData={mockEventData} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('shard-1')).toBeInTheDocument();
    expect(screen.getByText('shard-2')).toBeInTheDocument();
  });

  it('should render total time in milliseconds', () => {
    render(
      <BrowserRouter>
        <EventsTable tableData={mockEventData} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('5000')).toBeInTheDocument();
    expect(screen.getByText('10000')).toBeInTheDocument();
  });

  it('should render multiple time UUID links', () => {
    render(
      <BrowserRouter>
        <EventsTable tableData={mockEventData} />
      </BrowserRouter>
    );
    
    const link1 = screen.getByRole('link', { name: 'uuid-123' });
    const link2 = screen.getByRole('link', { name: 'uuid-456' });
    
    expect(link1).toBeInTheDocument();
    expect(link2).toBeInTheDocument();
  });
});

