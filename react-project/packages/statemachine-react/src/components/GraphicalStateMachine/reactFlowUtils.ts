/**
 * React Flow Utilities
 * Convert transitions/processes/criteria data to React Flow nodes and edges
 */

import { Node, Edge } from '@xyflow/react';
import type { Transition, PositionsMap } from '../../types';
import { StateNodeData } from './nodes/StateNode';
import { TransitionEdgeData } from './edges/TransitionEdge';

export const NONE_STATE_ID = 'noneState';

/**
 * Calculate hierarchical layout positions for nodes
 * This creates a left-to-right flow with proper spacing
 */
const calculateHierarchicalLayout = (
  nodes: Node<StateNodeData>[],
  edges: Edge<TransitionEdgeData>[]
): Map<string, { x: number; y: number }> => {
  const positions = new Map<string, { x: number; y: number }>();
  const nodesByLevel = new Map<number, string[]>();
  const nodeLevels = new Map<string, number>();

  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  nodes.forEach(node => adjacency.set(node.id, []));
  edges.forEach(edge => {
    const targets = adjacency.get(edge.source) || [];
    targets.push(edge.target);
    adjacency.set(edge.source, targets);
  });

  // Find root nodes (nodes with no incoming edges)
  const incomingCount = new Map<string, number>();
  nodes.forEach(node => incomingCount.set(node.id, 0));
  edges.forEach(edge => {
    incomingCount.set(edge.target, (incomingCount.get(edge.target) || 0) + 1);
  });

  const roots = nodes.filter(node => (incomingCount.get(node.id) || 0) === 0);

  // BFS to assign levels
  const queue: Array<{ id: string; level: number }> = roots.map(node => ({ id: node.id, level: 0 }));
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;

    if (visited.has(id)) continue;
    visited.add(id);

    nodeLevels.set(id, level);

    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(id);

    const children = adjacency.get(id) || [];
    children.forEach(childId => {
      queue.push({ id: childId, level: level + 1 });
    });
  }

  // Handle unvisited nodes (disconnected components)
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const level = 0;
      nodeLevels.set(node.id, level);
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(node.id);
    }
  });

  // Calculate positions with generous spacing
  const horizontalSpacing = 400; // Space between levels (left to right)
  const verticalSpacing = 250;   // Space between nodes in same level

  nodesByLevel.forEach((nodeIds, level) => {
    const levelHeight = (nodeIds.length - 1) * verticalSpacing;
    const startY = -levelHeight / 2; // Center vertically

    nodeIds.forEach((nodeId, index) => {
      positions.set(nodeId, {
        x: level * horizontalSpacing,
        y: startY + index * verticalSpacing,
      });
    });
  });

  return positions;
};

/**
 * Convert transitions to React Flow nodes and edges
 */
export const convertToReactFlow = (
  transitions: Transition[],
  positionsMap: PositionsMap | null,
  currentState: string
): { nodes: Node<StateNodeData>[]; edges: Edge<TransitionEdgeData>[] } => {
  const nodes: Node<StateNodeData>[] = [];
  const edges: Edge<TransitionEdgeData>[] = [];
  const processedStates = new Set<string>();

  // First pass: create all nodes and edges
  transitions.forEach((transition) => {
    // Add start state node if not already added
    if (transition.startStateId && !processedStates.has(transition.startStateId)) {
      nodes.push({
        id: transition.startStateId,
        type: 'stateNode',
        position: { x: 0, y: 0 }, // Will be updated later
        data: {
          title: transition.startStateName || transition.startStateId,
          entityId: transition.startStateId,
          persisted: transition.persisted || true,
          isCurrentState: currentState === transition.startStateName,
          isNoneState: transition.startStateId === NONE_STATE_ID,
        },
      });

      processedStates.add(transition.startStateId);
    }

    // Add end state node if not already added
    if (transition.endStateId && !processedStates.has(transition.endStateId)) {
      nodes.push({
        id: transition.endStateId,
        type: 'stateNode',
        position: { x: 0, y: 0 }, // Will be updated later
        data: {
          title: transition.endStateName || transition.endStateId,
          entityId: transition.endStateId,
          persisted: transition.persisted || true,
          isCurrentState: currentState === transition.endStateName,
          isNoneState: transition.endStateId === NONE_STATE_ID,
        },
      });

      processedStates.add(transition.endStateId);
    }

    // Add transition edge
    edges.push({
      id: transition.id,
      source: transition.startStateId,
      target: transition.endStateId,
      type: 'transitionEdge',
      data: {
        title: `[${transition.automated ? 'A' : 'M'}] ${transition.name}`,
        automated: transition.automated,
        persisted: transition.persisted,
      },
      animated: transition.automated,
    });
  });

  // Second pass: apply positions
  if (positionsMap) {
    // Use saved positions
    nodes.forEach(node => {
      if (positionsMap[node.id]) {
        node.position = positionsMap[node.id];
      }
    });
  } else {
    // Calculate hierarchical layout
    const calculatedPositions = calculateHierarchicalLayout(nodes, edges);
    nodes.forEach(node => {
      const pos = calculatedPositions.get(node.id);
      if (pos) {
        node.position = pos;
      }
    });
  }

  console.log('convertToReactFlow - Created nodes:', nodes.length, nodes);
  console.log('convertToReactFlow - Created edges:', edges.length, edges);

  return { nodes, edges };
};

/**
 * Extract positions from React Flow nodes to save
 */
export const extractPositionsMap = (nodes: Node[]): PositionsMap => {
  const positionsMap: PositionsMap = {};
  
  nodes.forEach((node) => {
    positionsMap[node.id] = {
      x: node.position.x,
      y: node.position.y,
    };
  });

  return positionsMap;
};

