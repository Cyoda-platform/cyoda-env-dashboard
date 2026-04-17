import React from 'react';
import { useWorkflowEditorStore } from './storeContext';
import { WorkflowPropsForm } from './nodes/WorkflowPropsForm';
import { StateForm } from './nodes/StateForm';
import { TransitionForm } from './nodes/TransitionForm';

export const NodeRouter: React.FC = () => {
  const path = useWorkflowEditorStore((s) => s.selectedPath);

  if (path === '/') return <WorkflowPropsForm />;
  const stateMatch = path.match(/^\/states\/([^/]+)$/);
  if (stateMatch) return <StateForm stateName={stateMatch[1]} />;
  const transMatch = path.match(/^\/states\/([^/]+)\/transitions\/(\d+)$/);
  if (transMatch) return <TransitionForm stateName={transMatch[1]} transitionIndex={Number(transMatch[2])} />;
  return null;
};
