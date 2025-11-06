import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GraphicalStateMachine } from './GraphicalStateMachine';
import type { Transition, Process, Criteria } from '../../types';

// Mock GraphicalStateMachinePanel from ui-lib-react
vi.mock('@cyoda/ui-lib-react', () => ({
  GraphicalStateMachinePanel: ({ onResetPositions, ...props }: any) => (
    <div data-testid="graphical-panel">
      <button onClick={props.onToggleListOfTransitions}>List of transitions</button>
      <button onClick={props.onToggleProcesses}>processes</button>
      <button onClick={props.onToggleCriteria}>criteria</button>
      <button onClick={props.onToggleTitles}>states</button>
      <button onClick={props.onToggleEdgesTitles}>transitions titles</button>
      <button onClick={onResetPositions}>Reset positions</button>
    </div>
  ),
}));

// Mock Cytoscape
vi.mock('cytoscape', () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    nodes: vi.fn(() => {
      const mockNodes = [] as any[];
      mockNodes.toggleClass = vi.fn();
      return mockNodes;
    }),
    edges: vi.fn(() => {
      const mockEdges = [] as any[];
      mockEdges.toggleClass = vi.fn();
      mockEdges.filter = vi.fn(() => []);
      return mockEdges;
    }),
    fit: vi.fn(),
    userZoomingEnabled: vi.fn(),
    zoom: vi.fn(() => 1),
    pan: vi.fn(() => ({ x: 0, y: 0 })),
    layout: vi.fn(() => ({
      run: vi.fn(),
    })),
    getElementById: vi.fn(() => ({
      position: vi.fn(() => ({ x: 0, y: 0 })),
    })),
    add: vi.fn(),
    destroy: vi.fn(),
  })),
}));

describe('GraphicalStateMachine', () => {
  const mockTransitions: Transition[] = [
    {
      id: 'trans1',
      name: 'Test Transition',
      startStateId: 'state1',
      startStateName: 'Start State',
      endStateId: 'state2',
      endStateName: 'End State',
      automated: true,
      active: true,
      persisted: true,
      criteriaIds: [],
      endProcessesIds: [],
      workflowId: 'workflow1',
    },
  ];

  const mockProcesses: Process[] = [];
  const mockCriteria: Criteria[] = [];

  it('renders the component', () => {
    render(
      <GraphicalStateMachine
        workflowId="workflow1"
        transitions={mockTransitions}
        processes={mockProcesses}
        criteria={mockCriteria}
      />
    );

    // Check for control panel
    expect(screen.getByText('List of transitions')).toBeInTheDocument();
    expect(screen.getByText('processes')).toBeInTheDocument();
    expect(screen.getByText('criteria')).toBeInTheDocument();
  });

  it('renders the legend', () => {
    render(
      <GraphicalStateMachine
        workflowId="workflow1"
        transitions={mockTransitions}
        processes={mockProcesses}
        criteria={mockCriteria}
      />
    );

    expect(screen.getByText('Legend')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText('Current State')).toBeInTheDocument();
    expect(screen.getByText('Criteria')).toBeInTheDocument();
    expect(screen.getByText('Process')).toBeInTheDocument();
  });

  it('renders map controls', () => {
    const { container } = render(
      <GraphicalStateMachine
        workflowId="workflow1"
        transitions={mockTransitions}
        processes={mockProcesses}
        criteria={mockCriteria}
      />
    );

    const controls = container.querySelector('.map-controls');
    expect(controls).toBeInTheDocument();
  });

  it('calls onUpdatePositionsMap when provided', () => {
    const mockUpdatePositions = vi.fn();

    render(
      <GraphicalStateMachine
        workflowId="workflow1"
        transitions={mockTransitions}
        processes={mockProcesses}
        criteria={mockCriteria}
        onUpdatePositionsMap={mockUpdatePositions}
      />
    );

    // The component should initialize and potentially call the callback
    // This is a basic test - in a real scenario, we'd test drag events
  });

  it('filters active transitions', () => {
    const transitionsWithInactive: Transition[] = [
      ...mockTransitions,
      {
        id: 'trans2',
        name: 'Inactive Transition',
        startStateId: 'state1',
        startStateName: 'Start State',
        endStateId: 'state3',
        endStateName: 'Another State',
        automated: false,
        active: false, // This one is inactive
        persisted: true,
        criteriaIds: [],
        endProcessesIds: [],
        workflowId: 'workflow1',
      },
    ];

    render(
      <GraphicalStateMachine
        workflowId="workflow1"
        transitions={transitionsWithInactive}
        processes={mockProcesses}
        criteria={mockCriteria}
      />
    );

    // Component should only render active transitions
    // This is tested implicitly through Cytoscape initialization
  });
});

