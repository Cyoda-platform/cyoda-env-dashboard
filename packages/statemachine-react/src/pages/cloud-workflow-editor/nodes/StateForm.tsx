import React, { useContext } from 'react';
import { Button, Space, Typography } from 'antd';
import { WorkflowEditorStoreContext, useWorkflowEditorStore } from '../storeContext';

const { Title } = Typography;

export interface StateFormProps {
  stateName: string;
}

export const StateForm: React.FC<StateFormProps> = ({ stateName }) => {
  const store = useContext(WorkflowEditorStoreContext)!;
  const transitions = useWorkflowEditorStore((s) => s.current?.states[stateName]?.transitions ?? []);
  const count = transitions.length;
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>State: {stateName}</Title>
      <div>{count} transition{count === 1 ? '' : 's'}</div>
      <Button onClick={() => store.getState().addTransition(stateName)}>+ Add transition</Button>
    </Space>
  );
};
