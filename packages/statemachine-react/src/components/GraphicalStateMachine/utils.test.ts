/**
 * Tests for GraphicalStateMachine utility functions
 */

import { describe, it, expect, vi } from 'vitest';
import {
  ellipsis,
  positionBetween,
  NONE_STATE_ID,
  fillPositionsMap,
  getChildPosition,
  getProcessCompoundPosition,
  getStartStateNode,
  getEndStateNode,
  getStatesTransitionsEles,
  getCriteriaChildrenEles,
  getCriteriaEles,
  getProcessesChildEles,
  getProcessesEles,
} from './utils';
import type { Position, PositionsMap, Criteria, Process } from '../../types';

// Mock Transition type for testing (based on GraphicalStateMachine usage)
interface MockTransition {
  id: string;
  name: string;
  startStateId: string;
  startStateName: string;
  endStateId: string;
  endStateName: string;
  automated: boolean;
  persisted: boolean;
  workflowId: string;
  active?: boolean;
  criteriaIds?: string[];
  endProcessesIds?: any[];
}

describe('GraphicalStateMachine Utils', () => {
  describe('NONE_STATE_ID', () => {
    it('should have the correct constant value', () => {
      expect(NONE_STATE_ID).toBe('noneState');
    });
  });

  describe('ellipsis', () => {
    describe('basic functionality', () => {
      it('should return string as-is when shorter than limit', () => {
        expect(ellipsis('Short text')).toBe('Short text');
      });

      it('should truncate string when equal to limit', () => {
        const text = 'a'.repeat(38);
        const result = ellipsis(text);
        // substr(0, 38) gets 38 chars, then adds '...'
        expect(result).toBe('a'.repeat(38) + '...');
      });

      it('should truncate string when longer than limit', () => {
        const text = 'This is a very long text that should be truncated';
        const result = ellipsis(text);
        // Takes first 38 chars, trims, then adds '...'
        expect(result).toBe('This is a very long text that should b...');
        expect(result.length).toBeLessThan(text.length);
      });

      it('should trim whitespace before adding postfix', () => {
        const text = 'This is a very long text with spaces that should be truncated';
        const result = ellipsis(text);
        expect(result).not.toContain(' ...');
        expect(result.endsWith('...')).toBe(true);
      });
    });

    describe('custom limit', () => {
      it('should use custom limit when provided', () => {
        const text = 'This is a test';
        expect(ellipsis(text, 10)).toBe('This is a...');
      });

      it('should handle limit of 0', () => {
        expect(ellipsis('test', 0)).toBe('...');
      });

      it('should handle limit of 1', () => {
        expect(ellipsis('test', 1)).toBe('t...');
      });

      it('should handle very large limit', () => {
        const text = 'Short';
        expect(ellipsis(text, 1000)).toBe('Short');
      });
    });

    describe('custom postfix', () => {
      it('should use custom postfix when provided', () => {
        const text = 'This is a very long text that should be truncated';
        expect(ellipsis(text, 20, '…')).toBe('This is a very long…');
      });

      it('should handle empty postfix', () => {
        const text = 'This is a very long text';
        expect(ellipsis(text, 10, '')).toBe('This is a');
      });

      it('should handle long postfix', () => {
        const text = 'This is a very long text';
        expect(ellipsis(text, 10, ' [more]')).toBe('This is a [more]');
      });

      it('should handle special character postfix', () => {
        const text = 'This is a very long text';
        expect(ellipsis(text, 10, '→')).toBe('This is a→');
      });
    });

    describe('edge cases', () => {
      it('should handle empty string', () => {
        expect(ellipsis('')).toBe('');
      });

      it('should handle single character', () => {
        expect(ellipsis('a')).toBe('a');
      });

      it('should handle string with only spaces', () => {
        const spaces = ' '.repeat(50);
        const result = ellipsis(spaces);
        expect(result.endsWith('...')).toBe(true);
      });

      it('should handle string with newlines', () => {
        const text = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7';
        const result = ellipsis(text, 20);
        expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
      });

      it('should handle string with special characters', () => {
        const text = 'Test™ with spëcial çharacters and émojis 🎉🎊';
        const result = ellipsis(text);
        expect(result.endsWith('...')).toBe(true);
      });

      it('should handle Unicode characters', () => {
        const text = '中文字符测试这是一个很长的中文字符串需要被截断';
        const result = ellipsis(text, 10);
        expect(result.endsWith('...')).toBe(true);
        expect(result.length).toBeLessThanOrEqual(13);
      });
    });

    describe('real-world scenarios', () => {
      it('should truncate long workflow names', () => {
        const workflowName = 'Customer Onboarding Process with Multiple Approval Steps';
        const result = ellipsis(workflowName);
        expect(result).toBe('Customer Onboarding Process with Multi...');
      });

      it('should truncate long state names', () => {
        const stateName = 'Waiting for Manager Approval and Document Verification';
        const result = ellipsis(stateName);
        expect(result).toBe('Waiting for Manager Approval and Docum...');
      });

      it('should not truncate short transition names', () => {
        const transitionName = 'Approve';
        expect(ellipsis(transitionName)).toBe('Approve');
      });

      it('should handle node titles in graph', () => {
        const title = '[A] Automated Transition to Next State';
        const result = ellipsis(title, 30);
        expect(result).toBe('[A] Automated Transition to Ne...');
      });
    });
  });

  describe('positionBetween', () => {
    describe('basic functionality', () => {
      it('should calculate midpoint between two positions', () => {
        const start: Position = { x: 0, y: 0 };
        const end: Position = { x: 100, y: 100 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: 50, y: 50 });
      });

      it('should handle positions with same coordinates', () => {
        const start: Position = { x: 50, y: 50 };
        const end: Position = { x: 50, y: 50 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: 50, y: 50 });
      });

      it('should handle horizontal line', () => {
        const start: Position = { x: 0, y: 50 };
        const end: Position = { x: 100, y: 50 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: 50, y: 50 });
      });

      it('should handle vertical line', () => {
        const start: Position = { x: 50, y: 0 };
        const end: Position = { x: 50, y: 100 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: 50, y: 50 });
      });
    });

    describe('negative coordinates', () => {
      it('should handle negative start position', () => {
        const start: Position = { x: -100, y: -100 };
        const end: Position = { x: 100, y: 100 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: 0, y: 0 });
      });

      it('should handle negative end position', () => {
        const start: Position = { x: 100, y: 100 };
        const end: Position = { x: -100, y: -100 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: 0, y: 0 });
      });

      it('should handle both negative positions', () => {
        const start: Position = { x: -200, y: -200 };
        const end: Position = { x: -100, y: -100 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: -150, y: -150 });
      });
    });

    describe('decimal coordinates', () => {
      it('should handle decimal positions', () => {
        const start: Position = { x: 10.5, y: 20.5 };
        const end: Position = { x: 30.5, y: 40.5 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: 20.5, y: 30.5 });
      });

      it('should handle positions resulting in decimal midpoint', () => {
        const start: Position = { x: 0, y: 0 };
        const end: Position = { x: 1, y: 1 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: 0.5, y: 0.5 });
      });

      it('should handle very small decimal differences', () => {
        const start: Position = { x: 100.1, y: 200.1 };
        const end: Position = { x: 100.3, y: 200.3 };
        const result = positionBetween(start, end);
        expect(result.x).toBeCloseTo(100.2, 10);
        expect(result.y).toBeCloseTo(200.2, 10);
      });
    });

    describe('large coordinates', () => {
      it('should handle large positive coordinates', () => {
        const start: Position = { x: 10000, y: 20000 };
        const end: Position = { x: 30000, y: 40000 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: 20000, y: 30000 });
      });

      it('should handle very large coordinates', () => {
        const start: Position = { x: 1000000, y: 2000000 };
        const end: Position = { x: 3000000, y: 4000000 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: 2000000, y: 3000000 });
      });
    });

    describe('asymmetric positions', () => {
      it('should handle different x and y distances', () => {
        const start: Position = { x: 0, y: 0 };
        const end: Position = { x: 100, y: 200 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: 50, y: 100 });
      });

      it('should handle reversed positions', () => {
        const start: Position = { x: 100, y: 200 };
        const end: Position = { x: 0, y: 0 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: 50, y: 100 });
      });
    });

    describe('real-world scenarios', () => {
      it('should calculate position for criteria node between states', () => {
        const startState: Position = { x: 100, y: 100 };
        const endState: Position = { x: 300, y: 100 };
        const criteriaPosition = positionBetween(startState, endState);
        expect(criteriaPosition).toEqual({ x: 200, y: 100 });
      });

      it('should calculate position for process node', () => {
        const transitionStart: Position = { x: 150, y: 200 };
        const transitionEnd: Position = { x: 350, y: 400 };
        const processPosition = positionBetween(transitionStart, transitionEnd);
        expect(processPosition).toEqual({ x: 250, y: 300 });
      });

      it('should handle diagonal transitions', () => {
        const state1: Position = { x: 0, y: 0 };
        const state2: Position = { x: 200, y: 300 };
        const midpoint = positionBetween(state1, state2);
        expect(midpoint).toEqual({ x: 100, y: 150 });
      });
    });

    describe('edge cases', () => {
      it('should handle zero coordinates', () => {
        const start: Position = { x: 0, y: 0 };
        const end: Position = { x: 0, y: 0 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: 0, y: 0 });
      });

      it('should handle one zero coordinate', () => {
        const start: Position = { x: 0, y: 100 };
        const end: Position = { x: 100, y: 0 };
        const result = positionBetween(start, end);
        expect(result).toEqual({ x: 50, y: 50 });
      });
    });
  });

  describe('fillPositionsMap', () => {
    describe('basic functionality', () => {
      it('should create positions map from node array', () => {
        const nodes = [
          { data: () => ({ id: 'node1' }), position: () => ({ x: 100, y: 200 }) },
          { data: () => ({ id: 'node2' }), position: () => ({ x: 300, y: 400 }) },
        ];

        const result = fillPositionsMap(nodes);

        expect(result).toEqual({
          node1: { x: 100, y: 200 },
          node2: { x: 300, y: 400 },
        });
      });

      it('should handle empty array', () => {
        const result = fillPositionsMap([]);
        expect(result).toEqual({});
      });

      it('should handle single node', () => {
        const nodes = [
          { data: () => ({ id: 'single' }), position: () => ({ x: 50, y: 75 }) },
        ];

        const result = fillPositionsMap(nodes);

        expect(result).toEqual({
          single: { x: 50, y: 75 },
        });
      });
    });

    describe('with existing map', () => {
      it('should merge with existing positions map', () => {
        const existingMap: PositionsMap = {
          existing1: { x: 10, y: 20 },
          existing2: { x: 30, y: 40 },
        };

        const nodes = [
          { data: () => ({ id: 'new1' }), position: () => ({ x: 100, y: 200 }) },
        ];

        const result = fillPositionsMap(nodes, existingMap);

        expect(result).toEqual({
          existing1: { x: 10, y: 20 },
          existing2: { x: 30, y: 40 },
          new1: { x: 100, y: 200 },
        });
      });

      it('should override existing positions with same id', () => {
        const existingMap: PositionsMap = {
          node1: { x: 10, y: 20 },
        };

        const nodes = [
          { data: () => ({ id: 'node1' }), position: () => ({ x: 100, y: 200 }) },
        ];

        const result = fillPositionsMap(nodes, existingMap);

        expect(result).toEqual({
          node1: { x: 100, y: 200 },
        });
      });
    });

    describe('edge cases', () => {
      it('should handle nodes with decimal positions', () => {
        const nodes = [
          { data: () => ({ id: 'decimal' }), position: () => ({ x: 100.5, y: 200.75 }) },
        ];

        const result = fillPositionsMap(nodes);

        expect(result).toEqual({
          decimal: { x: 100.5, y: 200.75 },
        });
      });

      it('should handle nodes with negative positions', () => {
        const nodes = [
          { data: () => ({ id: 'negative' }), position: () => ({ x: -100, y: -200 }) },
        ];

        const result = fillPositionsMap(nodes);

        expect(result).toEqual({
          negative: { x: -100, y: -200 },
        });
      });

      it('should handle nodes with zero positions', () => {
        const nodes = [
          { data: () => ({ id: 'zero' }), position: () => ({ x: 0, y: 0 }) },
        ];

        const result = fillPositionsMap(nodes);

        expect(result).toEqual({
          zero: { x: 0, y: 0 },
        });
      });
    });
  });

  describe('getProcessCompoundPosition', () => {
    describe('with positionsMap', () => {
      it('should return position from map when available', () => {
        const positionsMap: PositionsMap = {
          'process-123': { x: 150, y: 250 },
        };

        const result = getProcessCompoundPosition(
          'process-123',
          { x: 100, y: 200 },
          positionsMap
        );

        expect(result).toEqual({ x: 150, y: 250 });
      });

      it('should calculate position when not in map', () => {
        const positionsMap: PositionsMap = {
          'other-process': { x: 150, y: 250 },
        };

        const result = getProcessCompoundPosition(
          'process-123',
          { x: 100, y: 200 },
          positionsMap
        );

        expect(result).toEqual({ x: 100, y: 100 });
      });
    });

    describe('without positionsMap', () => {
      it('should calculate position when map is null', () => {
        const result = getProcessCompoundPosition(
          'process-123',
          { x: 100, y: 200 },
          null
        );

        expect(result).toEqual({ x: 100, y: 100 });
      });

      it('should calculate position 100 units above end state', () => {
        const result = getProcessCompoundPosition(
          'any-id',
          { x: 300, y: 400 },
          null
        );

        expect(result).toEqual({ x: 300, y: 300 });
      });
    });

    describe('edge cases', () => {
      it('should handle negative end state position', () => {
        const result = getProcessCompoundPosition(
          'process-id',
          { x: -100, y: -50 },
          null
        );

        expect(result).toEqual({ x: -100, y: -150 });
      });

      it('should handle zero end state position', () => {
        const result = getProcessCompoundPosition(
          'process-id',
          { x: 0, y: 0 },
          null
        );

        expect(result).toEqual({ x: 0, y: -100 });
      });
    });
  });

  describe('getChildPosition', () => {
    describe('single child', () => {
      it('should return compound position for single child', () => {
        const result = getChildPosition({
          compoundPosition: { x: 100, y: 200 },
          index: 0,
          count: 1,
        });

        expect(result).toEqual({ x: 100, y: 200 });
      });

      it('should ignore index for single child', () => {
        const result = getChildPosition({
          compoundPosition: { x: 100, y: 200 },
          index: 5,
          count: 1,
        });

        expect(result).toEqual({ x: 100, y: 200 });
      });
    });

    describe('two children', () => {
      it('should position first child to the left', () => {
        const result = getChildPosition({
          compoundPosition: { x: 100, y: 200 },
          index: 0,
          count: 2,
        });

        // index 0 (even) goes left: x - 100
        // yBase = 200 + 2/4 * 80 = 200 + 40 = 240
        // y = 240 - floor(0/2) * 80 = 240
        expect(result).toEqual({ x: 0, y: 240 });
      });

      it('should position second child to the right', () => {
        const result = getChildPosition({
          compoundPosition: { x: 100, y: 200 },
          index: 1,
          count: 2,
        });

        // index 1 (odd) goes right: x + 100
        // yBase = 200 + 2/4 * 80 = 240
        // y = 240 - floor(1/2) * 80 = 240
        expect(result).toEqual({ x: 200, y: 240 });
      });
    });

    describe('three children', () => {
      it('should position first child to the left', () => {
        const result = getChildPosition({
          compoundPosition: { x: 100, y: 200 },
          index: 0,
          count: 3,
        });

        // yBase = 200 + 3/4 * 80 = 200 + 60 = 260
        expect(result).toEqual({ x: 0, y: 260 });
      });

      it('should position second child to the right', () => {
        const result = getChildPosition({
          compoundPosition: { x: 100, y: 200 },
          index: 1,
          count: 3,
        });

        expect(result).toEqual({ x: 200, y: 260 });
      });

      it('should position third child in center (odd count, last index)', () => {
        const result = getChildPosition({
          compoundPosition: { x: 100, y: 200 },
          index: 2,
          count: 3,
        });

        // Odd count and last index: centered
        // yBase = 200 + 3/4 * 80 = 260
        // y = 260 - floor(2/2) * 80 = 260 - 80 = 180
        expect(result).toEqual({ x: 100, y: 180 });
      });
    });

    describe('four children', () => {
      it('should position children in alternating pattern', () => {
        const compoundPosition = { x: 100, y: 200 };
        const count = 4;

        const positions = [0, 1, 2, 3].map(index =>
          getChildPosition({ compoundPosition, index, count })
        );

        // yBase = 200 + 4/4 * 80 = 280
        // index 0: left, y = 280 - 0 = 280
        // index 1: right, y = 280 - 0 = 280
        // index 2: left, y = 280 - 80 = 200
        // index 3: right, y = 280 - 80 = 200
        expect(positions).toEqual([
          { x: 0, y: 280 },
          { x: 200, y: 280 },
          { x: 0, y: 200 },
          { x: 200, y: 200 },
        ]);
      });
    });

    describe('with maxY constraint', () => {
      it('should limit y position when maxY is provided', () => {
        const result = getChildPosition({
          compoundPosition: { x: 100, y: 200 },
          index: 0,
          count: 10,
          maxY: 250,
        });

        // yBase would be 200 + 10/4 * 80 = 400
        // But maxY = 250, so yBase = min(400, 250) = 250
        expect(result.y).toBeLessThanOrEqual(250);
      });

      it('should not limit when yBase is below maxY', () => {
        const result = getChildPosition({
          compoundPosition: { x: 100, y: 200 },
          index: 0,
          count: 2,
          maxY: 500,
        });

        // yBase = 200 + 2/4 * 80 = 240, which is < 500
        expect(result).toEqual({ x: 0, y: 240 });
      });
    });

    describe('edge cases', () => {
      it('should handle negative compound position', () => {
        const result = getChildPosition({
          compoundPosition: { x: -100, y: -200 },
          index: 0,
          count: 2,
        });

        // yBase = -200 + 2/4 * 80 = -160
        expect(result).toEqual({ x: -200, y: -160 });
      });

      it('should handle zero compound position', () => {
        const result = getChildPosition({
          compoundPosition: { x: 0, y: 0 },
          index: 0,
          count: 2,
        });

        // yBase = 0 + 2/4 * 80 = 40
        expect(result).toEqual({ x: -100, y: 40 });
      });

      it('should handle large count', () => {
        const result = getChildPosition({
          compoundPosition: { x: 100, y: 200 },
          index: 0,
          count: 20,
        });

        // yBase = 200 + 20/4 * 80 = 200 + 400 = 600
        expect(result).toEqual({ x: 0, y: 600 });
      });
    });

    describe('real-world scenarios', () => {
      it('should position criteria nodes correctly', () => {
        // Simulating 3 criteria nodes
        const compoundPosition = { x: 200, y: 300 };
        const count = 3;

        const positions = [0, 1, 2].map(index =>
          getChildPosition({ compoundPosition, index, count })
        );

        expect(positions.length).toBe(3);
        expect(positions[0].x).toBe(100); // left
        expect(positions[1].x).toBe(300); // right
        expect(positions[2].x).toBe(200); // center (odd count, last)
      });

      it('should position process nodes with maxY constraint', () => {
        const compoundPosition = { x: 150, y: 250 };
        const count = 4;
        const maxY = 300;

        const positions = [0, 1, 2, 3].map(index =>
          getChildPosition({ compoundPosition, index, count, maxY })
        );

        // All positions should respect maxY
        positions.forEach(pos => {
          expect(pos.y).toBeLessThanOrEqual(maxY);
        });
      });
    });
  });

  describe('getStartStateNode', () => {
    const createMockTransition = (overrides: Partial<MockTransition> = {}): MockTransition => ({
      id: 'trans-1',
      name: 'Test Transition',
      startStateId: 'state-1',
      startStateName: 'Start State',
      endStateId: 'state-2',
      endStateName: 'End State',
      automated: false,
      persisted: true,
      workflowId: 'workflow-1',
      ...overrides,
    });

    describe('basic functionality', () => {
      it('should create start state node with correct data', () => {
        const transition = createMockTransition();
        const result = getStartStateNode(transition as any, null, false);

        expect(result.data.id).toBe('state-1');
        expect(result.data.entityId).toBe('state-1');
        expect(result.data.title).toBe('Start State');
        expect(result.data.persisted).toBe(true);
        expect(result.data.type).toBe('state');
      });

      it('should set node-state class by default', () => {
        const transition = createMockTransition();
        const result = getStartStateNode(transition as any, null, false);

        expect(result.classes).toBe('node-state');
      });

      it('should add current-state class when isCurrentState is true', () => {
        const transition = createMockTransition();
        const result = getStartStateNode(transition as any, null, true);

        expect(result.classes).toBe('node-state current-state');
      });

      it('should not add current-state class when isCurrentState is false', () => {
        const transition = createMockTransition();
        const result = getStartStateNode(transition as any, null, false);

        expect(result.classes).toBe('node-state');
      });
    });

    describe('NONE_STATE_ID handling', () => {
      it('should set special class for noneState', () => {
        const transition = createMockTransition({ startStateId: 'noneState' });
        const result = getStartStateNode(transition as any, null, false);

        expect(result.classes).toBe('node-state node-state-none');
      });

      it('should override current-state class for noneState', () => {
        const transition = createMockTransition({ startStateId: 'noneState' });
        const result = getStartStateNode(transition as any, null, true);

        expect(result.classes).toBe('node-state node-state-none');
      });
    });

    describe('with positionsMap', () => {
      it('should set position from map when available', () => {
        const positionsMap: PositionsMap = {
          'state-1': { x: 100, y: 200 },
        };
        const transition = createMockTransition();
        const result = getStartStateNode(transition as any, positionsMap, false);

        expect(result.position).toEqual({ x: 100, y: 200 });
        expect(result.locked).toBe(true);
      });

      it('should not set position when not in map', () => {
        const positionsMap: PositionsMap = {
          'other-state': { x: 100, y: 200 },
        };
        const transition = createMockTransition();
        const result = getStartStateNode(transition as any, positionsMap, false);

        expect(result.position).toBeUndefined();
        expect(result.locked).toBeUndefined();
      });

      it('should not set locked when position is undefined', () => {
        const positionsMap: PositionsMap = {};
        const transition = createMockTransition();
        const result = getStartStateNode(transition as any, positionsMap, false);

        expect(result.locked).toBeUndefined();
      });
    });

    describe('edge cases', () => {
      it('should handle persisted false', () => {
        const transition = createMockTransition({ persisted: false });
        const result = getStartStateNode(transition as any, null, false);

        expect(result.data.persisted).toBe(false);
      });

      it('should handle empty state name', () => {
        const transition = createMockTransition({ startStateName: '' });
        const result = getStartStateNode(transition as any, null, false);

        expect(result.data.title).toBe('');
      });
    });
  });

  describe('getEndStateNode', () => {
    const createMockTransition = (overrides: Partial<MockTransition> = {}): MockTransition => ({
      id: 'trans-1',
      name: 'Test Transition',
      startStateId: 'state-1',
      startStateName: 'Start State',
      endStateId: 'state-2',
      endStateName: 'End State',
      automated: false,
      persisted: true,
      workflowId: 'workflow-1',
      ...overrides,
    });

    describe('basic functionality', () => {
      it('should create end state node with correct data', () => {
        const transition = createMockTransition();
        const result = getEndStateNode(transition as any, null, false);

        expect(result.data.id).toBe('state-2');
        expect(result.data.entityId).toBe('state-2');
        expect(result.data.title).toBe('End State');
        expect(result.data.persisted).toBe(true);
        expect(result.data.type).toBe('state');
      });

      it('should set node-state class by default', () => {
        const transition = createMockTransition();
        const result = getEndStateNode(transition as any, null, false);

        expect(result.classes).toBe('node-state');
      });

      it('should add current-state class when isCurrentState is true', () => {
        const transition = createMockTransition();
        const result = getEndStateNode(transition as any, null, true);

        expect(result.classes).toBe('node-state current-state');
      });
    });

    describe('with positionsMap', () => {
      it('should set position from map when available', () => {
        const positionsMap: PositionsMap = {
          'state-2': { x: 300, y: 400 },
        };
        const transition = createMockTransition();
        const result = getEndStateNode(transition as any, positionsMap, false);

        expect(result.position).toEqual({ x: 300, y: 400 });
        expect(result.locked).toBe(true);
      });

      it('should not set position when not in map', () => {
        const positionsMap: PositionsMap = {
          'other-state': { x: 100, y: 200 },
        };
        const transition = createMockTransition();
        const result = getEndStateNode(transition as any, positionsMap, false);

        expect(result.position).toBeUndefined();
        expect(result.locked).toBeUndefined();
      });
    });
  });

  describe('getStatesTransitionsEles', () => {
    const createMockTransition = (overrides: Partial<MockTransition> = {}): MockTransition => ({
      id: 'trans-1',
      name: 'Test Transition',
      startStateId: 'state-1',
      startStateName: 'Start State',
      endStateId: 'state-2',
      endStateName: 'End State',
      automated: false,
      persisted: true,
      workflowId: 'workflow-1',
      ...overrides,
    });

    describe('single transition', () => {
      it('should create start state, end state, and edge', () => {
        const transitions = [createMockTransition()];
        const result = getStatesTransitionsEles(transitions as any, null, null);

        expect(result).toHaveLength(3);

        // Check start state
        const startState = result.find(el => el.data.id === 'state-1');
        expect(startState).toBeDefined();
        expect(startState?.data.type).toBe('state');
        expect(startState?.data.title).toBe('Start State');

        // Check end state
        const endState = result.find(el => el.data.id === 'state-2');
        expect(endState).toBeDefined();
        expect(endState?.data.type).toBe('state');
        expect(endState?.data.title).toBe('End State');

        // Check edge
        const edge = result.find(el => el.data.id === 'trans-1');
        expect(edge).toBeDefined();
        expect(edge?.data.type).toBe('edge');
        expect(edge?.data.source).toBe('state-1');
        expect(edge?.data.target).toBe('state-2');
      });

      it('should create manual transition edge with correct title', () => {
        const transitions = [createMockTransition({ automated: false })];
        const result = getStatesTransitionsEles(transitions as any, null, null);

        const edge = result.find(el => el.data.id === 'trans-1');
        expect(edge?.data.title).toBe('[M] Test Transition');
        expect(edge?.classes).toContain('edge-manual');
      });

      it('should create automated transition edge with correct title', () => {
        const transitions = [createMockTransition({ automated: true })];
        const result = getStatesTransitionsEles(transitions as any, null, null);

        const edge = result.find(el => el.data.id === 'trans-1');
        expect(edge?.data.title).toBe('[A] Test Transition');
        expect(edge?.classes).not.toContain('edge-manual');
      });
    });

    describe('multiple transitions', () => {
      it('should not duplicate states when transitions share states', () => {
        const transitions = [
          createMockTransition({ id: 'trans-1', startStateId: 'state-1', endStateId: 'state-2' }),
          createMockTransition({ id: 'trans-2', startStateId: 'state-2', endStateId: 'state-3', endStateName: 'State 3' }),
        ];
        const result = getStatesTransitionsEles(transitions as any, null, null);

        // Should have 3 states (state-1, state-2, state-3) and 2 edges
        expect(result).toHaveLength(5);

        const states = result.filter(el => el.data.type === 'state');
        const edges = result.filter(el => el.data.type === 'edge');

        expect(states).toHaveLength(3);
        expect(edges).toHaveLength(2);

        // state-2 should only appear once
        const state2Nodes = result.filter(el => el.data.id === 'state-2');
        expect(state2Nodes).toHaveLength(1);
      });

      it('should create all transitions as edges', () => {
        const transitions = [
          createMockTransition({ id: 'trans-1' }),
          createMockTransition({ id: 'trans-2', startStateId: 'state-2', endStateId: 'state-3', endStateName: 'State 3' }),
          createMockTransition({ id: 'trans-3', startStateId: 'state-3', endStateId: 'state-1', startStateName: 'State 3' }),
        ];
        const result = getStatesTransitionsEles(transitions as any, null, null);

        const edges = result.filter(el => el.data.type === 'edge');
        expect(edges).toHaveLength(3);
        expect(edges.map(e => e.data.id)).toEqual(['trans-1', 'trans-2', 'trans-3']);
      });
    });

    describe('with currentState', () => {
      it('should mark start state as current when matching', () => {
        const transitions = [createMockTransition()];
        const result = getStatesTransitionsEles(transitions as any, null, 'Start State');

        const startState = result.find(el => el.data.id === 'state-1');
        expect(startState?.classes).toContain('current-state');
      });

      it('should mark end state as current when matching', () => {
        const transitions = [createMockTransition()];
        const result = getStatesTransitionsEles(transitions as any, null, 'End State');

        const endState = result.find(el => el.data.id === 'state-2');
        expect(endState?.classes).toContain('current-state');
      });

      it('should not mark states as current when not matching', () => {
        const transitions = [createMockTransition()];
        const result = getStatesTransitionsEles(transitions as any, null, 'Other State');

        const states = result.filter(el => el.data.type === 'state');
        states.forEach(state => {
          expect(state.classes).not.toContain('current-state');
        });
      });
    });

    describe('with positionsMap', () => {
      it('should apply positions to states from map', () => {
        const positionsMap: PositionsMap = {
          'state-1': { x: 100, y: 200 },
          'state-2': { x: 300, y: 400 },
        };
        const transitions = [createMockTransition()];
        const result = getStatesTransitionsEles(transitions as any, positionsMap, null);

        const startState = result.find(el => el.data.id === 'state-1');
        const endState = result.find(el => el.data.id === 'state-2');

        expect(startState?.position).toEqual({ x: 100, y: 200 });
        expect(startState?.locked).toBe(true);
        expect(endState?.position).toEqual({ x: 300, y: 400 });
        expect(endState?.locked).toBe(true);
      });

      it('should not apply positions when not in map', () => {
        const positionsMap: PositionsMap = {
          'other-state': { x: 100, y: 200 },
        };
        const transitions = [createMockTransition()];
        const result = getStatesTransitionsEles(transitions as any, positionsMap, null);

        const startState = result.find(el => el.data.id === 'state-1');
        const endState = result.find(el => el.data.id === 'state-2');

        expect(startState?.position).toBeUndefined();
        expect(endState?.position).toBeUndefined();
      });
    });

    describe('edge cases', () => {
      it('should handle empty transitions array', () => {
        const result = getStatesTransitionsEles([], null, null);
        expect(result).toEqual([]);
      });

      it('should handle self-loop transition', () => {
        const transitions = [
          createMockTransition({
            startStateId: 'state-1',
            endStateId: 'state-1',
            startStateName: 'Same State',
            endStateName: 'Same State',
          }),
        ];
        const result = getStatesTransitionsEles(transitions as any, null, null);

        // The function creates both start and end state nodes, then edge
        // Even for self-loop, it creates 2 state nodes (start and end) + 1 edge = 3 elements
        expect(result).toHaveLength(3);

        const states = result.filter(el => el.data.type === 'state');
        const edges = result.filter(el => el.data.type === 'edge');

        // Both state nodes have the same id
        expect(states).toHaveLength(2);
        expect(states[0].data.id).toBe('state-1');
        expect(states[1].data.id).toBe('state-1');
        expect(edges).toHaveLength(1);
      });

      it('should handle noneState correctly', () => {
        const transitions = [
          createMockTransition({
            startStateId: 'noneState',
            startStateName: 'None',
          }),
        ];
        const result = getStatesTransitionsEles(transitions as any, null, null);

        const noneState = result.find(el => el.data.id === 'noneState');
        expect(noneState?.classes).toBe('node-state node-state-none');
      });
    });

    describe('real-world scenarios', () => {
      it('should handle complex workflow with multiple transitions', () => {
        const transitions = [
          createMockTransition({
            id: 'trans-1',
            startStateId: 'noneState',
            startStateName: 'None',
            endStateId: 'draft',
            endStateName: 'Draft',
            automated: true,
          }),
          createMockTransition({
            id: 'trans-2',
            startStateId: 'draft',
            startStateName: 'Draft',
            endStateId: 'pending',
            endStateName: 'Pending Approval',
            automated: false,
          }),
          createMockTransition({
            id: 'trans-3',
            startStateId: 'pending',
            startStateName: 'Pending Approval',
            endStateId: 'approved',
            endStateName: 'Approved',
            automated: false,
          }),
          createMockTransition({
            id: 'trans-4',
            startStateId: 'pending',
            startStateName: 'Pending Approval',
            endStateId: 'rejected',
            endStateName: 'Rejected',
            automated: false,
          }),
        ];
        const result = getStatesTransitionsEles(transitions as any, null, 'Draft');

        // Should have 5 states (noneState, draft, pending, approved, rejected) and 4 edges
        expect(result).toHaveLength(9);

        const states = result.filter(el => el.data.type === 'state');
        const edges = result.filter(el => el.data.type === 'edge');

        expect(states).toHaveLength(5);
        expect(edges).toHaveLength(4);

        // Draft should be marked as current
        const draftState = result.find(el => el.data.id === 'draft');
        expect(draftState?.classes).toContain('current-state');

        // Check automated vs manual transitions
        const automatedEdges = edges.filter(e => !e.classes?.includes('edge-manual'));
        const manualEdges = edges.filter(e => e.classes?.includes('edge-manual'));

        expect(automatedEdges).toHaveLength(1);
        expect(manualEdges).toHaveLength(3);
      });
    });
  });

  describe('getCriteriaChildrenEles', () => {
    const createMockTransition = (overrides: Partial<MockTransition> = {}): MockTransition => ({
      id: 'trans-1',
      name: 'Test Transition',
      startStateId: 'state-1',
      startStateName: 'Start State',
      endStateId: 'state-2',
      endStateName: 'End State',
      automated: false,
      persisted: true,
      workflowId: 'workflow-1',
      criteriaIds: [],
      ...overrides,
    });

    const createMockCriteria = (id: string, name: string, persisted: boolean = true): Criteria => ({
      id,
      name,
      persisted,
    } as any);

    describe('basic functionality', () => {
      it('should create criteria child nodes', () => {
        const transition = createMockTransition({ criteriaIds: ['criteria-1', 'criteria-2'] });
        const criteriaList = [
          createMockCriteria('criteria-1', 'Criteria One'),
          createMockCriteria('criteria-2', 'Criteria Two'),
        ];
        const position = { x: 200, y: 300 };

        const result = getCriteriaChildrenEles({
          transition: transition as any,
          criteriaCompoundEleId: 'trans-1-criteria',
          criteriaList,
          position,
        });

        expect(result).toHaveLength(2);

        expect(result[0].data.id).toBe('trans-1-criteria-1');
        expect(result[0].data.entityId).toBe('criteria-1');
        expect(result[0].data.title).toBe('Criteria One');
        expect(result[0].data.fullTitle).toBe('Criteria One');
        expect(result[0].data.type).toBe('criteria');
        expect(result[0].data.parent).toBe('trans-1-criteria');
        expect(result[0].classes).toBe('node-criteria');
        expect(result[0].grabbable).toBe(false);

        expect(result[1].data.id).toBe('trans-1-criteria-2');
        expect(result[1].data.entityId).toBe('criteria-2');
      });

      it('should apply ellipsis to long criteria names', () => {
        const longName = 'This is a very long criteria name that should be truncated';
        const transition = createMockTransition({ criteriaIds: ['criteria-1'] });
        const criteriaList = [createMockCriteria('criteria-1', longName)];
        const position = { x: 200, y: 300 };

        const result = getCriteriaChildrenEles({
          transition: transition as any,
          criteriaCompoundEleId: 'trans-1-criteria',
          criteriaList,
          position,
        });

        expect(result[0].data.title).toBe('This is a very long criteria name that...');
        expect(result[0].data.fullTitle).toBe(longName);
      });

      it('should use criteria id as title when name is missing', () => {
        const transition = createMockTransition({ criteriaIds: ['criteria-1'] });
        const criteriaList = [{ id: 'criteria-1', name: '', persisted: true } as any];
        const position = { x: 200, y: 300 };

        const result = getCriteriaChildrenEles({
          transition: transition as any,
          criteriaCompoundEleId: 'trans-1-criteria',
          criteriaList,
          position,
        });

        expect(result[0].data.title).toBe('criteria-1');
      });
    });

    describe('positioning', () => {
      it('should position children using getChildPosition', () => {
        const transition = createMockTransition({ criteriaIds: ['c1', 'c2', 'c3'] });
        const criteriaList = [
          createMockCriteria('c1', 'C1'),
          createMockCriteria('c2', 'C2'),
          createMockCriteria('c3', 'C3'),
        ];
        const position = { x: 200, y: 300 };

        const result = getCriteriaChildrenEles({
          transition: transition as any,
          criteriaCompoundEleId: 'trans-1-criteria',
          criteriaList,
          position,
        });

        // Should have positions calculated by getChildPosition
        expect(result[0].position).toBeDefined();
        expect(result[1].position).toBeDefined();
        expect(result[2].position).toBeDefined();

        // Third child should be centered (odd count, last index)
        expect(result[2].position?.x).toBe(200);
      });
    });

    describe('edge cases', () => {
      it('should handle empty criteriaIds', () => {
        const transition = createMockTransition({ criteriaIds: [] });
        const criteriaList = [createMockCriteria('criteria-1', 'Criteria One')];
        const position = { x: 200, y: 300 };

        const result = getCriteriaChildrenEles({
          transition: transition as any,
          criteriaCompoundEleId: 'trans-1-criteria',
          criteriaList,
          position,
        });

        expect(result).toEqual([]);
      });

      it('should skip criteria not found in list', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const transition = createMockTransition({ criteriaIds: ['criteria-1', 'criteria-missing', 'criteria-2'] });
        const criteriaList = [
          createMockCriteria('criteria-1', 'Criteria One'),
          createMockCriteria('criteria-2', 'Criteria Two'),
        ];
        const position = { x: 200, y: 300 };

        const result = getCriteriaChildrenEles({
          transition: transition as any,
          criteriaCompoundEleId: 'trans-1-criteria',
          criteriaList,
          position,
        });

        expect(result).toHaveLength(2);
        expect(result[0].data.entityId).toBe('criteria-1');
        expect(result[1].data.entityId).toBe('criteria-2');
        expect(consoleWarnSpy).toHaveBeenCalledWith("Couldn't find criteria", "criteria-missing");

        consoleWarnSpy.mockRestore();
      });

      it('should handle persisted false', () => {
        const transition = createMockTransition({ criteriaIds: ['criteria-1'] });
        const criteriaList = [createMockCriteria('criteria-1', 'Criteria One', false)];
        const position = { x: 200, y: 300 };

        const result = getCriteriaChildrenEles({
          transition: transition as any,
          criteriaCompoundEleId: 'trans-1-criteria',
          criteriaList,
          position,
        });

        expect(result[0].data.persisted).toBe(false);
      });
    });
  });

  describe('getCriteriaEles', () => {
    const createMockTransition = (overrides: Partial<MockTransition> = {}): MockTransition => ({
      id: 'trans-1',
      name: 'Test Transition',
      startStateId: 'state-1',
      startStateName: 'Start State',
      endStateId: 'state-2',
      endStateName: 'End State',
      automated: false,
      persisted: true,
      workflowId: 'workflow-1',
      criteriaIds: [],
      ...overrides,
    });

    const createMockCriteria = (id: string, name: string): Criteria => ({
      id,
      name,
      persisted: true,
    } as any);

    describe('basic functionality', () => {
      it('should create criteria compound element and children', () => {
        const transition = createMockTransition({ criteriaIds: ['criteria-1'] });
        const criteriaList = [createMockCriteria('criteria-1', 'Criteria One')];
        const position = { x: 200, y: 300 };

        const result = getCriteriaEles({
          transition: transition as any,
          criteriaList,
          position,
        });

        expect(result.parent).toBeDefined();
        expect(result.parent.data.id).toBe('trans-1-criteria');
        expect(result.parent.data.title).toBe('Criteria');
        expect(result.parent.data.transitionId).toBe('trans-1');
        expect(result.parent.classes).toBe('compound-criteria');
        expect(result.parent.grabbable).toBe(false);
        expect(result.parent.selectable).toBe(false);

        expect(result.criteriaCompoundEleId).toBe('trans-1-criteria');
        expect(result.position).toEqual(position);
        expect(result.children).toHaveLength(1);
      });

      it('should pass position to children', () => {
        const transition = createMockTransition({ criteriaIds: ['c1', 'c2'] });
        const criteriaList = [
          createMockCriteria('c1', 'C1'),
          createMockCriteria('c2', 'C2'),
        ];
        const position = { x: 150, y: 250 };

        const result = getCriteriaEles({
          transition: transition as any,
          criteriaList,
          position,
        });

        expect(result.children).toHaveLength(2);
        expect(result.position).toEqual(position);
      });
    });

    describe('edge cases', () => {
      it('should handle empty criteriaIds', () => {
        const transition = createMockTransition({ criteriaIds: [] });
        const criteriaList = [createMockCriteria('criteria-1', 'Criteria One')];
        const position = { x: 200, y: 300 };

        const result = getCriteriaEles({
          transition: transition as any,
          criteriaList,
          position,
        });

        expect(result.children).toEqual([]);
      });
    });
  });

  describe('getProcessesChildEles', () => {
    const createMockTransition = (overrides: Partial<MockTransition> = {}): MockTransition => ({
      id: 'trans-1',
      name: 'Test Transition',
      startStateId: 'state-1',
      startStateName: 'Start State',
      endStateId: 'state-2',
      endStateName: 'End State',
      automated: false,
      persisted: true,
      workflowId: 'workflow-1',
      endProcessesIds: [],
      ...overrides,
    });

    const createMockProcess = (id: string, name: string, persisted: boolean = true): Process => ({
      id: persisted ? { persisted: true, persistedId: id } : { persisted: false, runtimeId: id },
      name,
      persisted,
    } as any);

    describe('basic functionality', () => {
      it('should create process child nodes', () => {
        const processId1 = { persisted: true, persistedId: 'process-1' };
        const processId2 = { persisted: true, persistedId: 'process-2' };
        const transition = createMockTransition({ endProcessesIds: [processId1, processId2] });
        const processesList = [
          createMockProcess('process-1', 'Process One'),
          createMockProcess('process-2', 'Process Two'),
        ];
        const position = { x: 200, y: 300 };

        const result = getProcessesChildEles({
          transition: transition as any,
          processesList,
          parent: 'trans-1-processes',
          compoundPosition: position,
          maxY: 400,
        });

        expect(result).toHaveLength(2);

        expect(result[0].group).toBe('nodes');
        expect(result[0].data.parent).toBe('trans-1-processes');
        expect(result[0].data.type).toBe('process');
        expect(result[0].classes).toBe('node-process');
        expect(result[0].position).toBeDefined();
      });

      it('should apply ellipsis to long process names', () => {
        const longName = 'This is a very long process name that should be truncated';
        const processId = { persisted: true, persistedId: 'process-1' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', longName)];
        const position = { x: 200, y: 300 };

        const result = getProcessesChildEles({
          transition: transition as any,
          processesList,
          parent: 'trans-1-processes',
          compoundPosition: position,
          maxY: 400,
        });

        expect(result[0].data.title).toBe('This is a very long process name that...');
      });

      it('should handle process with persisted property', () => {
        const processId = { persisted: true, persistedId: 'process-1' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', 'Process One', true)];
        const position = { x: 200, y: 300 };

        const result = getProcessesChildEles({
          transition: transition as any,
          processesList,
          parent: 'trans-1-processes',
          compoundPosition: position,
          maxY: 400,
        });

        expect(result[0].data.persisted).toBe(true);
        expect(result[0].data.title).toBe('Process One');
      });

      it('should create unique ids combining process id object and transition id', () => {
        const processId = { persisted: true, persistedId: 'process-1' };
        const transition = createMockTransition({ id: 'trans-123', endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', 'Process One')];
        const position = { x: 200, y: 300 };

        const result = getProcessesChildEles({
          transition: transition as any,
          processesList,
          parent: 'trans-123-processes',
          compoundPosition: position,
          maxY: 400,
        });

        // The id is process.id (object) + '-' + transition.id
        expect(result[0].data.id).toContain('trans-123');
        expect(result[0].data.entityId).toEqual({ persisted: true, persistedId: 'process-1' });
      });
    });

    describe('positioning', () => {
      it('should position children using getChildPosition with maxY', () => {
        const processId1 = { persisted: true, persistedId: 'p1' };
        const processId2 = { persisted: true, persistedId: 'p2' };
        const processId3 = { persisted: true, persistedId: 'p3' };
        const transition = createMockTransition({ endProcessesIds: [processId1, processId2, processId3] });
        const processesList = [
          createMockProcess('p1', 'P1'),
          createMockProcess('p2', 'P2'),
          createMockProcess('p3', 'P3'),
        ];
        const position = { x: 200, y: 300 };
        const maxY = 400;

        const result = getProcessesChildEles({
          transition: transition as any,
          processesList,
          parent: 'trans-1-processes',
          compoundPosition: position,
          maxY,
        });

        // Should have positions calculated by getChildPosition
        expect(result[0].position).toBeDefined();
        expect(result[1].position).toBeDefined();
        expect(result[2].position).toBeDefined();

        // All positions should respect maxY
        result.forEach(node => {
          expect(node.position!.y).toBeLessThanOrEqual(maxY);
        });
      });
    });

    describe('runtime vs persisted processes', () => {
      it('should handle persisted processes', () => {
        const processId = { persisted: true, persistedId: 'process-1' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', 'Process One', true)];
        const position = { x: 200, y: 300 };

        const result = getProcessesChildEles({
          transition: transition as any,
          processesList,
          parent: 'trans-1-processes',
          compoundPosition: position,
          maxY: 400,
        });

        expect(result).toHaveLength(1);
        expect(result[0].data.persisted).toBe(true);
      });

      it('should handle runtime processes', () => {
        const processId = { persisted: false, runtimeId: 'process-1' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', 'Process One', false)];
        const position = { x: 200, y: 300 };

        const result = getProcessesChildEles({
          transition: transition as any,
          processesList,
          parent: 'trans-1-processes',
          compoundPosition: position,
          maxY: 400,
        });

        expect(result).toHaveLength(1);
        expect(result[0].data.persisted).toBe(false);
      });

      it('should match processes by persistedId when persisted', () => {
        const processId = { persisted: true, persistedId: 'process-123' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-123', 'Process One', true)];
        const position = { x: 200, y: 300 };

        const result = getProcessesChildEles({
          transition: transition as any,
          processesList,
          parent: 'trans-1-processes',
          compoundPosition: position,
          maxY: 400,
        });

        expect(result).toHaveLength(1);
        expect(result[0].data.title).toBe('Process One');
      });

      it('should match processes by runtimeId when not persisted', () => {
        const processId = { persisted: false, runtimeId: 'process-456' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-456', 'Process Two', false)];
        const position = { x: 200, y: 300 };

        const result = getProcessesChildEles({
          transition: transition as any,
          processesList,
          parent: 'trans-1-processes',
          compoundPosition: position,
          maxY: 400,
        });

        expect(result).toHaveLength(1);
        expect(result[0].data.title).toBe('Process Two');
      });
    });

    describe('edge cases', () => {
      it('should handle empty endProcessesIds', () => {
        const transition = createMockTransition({ endProcessesIds: [] });
        const processesList = [createMockProcess('process-1', 'Process One')];
        const position = { x: 200, y: 300 };

        const result = getProcessesChildEles({
          transition: transition as any,
          processesList,
          parent: 'trans-1-processes',
          compoundPosition: position,
          maxY: 400,
        });

        expect(result).toEqual([]);
      });

      it('should skip processes not found in list', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const processId1 = { persisted: true, persistedId: 'process-1' };
        const processId2 = { persisted: true, persistedId: 'process-missing' };
        const processId3 = { persisted: true, persistedId: 'process-2' };
        const transition = createMockTransition({ endProcessesIds: [processId1, processId2, processId3] });
        const processesList = [
          createMockProcess('process-1', 'Process One'),
          createMockProcess('process-2', 'Process Two'),
        ];
        const position = { x: 200, y: 300 };

        const result = getProcessesChildEles({
          transition: transition as any,
          processesList,
          parent: 'trans-1-processes',
          compoundPosition: position,
          maxY: 400,
        });

        expect(result).toHaveLength(2);
        expect(consoleWarnSpy).toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
      });
    });
  });

  describe('getProcessesEles', () => {
    const createMockTransition = (overrides: Partial<MockTransition> = {}): MockTransition => ({
      id: 'trans-1',
      name: 'Test Transition',
      startStateId: 'state-1',
      startStateName: 'Start State',
      endStateId: 'state-2',
      endStateName: 'End State',
      automated: false,
      persisted: true,
      workflowId: 'workflow-1',
      endProcessesIds: [],
      ...overrides,
    });

    const createMockProcess = (id: string, name: string, persisted: boolean = true): Process => ({
      id: persisted ? { persisted: true, persistedId: id } : { persisted: false, runtimeId: id },
      name,
      persisted,
    } as any);

    const createMockEndStateEle = (position: Position = { x: 300, y: 400 }) => ({
      position: () => position,
    });

    const createMockTransitionEdge = (targetPosition: Position = { x: 250, y: 350 }) => ({
      targetEndpoint: () => targetPosition,
    });

    describe('basic functionality', () => {
      it('should create complete process element structure', () => {
        const processId = { persisted: true, persistedId: 'process-1' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', 'Process One')];
        const endStateEle = createMockEndStateEle();
        const transitionEdge = createMockTransitionEdge();
        const positionsMap: PositionsMap = {};

        const result = getProcessesEles({
          transition: transition as any,
          endStateEle,
          positionsMap,
          processesList,
          transitionEdge,
        });

        expect(result.parent).toBeDefined();
        expect(result.edge).toBeDefined();
        expect(result.children).toBeDefined();
        expect(result.position).toBeDefined();
        expect(result.source).toBeDefined();
      });

      it('should create source element with correct properties', () => {
        const processId = { persisted: true, persistedId: 'process-1' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', 'Process One')];
        const endStateEle = createMockEndStateEle();
        const targetPosition = { x: 250, y: 350 };
        const transitionEdge = createMockTransitionEdge(targetPosition);
        const positionsMap: PositionsMap = {};

        const result = getProcessesEles({
          transition: transition as any,
          endStateEle,
          positionsMap,
          processesList,
          transitionEdge,
        });

        expect(result.source.data.id).toBe('trans-1-processes-source');
        expect(result.source.data.title).toBe('');
        expect(result.source.data.type).toBe('processes-source');
        expect(result.source.classes).toBe('compound-processes-source');
        expect(result.source.position).toEqual(targetPosition);
        expect(result.source.grabbable).toBe(false);
      });

      it('should create parent compound element with correct properties', () => {
        const processId = { persisted: true, persistedId: 'process-1' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', 'Process One')];
        const endStateEle = createMockEndStateEle();
        const transitionEdge = createMockTransitionEdge();
        const positionsMap: PositionsMap = {};

        const result = getProcessesEles({
          transition: transition as any,
          endStateEle,
          positionsMap,
          processesList,
          transitionEdge,
        });

        expect(result.parent.data.id).toBe('trans-1-processes');
        expect(result.parent.data.title).toBe('Processes');
        expect(result.parent.data.type).toBe('processes-compound');
        expect(result.parent.classes).toBe('compound-processes');
      });

      it('should create edge connecting source to parent', () => {
        const processId = { persisted: true, persistedId: 'process-1' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', 'Process One')];
        const endStateEle = createMockEndStateEle();
        const transitionEdge = createMockTransitionEdge();
        const positionsMap: PositionsMap = {};

        const result = getProcessesEles({
          transition: transition as any,
          endStateEle,
          positionsMap,
          processesList,
          transitionEdge,
        });

        expect(result.edge.data.id).toBe('trans-1-processes-edge');
        expect(result.edge.data.source).toBe('trans-1-processes-source');
        expect(result.edge.data.target).toBe('trans-1-processes');
        expect(result.edge.data.type).toBe('processes-edge');
        expect(result.edge.classes).toBe('edge edge-process');
      });

      it('should create children process nodes', () => {
        const processId1 = { persisted: true, persistedId: 'process-1' };
        const processId2 = { persisted: true, persistedId: 'process-2' };
        const transition = createMockTransition({ endProcessesIds: [processId1, processId2] });
        const processesList = [
          createMockProcess('process-1', 'Process One'),
          createMockProcess('process-2', 'Process Two'),
        ];
        const endStateEle = createMockEndStateEle();
        const transitionEdge = createMockTransitionEdge();
        const positionsMap: PositionsMap = {};

        const result = getProcessesEles({
          transition: transition as any,
          endStateEle,
          positionsMap,
          processesList,
          transitionEdge,
        });

        expect(result.children).toHaveLength(2);
        expect(result.children[0].data.type).toBe('process');
        expect(result.children[1].data.type).toBe('process');
      });
    });

    describe('positioning', () => {
      it('should calculate position from getProcessCompoundPosition', () => {
        const processId = { persisted: true, persistedId: 'process-1' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', 'Process One')];
        const endStateEle = createMockEndStateEle({ x: 300, y: 400 });
        const targetPosition = { x: 250, y: 350 };
        const transitionEdge = createMockTransitionEdge(targetPosition);
        const positionsMap: PositionsMap = {};

        const result = getProcessesEles({
          transition: transition as any,
          endStateEle,
          positionsMap,
          processesList,
          transitionEdge,
        });

        // Position should be calculated as targetPosition.y - 100
        expect(result.position).toEqual({ x: 250, y: 250 });
        expect(result.parent.position).toEqual({ x: 250, y: 250 });
      });

      it('should use position from positionsMap when available', () => {
        const processId = { persisted: true, persistedId: 'process-1' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', 'Process One')];
        const endStateEle = createMockEndStateEle();
        const transitionEdge = createMockTransitionEdge({ x: 250, y: 350 });
        const positionsMap: PositionsMap = {
          'trans-1-processes': { x: 100, y: 150 },
        };

        const result = getProcessesEles({
          transition: transition as any,
          endStateEle,
          positionsMap,
          processesList,
          transitionEdge,
        });

        expect(result.position).toEqual({ x: 100, y: 150 });
        expect(result.parent.position).toEqual({ x: 100, y: 150 });
      });

      it('should lock parent when position is in map', () => {
        const processId = { persisted: true, persistedId: 'process-1' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', 'Process One')];
        const endStateEle = createMockEndStateEle();
        const transitionEdge = createMockTransitionEdge();
        const positionsMap: PositionsMap = {
          'trans-1-processes': { x: 100, y: 150 },
        };

        const result = getProcessesEles({
          transition: transition as any,
          endStateEle,
          positionsMap,
          processesList,
          transitionEdge,
        });

        expect(result.parent.locked).toBe(true);
      });

      it('should not lock parent when position is not in map', () => {
        const processId = { persisted: true, persistedId: 'process-1' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', 'Process One')];
        const endStateEle = createMockEndStateEle();
        const transitionEdge = createMockTransitionEdge();
        const positionsMap: PositionsMap = {};

        const result = getProcessesEles({
          transition: transition as any,
          endStateEle,
          positionsMap,
          processesList,
          transitionEdge,
        });

        expect(result.parent.locked).toBeUndefined();
      });

      it('should pass maxY to children based on endStateEle position', () => {
        const processId = { persisted: true, persistedId: 'process-1' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', 'Process One')];
        const endStatePosition = { x: 300, y: 500 };
        const endStateEle = createMockEndStateEle(endStatePosition);
        const transitionEdge = createMockTransitionEdge();
        const positionsMap: PositionsMap = {};

        const result = getProcessesEles({
          transition: transition as any,
          endStateEle,
          positionsMap,
          processesList,
          transitionEdge,
        });

        // maxY should be endStatePosition.y - 100 = 400
        // Children positions should respect this
        result.children.forEach(child => {
          expect(child.position!.y).toBeLessThanOrEqual(400);
        });
      });
    });

    describe('edge cases', () => {
      it('should return empty object when endProcessesIds is empty', () => {
        const transition = createMockTransition({ endProcessesIds: [] });
        const processesList = [createMockProcess('process-1', 'Process One')];
        const endStateEle = createMockEndStateEle();
        const transitionEdge = createMockTransitionEdge();
        const positionsMap: PositionsMap = {};

        const result = getProcessesEles({
          transition: transition as any,
          endStateEle,
          positionsMap,
          processesList,
          transitionEdge,
        });

        expect(result).toEqual({});
      });

      it('should return empty object when no children are created', () => {
        const processId = { persisted: true, persistedId: 'process-missing' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('process-1', 'Process One')];
        const endStateEle = createMockEndStateEle();
        const transitionEdge = createMockTransitionEdge();
        const positionsMap: PositionsMap = {};

        const result = getProcessesEles({
          transition: transition as any,
          endStateEle,
          positionsMap,
          processesList,
          transitionEdge,
        });

        expect(result).toEqual({});
      });
    });

    describe('real-world scenarios', () => {
      it('should handle multiple processes with complex positioning', () => {
        const processId1 = { persisted: true, persistedId: 'p1' };
        const processId2 = { persisted: true, persistedId: 'p2' };
        const processId3 = { persisted: true, persistedId: 'p3' };
        const transition = createMockTransition({
          id: 'trans-approval',
          endProcessesIds: [processId1, processId2, processId3]
        });
        const processesList = [
          createMockProcess('p1', 'Send Email Notification'),
          createMockProcess('p2', 'Update Database'),
          createMockProcess('p3', 'Log Activity'),
        ];
        const endStateEle = createMockEndStateEle({ x: 400, y: 600 });
        const transitionEdge = createMockTransitionEdge({ x: 350, y: 550 });
        const positionsMap: PositionsMap = {};

        const result = getProcessesEles({
          transition: transition as any,
          endStateEle,
          positionsMap,
          processesList,
          transitionEdge,
        });

        expect(result.parent.data.id).toBe('trans-approval-processes');
        expect(result.children).toHaveLength(3);
        expect(result.children[0].data.title).toBe('Send Email Notification');
        expect(result.children[1].data.title).toBe('Update Database');
        expect(result.children[2].data.title).toBe('Log Activity');

        // Third child should be centered (odd count)
        expect(result.children[2].position?.x).toBe(result.position.x);
      });

      it('should handle runtime processes', () => {
        const processId = { persisted: false, runtimeId: 'runtime-process-1' };
        const transition = createMockTransition({ endProcessesIds: [processId] });
        const processesList = [createMockProcess('runtime-process-1', 'Runtime Process', false)];
        const endStateEle = createMockEndStateEle();
        const transitionEdge = createMockTransitionEdge();
        const positionsMap: PositionsMap = {};

        const result = getProcessesEles({
          transition: transition as any,
          endStateEle,
          positionsMap,
          processesList,
          transitionEdge,
        });

        expect(result.children).toHaveLength(1);
        expect(result.children[0].data.persisted).toBe(false);
        expect(result.children[0].data.title).toBe('Runtime Process');
      });
    });
  });
});

