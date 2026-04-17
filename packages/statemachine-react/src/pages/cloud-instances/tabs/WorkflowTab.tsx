import React, { useMemo, useState } from 'react';
import { Space, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { GraphicalStateMachine } from '../../../components/GraphicalStateMachine';
import { getInstancesGateway, getWorkflowGateway, type ModelRef } from '../../../gateways';
import { statemachineKeys } from '../../../hooks/useStatemachine';
import { workflowDocToGraphShape } from '../../cloud-workflow-editor/workflowDocToGraphShape';
import { loadPositions, savePositions } from '../../../shared/positionsStorage';
import type { PositionsMap } from '../../../types';
import { TransitionList } from '../TransitionList';

const { Title } = Typography;

export interface WorkflowTabProps {
  entityId: string;
  modelRef: ModelRef | null;
  workflowName: string;
}

export const WorkflowTab: React.FC<WorkflowTabProps> = ({ entityId, modelRef, workflowName }) => {
  const meta = useQuery({
    queryKey: ['cloud-instances', 'load', entityId],
    queryFn: () => getInstancesGateway().load(entityId),
  });
  const wf = useQuery({
    queryKey: modelRef ? statemachineKeys.workflowDoc(modelRef, workflowName) : ['workflowDoc', null],
    queryFn: () => getWorkflowGateway().loadWorkflow(modelRef!, workflowName),
    enabled: modelRef !== null && workflowName.length > 0,
  });

  const shape = useMemo(() => wf.data ? workflowDocToGraphShape(wf.data) : null, [wf.data]);
  const [positions, setPositions] = useState<PositionsMap | null>(() =>
    modelRef ? loadPositions(modelRef, workflowName) : null,
  );

  if (!shape || !modelRef) return <span>Loading…</span>;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>Workflow</Title>
      <TransitionList
        entityId={entityId}
        modelRef={modelRef}
        workflowName={workflowName}
        entityBody={meta.data?.data}
        currentState={meta.data?.meta?.state ?? ''}
      />
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
        currentState={meta.data?.meta?.state ?? ''}
        minHeight="500px"
      />
    </Space>
  );
};
