/**
 * Transition Edge Component for React Flow
 * Represents a transition between states
 */

import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import './TransitionEdge.scss';

export interface TransitionEdgeData {
  title: string;
  automated: boolean;
  persisted: boolean;
}

export const TransitionEdge: React.FC<EdgeProps<TransitionEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const automated = data?.automated ?? false;
  const title = data?.title ?? '';

  const edgeClass = `transition-edge ${automated ? 'automated' : 'manual'} ${selected ? 'selected' : ''}`;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        className={edgeClass}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'none',
            display: 'inline-block',
            width: 'fit-content',
            height: 'fit-content',
          }}
          className="edge-label"
        >
          <div
            className={`edge-label-content ${automated ? 'automated' : 'manual'}`}
            style={{ pointerEvents: 'all' }}
          >
            <span className="edge-label-arrow">→</span>
            <span className="edge-label-text">{title}</span>
            <span className="edge-label-edit">✎</span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

