/**
 * Graphical State Machine Component (React Flow)
 * Displays workflow state machines as an interactive graph
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  Panel,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  NodeChange,
  EdgeChange,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button, Space } from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';

import { StateNode, StateNodeData } from './nodes/StateNode';
import { TransitionEdge, TransitionEdgeData } from './edges/TransitionEdge';
import { convertToReactFlow, extractPositionsMap } from './reactFlowUtils';
import type { Transition, PositionsMap, Process, Criteria } from './utils';

import './GraphicalStateMachine.scss';

export interface GraphicalStateMachineProps {
  workflowId: string;
  transitions: Transition[];
  processes: Process[];
  criteria: Criteria[];
  positionsMap?: PositionsMap | null;
  currentState?: string;
  isReadonly?: boolean;
  minHeight?: string;
  onUpdatePositionsMap?: (positionsMap: PositionsMap) => void;
  onSelectElement?: (element: { type: string; id: string; title: string; persisted: boolean }) => void;
}

// Simple test node to verify React Flow is working
const TestNode = ({ data, id }: any) => {
  console.log('TestNode rendering with data:', data, 'and id:', id);

  // Use different colors for different nodes to make them easier to spot
  let bgColor = 'red';
  if (data.title === 'LOCKED') bgColor = 'blue';
  if (data.title === 'ACTIVE') bgColor = 'green';
  if (data.isNoneState) bgColor = 'purple';

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-target`}
        style={{ background: '#555', width: '8px', height: '8px' }}
      />
      <div
        className="test-node-custom"
        style={{
          padding: '16px 32px',
          background: bgColor,
          border: '2px solid yellow',
          borderRadius: '10px',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          minWidth: '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {data.title}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-source`}
        style={{ background: '#555', width: '8px', height: '8px' }}
      />
    </>
  );
};

const nodeTypes = {
  stateNode: TestNode,
};

const edgeTypes = {
  transitionEdge: TransitionEdge,
};

/**
 * Transform API transitions to the format expected by the graphical view
 */
const transformTransitions = (apiTransitions: Transition[]): Transition[] => {
  return apiTransitions.map((t) => ({
    ...t,
    startStateId: t.startStateId || t.fromState,
    endStateId: t.endStateId || t.toState,
    startStateName: t.startStateName || t.fromState,
    endStateName: t.endStateName || t.toState,
    automated: t.automated !== undefined ? t.automated : (t.automatic || false),
    persisted: t.persisted !== undefined ? t.persisted : true,
    criteriaIds: t.criteriaIds || (t.criteriaId ? [t.criteriaId] : []),
    endProcessesIds: t.endProcessesIds || (t.processId ? [t.processId] : []),
  }));
};

export const GraphicalStateMachine: React.FC<GraphicalStateMachineProps> = ({
  workflowId,
  transitions,
  processes,
  criteria,
  positionsMap = null,
  currentState = '',
  isReadonly = false,
  minHeight = '600px',
  onUpdatePositionsMap,
  onSelectElement,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Transform and convert transitions to React Flow format
  const transformedTransitions = transformTransitions(transitions);
  console.log('GraphicalStateMachine - Original transitions:', transitions);
  console.log('GraphicalStateMachine - Transformed transitions:', transformedTransitions);
  const initialData = convertToReactFlow(transformedTransitions, positionsMap, currentState);
  const [nodes, setNodes] = useState<Node<StateNodeData>[]>(initialData.nodes);
  const [edges, setEdges] = useState<Edge<TransitionEdgeData>[]>(initialData.edges);

  // Update nodes and edges when transitions change
  useEffect(() => {
    const transformedTransitions = transformTransitions(transitions);
    const newData = convertToReactFlow(transformedTransitions, positionsMap, currentState);
    setNodes(newData.nodes);
    setEdges(newData.edges);
  }, [transitions, positionsMap, currentState]);

  // Handle node changes (including drag)
  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));

      // Save positions when nodes are dragged
      const dragChange = changes.find((c) => c.type === 'position' && 'dragging' in c && c.dragging === false);
      if (dragChange && onUpdatePositionsMap) {
        setNodes((currentNodes) => {
          const newPositionsMap = extractPositionsMap(currentNodes);
          onUpdatePositionsMap(newPositionsMap);
          return currentNodes;
        });
      }
    },
    [onUpdatePositionsMap]
  );

  // Handle edge changes
  const onEdgesChange: OnEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onSelectElement) {
        onSelectElement({
          type: 'node',
          id: node.data.entityId,
          title: node.data.title,
          persisted: node.data.persisted,
        });
      }
    },
    [onSelectElement]
  );

  // Handle edge click
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (onSelectElement && edge.data) {
        onSelectElement({
          type: 'edge',
          id: edge.id,
          title: edge.data.title,
          persisted: edge.data.persisted,
        });
      }
    },
    [onSelectElement]
  );

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Toggle minimap
  const toggleMiniMap = useCallback(() => {
    setShowMiniMap((prev) => !prev);
  }, []);

  return (
    <div
      className={`graphical-statemachine-wrapper ${isFullscreen ? 'fullscreen' : ''}`}
      style={{ minHeight }}
    >
      <div className="graphical-statemachine" style={{ height: minHeight }}>
        {/* React Flow Graph */}
        <div className="graph-container" style={{ height: minHeight, width: '100%', backgroundColor: '#0f172a' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodesDraggable={!isReadonly}
            nodesConnectable={false}
            elementsSelectable={true}
            fitView
            fitViewOptions={{ padding: 0.3, minZoom: 0.5, maxZoom: 1.5 }}
            minZoom={0.5}
            maxZoom={4}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            style={{ width: '100%', height: '100%', backgroundColor: '#0f172a' }}
          >
            <Background color="#1e293b" gap={20} size={1} style={{ backgroundColor: '#0f172a' }} />
            <Controls showInteractive={false} />
            {showMiniMap && (
              <MiniMap
                nodeColor={(node) => {
                  if (node.data?.isCurrentState) return '#f59e0b';
                  if (node.data?.isNoneState) return '#10b981';
                  return '#3b82f6';
                }}
                maskColor="rgba(0, 0, 0, 0.8)"
                style={{
                  backgroundColor: '#0f172a',
                }}
              />
            )}

            {/* Control Panel */}
            <Panel position="top-left" className="panel">
              <Space>
                <Button
                  icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                />
                <Button
                  icon={showMiniMap ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  onClick={toggleMiniMap}
                  title={showMiniMap ? 'Hide MiniMap' : 'Show MiniMap'}
                />
              </Space>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default GraphicalStateMachine;

