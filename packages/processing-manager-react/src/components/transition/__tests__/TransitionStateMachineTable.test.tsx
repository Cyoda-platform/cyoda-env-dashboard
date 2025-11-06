import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TransitionStateMachineTable from '../TransitionStateMachineTable';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

const mockUseParams = vi.mocked(
  (await import('react-router-dom')).useParams
);

const mockStateMachineEvents = [
  {
    event: {
      type: 'STATE_CHANGED',
      transactionId: 'txn-123',
      state: 'PENDING',
    },
    message: 'State changed to pending',
  },
  {
    event: {
      type: 'STATE_COMPLETED',
      transactionId: 'txn-456',
      state: 'COMPLETED',
    },
    message: 'State completed successfully',
  },
  {
    event: {
      type: 'STATE_FAILED',
      transactionId: 'txn-789',
      state: 'FAILED',
    },
    message: 'State transition failed',
  },
];

describe('TransitionStateMachineTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ name: 'test-node' });
  });

  it('should render the component', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={[]} />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  it('should render Card component', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={[]} />
      </BrowserRouter>
    );
    
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should render Table component', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={[]} />
      </BrowserRouter>
    );
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should render all column headers', () => {
    render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('State Machine Event Type')).toBeInTheDocument();
    expect(screen.getByText('Transaction Id')).toBeInTheDocument();
    expect(screen.getByText('Current State')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('should display event types', () => {
    render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('STATE_CHANGED')).toBeInTheDocument();
    expect(screen.getByText('STATE_COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('STATE_FAILED')).toBeInTheDocument();
  });

  it('should display transaction IDs as links', () => {
    render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    const link1 = screen.getByRole('link', { name: 'txn-123' });
    const link2 = screen.getByRole('link', { name: 'txn-456' });
    const link3 = screen.getByRole('link', { name: 'txn-789' });
    
    expect(link1).toHaveAttribute('href', '/nodes/test-node/transaction/txn-123');
    expect(link2).toHaveAttribute('href', '/nodes/test-node/transaction/txn-456');
    expect(link3).toHaveAttribute('href', '/nodes/test-node/transaction/txn-789');
  });

  it('should display current states', () => {
    render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('FAILED')).toBeInTheDocument();
  });

  it('should display messages', () => {
    render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('State changed to pending')).toBeInTheDocument();
    expect(screen.getByText('State completed successfully')).toBeInTheDocument();
    expect(screen.getByText('State transition failed')).toBeInTheDocument();
  });

  it('should handle empty events array', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={[]} />
      </BrowserRouter>
    );
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should use name from useParams for links', () => {
    mockUseParams.mockReturnValue({ name: 'my-custom-node' });
    
    render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    const link = screen.getByRole('link', { name: 'txn-123' });
    expect(link).toHaveAttribute('href', '/nodes/my-custom-node/transaction/txn-123');
  });

  it('should have bordered table', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    const table = container.querySelector('.ant-table-bordered');
    expect(table).toBeInTheDocument();
  });

  it('should have pagination with correct options', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    const pagination = container.querySelector('.ant-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should render all events', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    const rows = container.querySelectorAll('.ant-table-tbody tr');
    expect(rows.length).toBe(3);
  });

  it('should handle single event', () => {
    const singleEvent = [mockStateMachineEvents[0]];
    
    render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={singleEvent} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('STATE_CHANGED')).toBeInTheDocument();
    expect(screen.queryByText('STATE_COMPLETED')).not.toBeInTheDocument();
  });

  it('should use transaction ID as row key', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    const rows = container.querySelectorAll('.ant-table-tbody tr');
    expect(rows.length).toBe(3);
  });
});

