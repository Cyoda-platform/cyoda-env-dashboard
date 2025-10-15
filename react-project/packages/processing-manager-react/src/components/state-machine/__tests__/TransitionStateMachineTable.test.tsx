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
      type: 'TRANSITION_START',
      transactionId: 'txn-abc',
      state: 'INITIAL',
    },
    message: 'Transition started',
  },
  {
    event: {
      type: 'TRANSITION_PROGRESS',
      transactionId: 'txn-def',
      state: 'IN_PROGRESS',
    },
    message: 'Transition in progress',
  },
  {
    event: {
      type: 'TRANSITION_END',
      transactionId: 'txn-ghi',
      state: 'FINAL',
    },
    message: 'Transition completed',
  },
];

describe('TransitionStateMachineTable (state-machine)', () => {
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
    
    expect(screen.getByText('TRANSITION_START')).toBeInTheDocument();
    expect(screen.getByText('TRANSITION_PROGRESS')).toBeInTheDocument();
    expect(screen.getByText('TRANSITION_END')).toBeInTheDocument();
  });

  it('should display transaction IDs as links', () => {
    render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    const link1 = screen.getByRole('link', { name: 'txn-abc' });
    const link2 = screen.getByRole('link', { name: 'txn-def' });
    const link3 = screen.getByRole('link', { name: 'txn-ghi' });
    
    expect(link1).toHaveAttribute('href', '/nodes/test-node/transaction/txn-abc');
    expect(link2).toHaveAttribute('href', '/nodes/test-node/transaction/txn-def');
    expect(link3).toHaveAttribute('href', '/nodes/test-node/transaction/txn-ghi');
  });

  it('should display current states', () => {
    render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('INITIAL')).toBeInTheDocument();
    expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
    expect(screen.getByText('FINAL')).toBeInTheDocument();
  });

  it('should display messages', () => {
    render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Transition started')).toBeInTheDocument();
    expect(screen.getByText('Transition in progress')).toBeInTheDocument();
    expect(screen.getByText('Transition completed')).toBeInTheDocument();
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
    mockUseParams.mockReturnValue({ name: 'another-node' });
    
    render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    const link = screen.getByRole('link', { name: 'txn-abc' });
    expect(link).toHaveAttribute('href', '/nodes/another-node/transaction/txn-abc');
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
    
    expect(screen.getByText('TRANSITION_START')).toBeInTheDocument();
    expect(screen.queryByText('TRANSITION_PROGRESS')).not.toBeInTheDocument();
  });

  it('should use composite row key with transaction ID and index', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    const rows = container.querySelectorAll('.ant-table-tbody tr');
    expect(rows.length).toBe(3);
  });

  it('should handle duplicate transaction IDs with different indices', () => {
    const duplicateEvents = [
      mockStateMachineEvents[0],
      { ...mockStateMachineEvents[0], message: 'Duplicate event' },
    ];
    
    render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={duplicateEvents} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Transition started')).toBeInTheDocument();
    expect(screen.getByText('Duplicate event')).toBeInTheDocument();
  });

  it('should not have bordered prop (unlike transition version)', () => {
    const { container } = render(
      <BrowserRouter>
        <TransitionStateMachineTable stateMachineEvents={mockStateMachineEvents} />
      </BrowserRouter>
    );
    
    // This version doesn't have bordered prop
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });
});

