/**
 * GraphicalView — wires the existing GraphicalStateMachine Cytoscape
 * component to the cloud editor via workflowDocToGraphShape adapter +
 * localStorage position persistence.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-workflow-editor-layout-pivot.md §3.7
 *
 * Note on isReadonly: NOT passed. The isReadonly prop calls cy.nodes().lock()
 * which disables position dragging — the opposite of what we want. The
 * "Add transition" affordance is suppressed by omitting onAddTransition.
 */
import React, { useMemo, useState } from 'react';
import { GraphicalStateMachine } from '../../../components/GraphicalStateMachine';
import { useWorkflowEditorStore } from '../storeContext';
import { workflowDocToGraphShape } from '../workflowDocToGraphShape';
import { loadPositions, savePositions } from '../../../shared/positionsStorage';
import type { ModelRef } from '../../../gateways';
import type { PositionsMap } from '../../../types';

export interface GraphicalViewProps {
  modelRef: ModelRef;
  workflowName: string;
}

export const GraphicalView: React.FC<GraphicalViewProps> = ({ modelRef, workflowName }) => {
  const doc = useWorkflowEditorStore((s) => s.current);
  const shape = useMemo(() => doc ? workflowDocToGraphShape(doc) : null, [doc]);
  const [positions, setPositions] = useState<PositionsMap | null>(() =>
    loadPositions(modelRef, workflowName),
  );

  if (!shape) return null;

  return (
    <GraphicalStateMachine
      workflowId={`${modelRef.entityName}/${modelRef.modelVersion}/${workflowName}`}
      transitions={shape.transitions}
      processes={shape.processes}
      criteria={shape.criteria}
      positionsMap={positions}
      onUpdatePositionsMap={(next) => {
        setPositions(next);
        savePositions(modelRef, workflowName, next);
      }}
      minHeight="600px"
    />
  );
};
