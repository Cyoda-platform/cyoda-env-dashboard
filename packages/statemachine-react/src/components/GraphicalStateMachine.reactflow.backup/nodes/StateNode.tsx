/**
 * State Node Component for React Flow
 * Represents a workflow state in the graphical state machine
 */

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import './StateNode.scss';

export interface StateNodeData {
  title: string;
  entityId: string;
  persisted: boolean;
  isCurrentState?: boolean;
  isNoneState?: boolean;
}

export const StateNode: React.FC<NodeProps<StateNodeData>> = ({ data, selected }) => {
  const { title, isCurrentState, isNoneState } = data;

  const nodeClass = `state-node ${isCurrentState ? 'current-state' : ''} ${isNoneState ? 'none-state' : ''} ${selected ? 'selected' : ''}`;

  return (
    <div
      className={nodeClass}
      style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        border: '2px solid #1d4ed8',
        borderRadius: '8px',
        padding: '16px 20px',
        minWidth: '160px',
        minHeight: '80px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        cursor: 'pointer',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Handle type="target" position={Position.Top} className="node-handle" />
      <div className="state-node-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#ffffff' }}>
        <div className="state-icon" style={{ fontSize: '20px' }}>⚪</div>
        <div className="state-title" style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>{title}</div>
        <div className="state-subtitle" style={{ fontSize: '12px', color: '#f3f4f6' }}>State</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="node-handle" />
    </div>
  );
};

