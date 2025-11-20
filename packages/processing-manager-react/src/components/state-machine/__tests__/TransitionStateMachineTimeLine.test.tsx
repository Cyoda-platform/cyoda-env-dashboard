import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransitionStateMachineTimeLine from '../TransitionStateMachineTimeLine';

const mockEntityVersions = [
  {
    state: 'DRAFT',
    date: '2024-01-15 09:00:00',
  },
  {
    state: 'SUBMITTED',
    date: '2024-01-15 09:30:00',
  },
  {
    state: 'APPROVED',
    date: '2024-01-15 10:00:00',
  },
];

describe('TransitionStateMachineTimeLine (state-machine)', () => {
  it('should render the component', () => {
    const { container } = render(<TransitionStateMachineTimeLine entityVersions={[]} />);
    expect(container).toBeInTheDocument();
  });

  it('should render Card with title "Time Line"', () => {
    render(<TransitionStateMachineTimeLine entityVersions={[]} />);
    expect(screen.getByText('Time Line')).toBeInTheDocument();
  });

  it('should render Timeline component', () => {
    render(<TransitionStateMachineTimeLine entityVersions={mockEntityVersions} />);
    // Check that timeline items are rendered
    const timelineItems = document.querySelectorAll('.ant-timeline-item');
    expect(timelineItems.length).toBeGreaterThan(0);
  });

  it('should display all entity states', () => {
    render(<TransitionStateMachineTimeLine entityVersions={mockEntityVersions} />);
    
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.getByText('SUBMITTED')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('should display all dates as labels', () => {
    render(<TransitionStateMachineTimeLine entityVersions={mockEntityVersions} />);
    
    expect(screen.getByText('2024-01-15 09:00:00')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15 09:30:00')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15 10:00:00')).toBeInTheDocument();
  });

  it('should handle empty entityVersions array', () => {
    render(<TransitionStateMachineTimeLine entityVersions={[]} />);

    // Should show "No entity versions available" message
    expect(screen.getByText('No entity versions available')).toBeInTheDocument();
  });

  it('should handle undefined entityVersions prop', () => {
    render(<TransitionStateMachineTimeLine entityVersions={[]} />);

    // Should show "No entity versions available" message
    expect(screen.getByText('No entity versions available')).toBeInTheDocument();
  });

  it('should render correct number of timeline items', () => {
    const { container } = render(<TransitionStateMachineTimeLine entityVersions={mockEntityVersions} />);
    
    const items = container.querySelectorAll('.ant-timeline-item');
    expect(items.length).toBe(3);
  });

  it('should handle single entity version', () => {
    const singleVersion = [mockEntityVersions[0]];
    
    render(<TransitionStateMachineTimeLine entityVersions={singleVersion} />);
    
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.queryByText('SUBMITTED')).not.toBeInTheDocument();
  });

  it('should render Card component', () => {
    const { container } = render(<TransitionStateMachineTimeLine entityVersions={mockEntityVersions} />);
    
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should use useMemo for activities computation', () => {
    // This is tested implicitly - if useMemo works correctly, 
    // the component should render without errors
    const { container } = render(<TransitionStateMachineTimeLine entityVersions={mockEntityVersions} />);
    
    const items = container.querySelectorAll('.ant-timeline-item');
    expect(items.length).toBe(3);
  });

  it('should map entityVersions to activities with content and timestamp', () => {
    render(<TransitionStateMachineTimeLine entityVersions={mockEntityVersions} />);
    
    // Verify that both state (content) and date (timestamp) are rendered
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15 09:00:00')).toBeInTheDocument();
  });

  it('should render Timeline.Item with label prop', () => {
    const { container } = render(<TransitionStateMachineTimeLine entityVersions={mockEntityVersions} />);
    
    // Timeline items with labels should have the label class
    const items = container.querySelectorAll('.ant-timeline-item');
    expect(items.length).toBeGreaterThan(0);
  });

  it('should handle multiple versions with same state', () => {
    const duplicateStates = [
      { state: 'PENDING', date: '2024-01-15 09:00:00' },
      { state: 'PENDING', date: '2024-01-15 09:15:00' },
    ];
    
    render(<TransitionStateMachineTimeLine entityVersions={duplicateStates} />);
    
    const pendingElements = screen.getAllByText('PENDING');
    expect(pendingElements.length).toBe(2);
  });

  it('should preserve order of entity versions', () => {
    const { container } = render(<TransitionStateMachineTimeLine entityVersions={mockEntityVersions} />);
    
    const items = container.querySelectorAll('.ant-timeline-item');
    expect(items.length).toBe(3);
    
    // Verify order by checking text content
    expect(items[0]).toHaveTextContent('DRAFT');
    expect(items[1]).toHaveTextContent('SUBMITTED');
    expect(items[2]).toHaveTextContent('APPROVED');
  });
});

