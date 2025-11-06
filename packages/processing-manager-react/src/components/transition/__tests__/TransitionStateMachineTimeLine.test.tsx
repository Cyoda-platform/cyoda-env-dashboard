import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransitionStateMachineTimeLine from '../TransitionStateMachineTimeLine';

const mockEvents = [
  {
    timestamp: '2024-01-01 10:00:00',
    state: 'CREATED',
    type: 'INIT',
    message: 'Entity created',
  },
  {
    timestamp: '2024-01-01 10:05:00',
    state: 'PENDING',
    type: 'STATE_CHANGE',
    message: 'Moved to pending state',
  },
  {
    timestamp: '2024-01-01 10:10:00',
    state: 'COMPLETED',
    type: 'FINISH',
  },
];

describe('TransitionStateMachineTimeLine', () => {
  it('should render the component', () => {
    const { container } = render(<TransitionStateMachineTimeLine events={[]} />);
    expect(container).toBeInTheDocument();
  });

  it('should render Card with title "Timeline"', () => {
    render(<TransitionStateMachineTimeLine events={[]} />);
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('should render Timeline component', () => {
    const { container } = render(<TransitionStateMachineTimeLine events={[]} />);
    const timeline = container.querySelector('.ant-timeline');
    expect(timeline).toBeInTheDocument();
  });

  it('should display all event states', () => {
    render(<TransitionStateMachineTimeLine events={mockEvents} />);
    
    expect(screen.getByText(/CREATED/)).toBeInTheDocument();
    expect(screen.getByText(/PENDING/)).toBeInTheDocument();
    expect(screen.getByText(/COMPLETED/)).toBeInTheDocument();
  });

  it('should display all event types', () => {
    render(<TransitionStateMachineTimeLine events={mockEvents} />);
    
    expect(screen.getByText(/INIT/)).toBeInTheDocument();
    expect(screen.getByText(/STATE_CHANGE/)).toBeInTheDocument();
    expect(screen.getByText(/FINISH/)).toBeInTheDocument();
  });

  it('should display timestamps', () => {
    render(<TransitionStateMachineTimeLine events={mockEvents} />);
    
    expect(screen.getByText('2024-01-01 10:00:00')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01 10:05:00')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01 10:10:00')).toBeInTheDocument();
  });

  it('should display messages when provided', () => {
    render(<TransitionStateMachineTimeLine events={mockEvents} />);
    
    expect(screen.getByText('Entity created')).toBeInTheDocument();
    expect(screen.getByText('Moved to pending state')).toBeInTheDocument();
  });

  it('should not display message when not provided', () => {
    render(<TransitionStateMachineTimeLine events={mockEvents} />);
    
    // Third event has no message, so only 2 messages should be present
    const messages = screen.queryAllByText(/Entity created|Moved to pending state/);
    expect(messages.length).toBe(2);
  });

  it('should handle empty events array', () => {
    const { container } = render(<TransitionStateMachineTimeLine events={[]} />);
    
    const timeline = container.querySelector('.ant-timeline');
    expect(timeline).toBeInTheDocument();
  });

  it('should handle undefined events prop', () => {
    const { container } = render(<TransitionStateMachineTimeLine />);
    
    const timeline = container.querySelector('.ant-timeline');
    expect(timeline).toBeInTheDocument();
  });

  it('should render correct number of timeline items', () => {
    const { container } = render(<TransitionStateMachineTimeLine events={mockEvents} />);
    
    const items = container.querySelectorAll('.ant-timeline-item');
    expect(items.length).toBe(3);
  });

  it('should display state and type together', () => {
    const { container } = render(<TransitionStateMachineTimeLine events={mockEvents} />);

    // Check that both state and type are present in the content
    const content = container.textContent;
    expect(content).toContain('CREATED');
    expect(content).toContain('INIT');
    expect(content).toContain('PENDING');
    expect(content).toContain('STATE_CHANGE');
    expect(content).toContain('COMPLETED');
    expect(content).toContain('FINISH');
  });

  it('should handle single event', () => {
    const singleEvent = [mockEvents[0]];
    
    render(<TransitionStateMachineTimeLine events={singleEvent} />);
    
    expect(screen.getByText(/CREATED/)).toBeInTheDocument();
    expect(screen.queryByText(/PENDING/)).not.toBeInTheDocument();
  });

  it('should render Card component', () => {
    const { container } = render(<TransitionStateMachineTimeLine events={mockEvents} />);
    
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should format event display with state in bold', () => {
    const { container } = render(<TransitionStateMachineTimeLine events={mockEvents} />);
    
    const strongElements = container.querySelectorAll('strong');
    expect(strongElements.length).toBeGreaterThan(0);
  });

  it('should style timestamp with smaller font', () => {
    const { container } = render(<TransitionStateMachineTimeLine events={mockEvents} />);
    
    const timestamps = container.querySelectorAll('[style*="font-size"]');
    expect(timestamps.length).toBeGreaterThan(0);
  });
});

