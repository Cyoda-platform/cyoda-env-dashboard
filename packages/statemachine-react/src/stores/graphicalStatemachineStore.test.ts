/**
 * Graphical State Machine Store Tests
 * Tests for the graphical state machine Zustand store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGraphicalStatemachineStore } from './graphicalStatemachineStore';
import type { PositionsMap } from '../types';

describe('useGraphicalStatemachineStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useGraphicalStatemachineStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('Initial State', () => {
    it('should have null positionsMap by default', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      expect(result.current.positionsMap).toBeNull();
    });

    it('should have empty transitionsShowHideList by default', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      expect(result.current.transitionsShowHideList).toEqual([]);
    });
  });

  describe('setPositionsMap', () => {
    it('should set positions map', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      const positionsMap: PositionsMap = {
        'state-1': { x: 100, y: 200 },
        'state-2': { x: 300, y: 400 },
      };
      
      act(() => {
        result.current.setPositionsMap(positionsMap);
      });
      
      expect(result.current.positionsMap).toEqual(positionsMap);
    });

    it('should set positions map to null', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      // First set a map
      const positionsMap: PositionsMap = {
        'state-1': { x: 100, y: 200 },
      };
      
      act(() => {
        result.current.setPositionsMap(positionsMap);
      });
      
      expect(result.current.positionsMap).toEqual(positionsMap);
      
      // Then set to null
      act(() => {
        result.current.setPositionsMap(null);
      });
      
      expect(result.current.positionsMap).toBeNull();
    });

    it('should replace existing positions map', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      const firstMap: PositionsMap = {
        'state-1': { x: 100, y: 200 },
      };
      
      const secondMap: PositionsMap = {
        'state-2': { x: 300, y: 400 },
      };
      
      act(() => {
        result.current.setPositionsMap(firstMap);
      });
      
      expect(result.current.positionsMap).toEqual(firstMap);
      
      act(() => {
        result.current.setPositionsMap(secondMap);
      });
      
      expect(result.current.positionsMap).toEqual(secondMap);
    });
  });

  describe('updatePositionsMap', () => {
    it('should merge new positions with existing map', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      const initialMap: PositionsMap = {
        'state-1': { x: 100, y: 200 },
        'state-2': { x: 300, y: 400 },
      };
      
      act(() => {
        result.current.setPositionsMap(initialMap);
      });
      
      const updateMap: PositionsMap = {
        'state-3': { x: 500, y: 600 },
      };
      
      act(() => {
        result.current.updatePositionsMap(updateMap);
      });
      
      expect(result.current.positionsMap).toEqual({
        'state-1': { x: 100, y: 200 },
        'state-2': { x: 300, y: 400 },
        'state-3': { x: 500, y: 600 },
      });
    });

    it('should update existing position in map', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      const initialMap: PositionsMap = {
        'state-1': { x: 100, y: 200 },
        'state-2': { x: 300, y: 400 },
      };
      
      act(() => {
        result.current.setPositionsMap(initialMap);
      });
      
      const updateMap: PositionsMap = {
        'state-1': { x: 150, y: 250 },
      };
      
      act(() => {
        result.current.updatePositionsMap(updateMap);
      });
      
      expect(result.current.positionsMap).toEqual({
        'state-1': { x: 150, y: 250 },
        'state-2': { x: 300, y: 400 },
      });
    });

    it('should handle update when positionsMap is null', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      expect(result.current.positionsMap).toBeNull();
      
      const updateMap: PositionsMap = {
        'state-1': { x: 100, y: 200 },
      };
      
      act(() => {
        result.current.updatePositionsMap(updateMap);
      });
      
      expect(result.current.positionsMap).toEqual({
        'state-1': { x: 100, y: 200 },
      });
    });

    it('should handle multiple updates', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      act(() => {
        result.current.updatePositionsMap({ 'state-1': { x: 100, y: 200 } });
      });
      
      act(() => {
        result.current.updatePositionsMap({ 'state-2': { x: 300, y: 400 } });
      });
      
      act(() => {
        result.current.updatePositionsMap({ 'state-1': { x: 150, y: 250 } });
      });
      
      expect(result.current.positionsMap).toEqual({
        'state-1': { x: 150, y: 250 },
        'state-2': { x: 300, y: 400 },
      });
    });
  });

  describe('setTransitionsShowHideList', () => {
    it('should set transitions show/hide list', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      const list = ['transition-1', 'transition-2'];
      
      act(() => {
        result.current.setTransitionsShowHideList(list);
      });
      
      expect(result.current.transitionsShowHideList).toEqual(list);
    });

    it('should replace existing list', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      const firstList = ['transition-1', 'transition-2'];
      const secondList = ['transition-3'];
      
      act(() => {
        result.current.setTransitionsShowHideList(firstList);
      });
      
      expect(result.current.transitionsShowHideList).toEqual(firstList);
      
      act(() => {
        result.current.setTransitionsShowHideList(secondList);
      });
      
      expect(result.current.transitionsShowHideList).toEqual(secondList);
    });

    it('should set empty list', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      act(() => {
        result.current.setTransitionsShowHideList(['transition-1']);
      });
      
      act(() => {
        result.current.setTransitionsShowHideList([]);
      });
      
      expect(result.current.transitionsShowHideList).toEqual([]);
    });
  });

  describe('toggleTransitionVisibility', () => {
    it('should add transition to list when not present', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      act(() => {
        result.current.toggleTransitionVisibility('transition-1');
      });
      
      expect(result.current.transitionsShowHideList).toEqual(['transition-1']);
    });

    it('should remove transition from list when present', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      act(() => {
        result.current.setTransitionsShowHideList(['transition-1', 'transition-2']);
      });
      
      act(() => {
        result.current.toggleTransitionVisibility('transition-1');
      });
      
      expect(result.current.transitionsShowHideList).toEqual(['transition-2']);
    });

    it('should toggle transition multiple times', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());
      
      // Add
      act(() => {
        result.current.toggleTransitionVisibility('transition-1');
      });
      expect(result.current.transitionsShowHideList).toEqual(['transition-1']);
      
      // Remove
      act(() => {
        result.current.toggleTransitionVisibility('transition-1');
      });
      expect(result.current.transitionsShowHideList).toEqual([]);
      
      // Add again
      act(() => {
        result.current.toggleTransitionVisibility('transition-1');
      });
      expect(result.current.transitionsShowHideList).toEqual(['transition-1']);
    });

    it('should handle toggling multiple different transitions', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());

      act(() => {
        result.current.toggleTransitionVisibility('transition-1');
      });

      act(() => {
        result.current.toggleTransitionVisibility('transition-2');
      });

      act(() => {
        result.current.toggleTransitionVisibility('transition-3');
      });

      expect(result.current.transitionsShowHideList).toEqual([
        'transition-1',
        'transition-2',
        'transition-3',
      ]);

      // Remove middle one
      act(() => {
        result.current.toggleTransitionVisibility('transition-2');
      });

      expect(result.current.transitionsShowHideList).toEqual([
        'transition-1',
        'transition-3',
      ]);
    });

    it('should not add duplicates when toggling', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());

      act(() => {
        result.current.toggleTransitionVisibility('transition-1');
      });

      expect(result.current.transitionsShowHideList).toEqual(['transition-1']);

      // Toggle off
      act(() => {
        result.current.toggleTransitionVisibility('transition-1');
      });

      expect(result.current.transitionsShowHideList).toEqual([]);

      // Toggle on again - should not create duplicate
      act(() => {
        result.current.toggleTransitionVisibility('transition-1');
      });

      expect(result.current.transitionsShowHideList).toEqual(['transition-1']);
    });
  });

  describe('reset', () => {
    it('should reset positionsMap to null', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());

      const positionsMap: PositionsMap = {
        'state-1': { x: 100, y: 200 },
      };

      act(() => {
        result.current.setPositionsMap(positionsMap);
      });

      expect(result.current.positionsMap).toEqual(positionsMap);

      act(() => {
        result.current.reset();
      });

      expect(result.current.positionsMap).toBeNull();
    });

    it('should reset transitionsShowHideList to empty array', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());

      act(() => {
        result.current.setTransitionsShowHideList(['transition-1', 'transition-2']);
      });

      expect(result.current.transitionsShowHideList).toEqual(['transition-1', 'transition-2']);

      act(() => {
        result.current.reset();
      });

      expect(result.current.transitionsShowHideList).toEqual([]);
    });

    it('should reset all state at once', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());

      const positionsMap: PositionsMap = {
        'state-1': { x: 100, y: 200 },
        'state-2': { x: 300, y: 400 },
      };

      act(() => {
        result.current.setPositionsMap(positionsMap);
        result.current.setTransitionsShowHideList(['transition-1', 'transition-2']);
      });

      expect(result.current.positionsMap).toEqual(positionsMap);
      expect(result.current.transitionsShowHideList).toEqual(['transition-1', 'transition-2']);

      act(() => {
        result.current.reset();
      });

      expect(result.current.positionsMap).toBeNull();
      expect(result.current.transitionsShowHideList).toEqual([]);
    });

    it('should allow setting state after reset', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());

      // Set initial state
      act(() => {
        result.current.setPositionsMap({ 'state-1': { x: 100, y: 200 } });
        result.current.setTransitionsShowHideList(['transition-1']);
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      // Set new state
      const newMap: PositionsMap = {
        'state-2': { x: 300, y: 400 },
      };

      act(() => {
        result.current.setPositionsMap(newMap);
        result.current.setTransitionsShowHideList(['transition-2']);
      });

      expect(result.current.positionsMap).toEqual(newMap);
      expect(result.current.transitionsShowHideList).toEqual(['transition-2']);
    });
  });

  describe('State Sharing', () => {
    it('should share state between multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useGraphicalStatemachineStore());
      const { result: result2 } = renderHook(() => useGraphicalStatemachineStore());

      const positionsMap: PositionsMap = {
        'state-1': { x: 100, y: 200 },
      };

      // Change state in first instance
      act(() => {
        result1.current.setPositionsMap(positionsMap);
      });

      // Both instances should have the same state
      expect(result1.current.positionsMap).toEqual(positionsMap);
      expect(result2.current.positionsMap).toEqual(positionsMap);
    });

    it('should update all instances when state changes', () => {
      const { result: result1 } = renderHook(() => useGraphicalStatemachineStore());
      const { result: result2 } = renderHook(() => useGraphicalStatemachineStore());

      // Change positions map
      act(() => {
        result1.current.setPositionsMap({ 'state-1': { x: 100, y: 200 } });
      });

      expect(result1.current.positionsMap).toEqual({ 'state-1': { x: 100, y: 200 } });
      expect(result2.current.positionsMap).toEqual({ 'state-1': { x: 100, y: 200 } });

      // Change transitions list
      act(() => {
        result2.current.setTransitionsShowHideList(['transition-1']);
      });

      expect(result1.current.transitionsShowHideList).toEqual(['transition-1']);
      expect(result2.current.transitionsShowHideList).toEqual(['transition-1']);
    });

    it('should share toggle operations between instances', () => {
      const { result: result1 } = renderHook(() => useGraphicalStatemachineStore());
      const { result: result2 } = renderHook(() => useGraphicalStatemachineStore());

      // Toggle in first instance
      act(() => {
        result1.current.toggleTransitionVisibility('transition-1');
      });

      expect(result1.current.transitionsShowHideList).toEqual(['transition-1']);
      expect(result2.current.transitionsShowHideList).toEqual(['transition-1']);

      // Toggle in second instance
      act(() => {
        result2.current.toggleTransitionVisibility('transition-1');
      });

      expect(result1.current.transitionsShowHideList).toEqual([]);
      expect(result2.current.transitionsShowHideList).toEqual([]);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle workflow with multiple states and transitions', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());

      // Set up a complex workflow
      const workflowPositions: PositionsMap = {
        'state-initial': { x: 100, y: 100 },
        'state-processing': { x: 300, y: 100 },
        'state-approved': { x: 500, y: 100 },
        'state-rejected': { x: 500, y: 300 },
        'state-final': { x: 700, y: 200 },
      };

      act(() => {
        result.current.setPositionsMap(workflowPositions);
      });

      expect(result.current.positionsMap).toEqual(workflowPositions);

      // Hide some transitions
      act(() => {
        result.current.toggleTransitionVisibility('transition-to-rejected');
        result.current.toggleTransitionVisibility('transition-to-approved');
      });

      expect(result.current.transitionsShowHideList).toEqual([
        'transition-to-rejected',
        'transition-to-approved',
      ]);

      // Update position of one state
      act(() => {
        result.current.updatePositionsMap({
          'state-processing': { x: 350, y: 150 },
        });
      });

      expect(result.current.positionsMap).toEqual({
        ...workflowPositions,
        'state-processing': { x: 350, y: 150 },
      });
    });

    it('should handle switching between different workflows', () => {
      const { result } = renderHook(() => useGraphicalStatemachineStore());

      // Workflow 1
      const workflow1Positions: PositionsMap = {
        'workflow1-state1': { x: 100, y: 100 },
        'workflow1-state2': { x: 200, y: 200 },
      };

      act(() => {
        result.current.setPositionsMap(workflow1Positions);
        result.current.setTransitionsShowHideList(['workflow1-transition1']);
      });

      expect(result.current.positionsMap).toEqual(workflow1Positions);
      expect(result.current.transitionsShowHideList).toEqual(['workflow1-transition1']);

      // Switch to Workflow 2
      const workflow2Positions: PositionsMap = {
        'workflow2-state1': { x: 300, y: 300 },
        'workflow2-state2': { x: 400, y: 400 },
      };

      act(() => {
        result.current.setPositionsMap(workflow2Positions);
        result.current.setTransitionsShowHideList(['workflow2-transition1']);
      });

      expect(result.current.positionsMap).toEqual(workflow2Positions);
      expect(result.current.transitionsShowHideList).toEqual(['workflow2-transition1']);
    });
  });
});

