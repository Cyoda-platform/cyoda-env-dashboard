import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { convertToReactFlow, extractPositionsMap, NONE_STATE_ID } from './reactFlowUtils';
import type { Transition, PositionsMap } from '../../types';

describe('reactFlowUtils', () => {
  // Mock console.log to avoid cluttering test output
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('NONE_STATE_ID', () => {
    it('should be defined as noneState', () => {
      expect(NONE_STATE_ID).toBe('noneState');
    });
  });

  describe('convertToReactFlow', () => {
    describe('Basic Conversion', () => {
      it('should convert empty transitions array', () => {
        const result = convertToReactFlow([], null, '');

        expect(result.nodes).toHaveLength(0);
        expect(result.edges).toHaveLength(0);
      });

      it('should create nodes and edges from single transition', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Submit',
            startStateId: 'state-1',
            startStateName: 'Draft',
            endStateId: 'state-2',
            endStateName: 'Submitted',
            automated: false,
            persisted: true,
          },
        ];

        const result = convertToReactFlow(transitions, null, '');

        expect(result.nodes).toHaveLength(2);
        expect(result.edges).toHaveLength(1);
      });

      it('should create correct node structure', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Submit',
            startStateId: 'state-1',
            startStateName: 'Draft',
            endStateId: 'state-2',
            endStateName: 'Submitted',
            automated: false,
            persisted: true,
          },
        ];

        const result = convertToReactFlow(transitions, null, '');

        const node1 = result.nodes.find(n => n.id === 'state-1');
        expect(node1).toBeDefined();
        expect(node1?.type).toBe('stateNode');
        expect(node1?.data.title).toBe('Draft');
        expect(node1?.data.entityId).toBe('state-1');
        expect(node1?.data.persisted).toBe(true);
        expect(node1?.data.isCurrentState).toBe(false);
        expect(node1?.data.isNoneState).toBe(false);
      });

      it('should create correct edge structure', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Submit',
            startStateId: 'state-1',
            startStateName: 'Draft',
            endStateId: 'state-2',
            endStateName: 'Submitted',
            automated: false,
            persisted: true,
          },
        ];

        const result = convertToReactFlow(transitions, null, '');

        const edge = result.edges[0];
        expect(edge.id).toBe('transition-1');
        expect(edge.source).toBe('state-1');
        expect(edge.target).toBe('state-2');
        expect(edge.type).toBe('transitionEdge');
        expect(edge.data?.title).toBe('[M] Submit');
        expect(edge.data?.automated).toBe(false);
        expect(edge.data?.persisted).toBe(true);
        expect(edge.animated).toBe(false);
      });
    });

    describe('Multiple Transitions', () => {
      it('should handle multiple transitions with shared states', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Submit',
            startStateId: 'state-1',
            startStateName: 'Draft',
            endStateId: 'state-2',
            endStateName: 'Submitted',
            automated: false,
            persisted: true,
          },
          {
            id: 'transition-2',
            name: 'Approve',
            startStateId: 'state-2',
            startStateName: 'Submitted',
            endStateId: 'state-3',
            endStateName: 'Approved',
            automated: false,
            persisted: true,
          },
        ];

        const result = convertToReactFlow(transitions, null, '');

        // Should have 3 unique states
        expect(result.nodes).toHaveLength(3);
        // Should have 2 transitions
        expect(result.edges).toHaveLength(2);
      });

      it('should not duplicate nodes for same state', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Submit',
            startStateId: 'state-1',
            startStateName: 'Draft',
            endStateId: 'state-2',
            endStateName: 'Submitted',
            automated: false,
            persisted: true,
          },
          {
            id: 'transition-2',
            name: 'Reject',
            startStateId: 'state-2',
            startStateName: 'Submitted',
            endStateId: 'state-1',
            endStateName: 'Draft',
            automated: false,
            persisted: true,
          },
        ];

        const result = convertToReactFlow(transitions, null, '');

        // Should have 2 unique states (circular reference)
        expect(result.nodes).toHaveLength(2);
        expect(result.edges).toHaveLength(2);
      });
    });

    describe('Automated Transitions', () => {
      it('should mark automated transitions with [A] prefix', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Auto Process',
            startStateId: 'state-1',
            startStateName: 'Draft',
            endStateId: 'state-2',
            endStateName: 'Processed',
            automated: true,
            persisted: true,
          },
        ];

        const result = convertToReactFlow(transitions, null, '');

        const edge = result.edges[0];
        expect(edge.data?.title).toBe('[A] Auto Process');
        expect(edge.data?.automated).toBe(true);
        expect(edge.animated).toBe(true);
      });

      it('should mark manual transitions with [M] prefix', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Manual Process',
            startStateId: 'state-1',
            startStateName: 'Draft',
            endStateId: 'state-2',
            endStateName: 'Processed',
            automated: false,
            persisted: true,
          },
        ];

        const result = convertToReactFlow(transitions, null, '');

        const edge = result.edges[0];
        expect(edge.data?.title).toBe('[M] Manual Process');
        expect(edge.data?.automated).toBe(false);
        expect(edge.animated).toBe(false);
      });
    });

    describe('Current State Highlighting', () => {
      it('should mark current state node', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Submit',
            startStateId: 'state-1',
            startStateName: 'Draft',
            endStateId: 'state-2',
            endStateName: 'Submitted',
            automated: false,
            persisted: true,
          },
        ];

        const result = convertToReactFlow(transitions, null, 'Draft');

        const draftNode = result.nodes.find(n => n.id === 'state-1');
        expect(draftNode?.data.isCurrentState).toBe(true);

        const submittedNode = result.nodes.find(n => n.id === 'state-2');
        expect(submittedNode?.data.isCurrentState).toBe(false);
      });

      it('should handle no current state', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Submit',
            startStateId: 'state-1',
            startStateName: 'Draft',
            endStateId: 'state-2',
            endStateName: 'Submitted',
            automated: false,
            persisted: true,
          },
        ];

        const result = convertToReactFlow(transitions, null, '');

        result.nodes.forEach(node => {
          expect(node.data.isCurrentState).toBe(false);
        });
      });
    });

    describe('None State Handling', () => {
      it('should mark none state nodes', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Create',
            startStateId: NONE_STATE_ID,
            startStateName: 'None',
            endStateId: 'state-1',
            endStateName: 'Draft',
            automated: false,
            persisted: true,
          },
        ];

        const result = convertToReactFlow(transitions, null, '');

        const noneNode = result.nodes.find(n => n.id === NONE_STATE_ID);
        expect(noneNode?.data.isNoneState).toBe(true);

        const draftNode = result.nodes.find(n => n.id === 'state-1');
        expect(draftNode?.data.isNoneState).toBe(false);
      });
    });

    describe('Position Handling', () => {
      it('should use provided positions map', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Submit',
            startStateId: 'state-1',
            startStateName: 'Draft',
            endStateId: 'state-2',
            endStateName: 'Submitted',
            automated: false,
            persisted: true,
          },
        ];

        const positionsMap: PositionsMap = {
          'state-1': { x: 100, y: 200 },
          'state-2': { x: 500, y: 200 },
        };

        const result = convertToReactFlow(transitions, positionsMap, '');

        const node1 = result.nodes.find(n => n.id === 'state-1');
        expect(node1?.position).toEqual({ x: 100, y: 200 });

        const node2 = result.nodes.find(n => n.id === 'state-2');
        expect(node2?.position).toEqual({ x: 500, y: 200 });
      });

      it('should calculate hierarchical layout when no positions provided', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Submit',
            startStateId: 'state-1',
            startStateName: 'Draft',
            endStateId: 'state-2',
            endStateName: 'Submitted',
            automated: false,
            persisted: true,
          },
        ];

        const result = convertToReactFlow(transitions, null, '');

        const node1 = result.nodes.find(n => n.id === 'state-1');
        const node2 = result.nodes.find(n => n.id === 'state-2');

        // Positions should be calculated (not 0,0)
        expect(node1?.position).toBeDefined();
        expect(node2?.position).toBeDefined();
        
        // Level 0 should be at x=0, level 1 at x=400
        expect(node1?.position.x).toBe(0);
        expect(node2?.position.x).toBe(400);
      });

      it('should handle partial positions map', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Submit',
            startStateId: 'state-1',
            startStateName: 'Draft',
            endStateId: 'state-2',
            endStateName: 'Submitted',
            automated: false,
            persisted: true,
          },
        ];

        const positionsMap: PositionsMap = {
          'state-1': { x: 100, y: 200 },
          // state-2 position not provided
        };

        const result = convertToReactFlow(transitions, positionsMap, '');

        const node1 = result.nodes.find(n => n.id === 'state-1');
        expect(node1?.position).toEqual({ x: 100, y: 200 });

        const node2 = result.nodes.find(n => n.id === 'state-2');
        // Should keep initial position (0, 0) since not in map
        expect(node2?.position).toEqual({ x: 0, y: 0 });
      });
    });

    describe('Edge Cases', () => {
      it('should handle transition without state names', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Submit',
            startStateId: 'state-1',
            endStateId: 'state-2',
            automated: false,
            persisted: true,
          } as Transition,
        ];

        const result = convertToReactFlow(transitions, null, '');

        const node1 = result.nodes.find(n => n.id === 'state-1');
        expect(node1?.data.title).toBe('state-1'); // Falls back to ID

        const node2 = result.nodes.find(n => n.id === 'state-2');
        expect(node2?.data.title).toBe('state-2'); // Falls back to ID
      });

      it('should handle transition without persisted flag', () => {
        const transitions: Transition[] = [
          {
            id: 'transition-1',
            name: 'Submit',
            startStateId: 'state-1',
            startStateName: 'Draft',
            endStateId: 'state-2',
            endStateName: 'Submitted',
            automated: false,
          } as Transition,
        ];

        const result = convertToReactFlow(transitions, null, '');

        const node1 = result.nodes.find(n => n.id === 'state-1');
        expect(node1?.data.persisted).toBe(true); // Defaults to true
      });
    });
  });

  describe('extractPositionsMap', () => {
    it('should extract positions from nodes', () => {
      const nodes = [
        {
          id: 'state-1',
          type: 'stateNode',
          position: { x: 100, y: 200 },
          data: {},
        },
        {
          id: 'state-2',
          type: 'stateNode',
          position: { x: 500, y: 200 },
          data: {},
        },
      ];

      const positionsMap = extractPositionsMap(nodes);

      expect(positionsMap).toEqual({
        'state-1': { x: 100, y: 200 },
        'state-2': { x: 500, y: 200 },
      });
    });

    it('should handle empty nodes array', () => {
      const positionsMap = extractPositionsMap([]);

      expect(positionsMap).toEqual({});
    });

    it('should handle single node', () => {
      const nodes = [
        {
          id: 'state-1',
          type: 'stateNode',
          position: { x: 100, y: 200 },
          data: {},
        },
      ];

      const positionsMap = extractPositionsMap(nodes);

      expect(positionsMap).toEqual({
        'state-1': { x: 100, y: 200 },
      });
    });

    it('should handle nodes with zero positions', () => {
      const nodes = [
        {
          id: 'state-1',
          type: 'stateNode',
          position: { x: 0, y: 0 },
          data: {},
        },
      ];

      const positionsMap = extractPositionsMap(nodes);

      expect(positionsMap).toEqual({
        'state-1': { x: 0, y: 0 },
      });
    });

    it('should handle nodes with negative positions', () => {
      const nodes = [
        {
          id: 'state-1',
          type: 'stateNode',
          position: { x: -100, y: -200 },
          data: {},
        },
      ];

      const positionsMap = extractPositionsMap(nodes);

      expect(positionsMap).toEqual({
        'state-1': { x: -100, y: -200 },
      });
    });
  });
});

