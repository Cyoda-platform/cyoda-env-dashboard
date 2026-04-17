/**
 * TransitionList — buttons for all manual transitions available from the current state.
 *
 * Per spec §3.8.1 and §5: fireTransition is last-write-wins. The page that owns
 * the entity body (DetailsTab via gateway.load query) passes the just-loaded body
 * so this component just fires it through. No modal-with-body-editing in v1.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-instances-design.md §3.8.1
 */
import React from 'react';
import { App, Button, Space, Typography } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getInstancesGateway,
  getWorkflowGateway,
  type ModelRef,
} from '../../gateways';
import { statemachineKeys } from '../../hooks/useStatemachine';

const { Title, Text } = Typography;

export interface TransitionListProps {
  entityId: string;
  modelRef: ModelRef | null;
  workflowName: string;
  /** The current entity body, already loaded by the parent. PUT will send this verbatim. */
  entityBody: Record<string, unknown> | undefined;
  /** Current state from entity meta — used to filter transitions. */
  currentState: string;
  /** When true, transition buttons are disabled (e.g. JSON in editor is invalid). */
  disabled?: boolean;
}

export const TransitionList: React.FC<TransitionListProps> = ({ entityId, modelRef, workflowName, entityBody, currentState, disabled = false }) => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();
  const wf = useQuery({
    queryKey: modelRef ? statemachineKeys.workflowDoc(modelRef, workflowName) : ['workflowDoc', null],
    queryFn: () => getWorkflowGateway().loadWorkflow(modelRef!, workflowName),
    enabled: modelRef !== null && workflowName.length > 0,
  });

  const transitions = wf.data?.states?.[currentState]?.transitions ?? [];

  const invalidate = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ['cloud-instances', 'load', entityId] }),
    queryClient.invalidateQueries({ queryKey: ['cloud-instances', 'changes', entityId] }),
  ]);

  const onFire = (transitionName: string) => {
    modal.confirm({
      title: `Fire transition "${transitionName}"?`,
      content: `This will transition entity ${entityId} from state "${currentState}".`,
      okText: 'Fire',
      onOk: async () => {
        try {
          await getInstancesGateway().fireTransition(entityId, transitionName, entityBody ?? {});
          await invalidate();
          message.success(`Transition "${transitionName}" fired`);
        } catch (e: any) {
          message.error(`Failed: ${e?.message ?? 'unknown error'}`);
        }
      },
    });
  };

  const onSaveLoopback = () => {
    modal.confirm({
      title: 'Save (loopback)?',
      content: `Saves the entity in place (state stays "${currentState}"). An automated exit transition may then run if its criteria pass.`,
      okText: 'Save',
      onOk: async () => {
        try {
          await getInstancesGateway().fireLoopback(entityId, entityBody ?? {});
          await invalidate();
          message.success('Saved (loopback)');
        } catch (e: any) {
          message.error(`Failed: ${e?.message ?? 'unknown error'}`);
        }
      },
    });
  };

  if (!modelRef || !workflowName) return null;
  if (wf.isLoading) return <Text>Loading transitions…</Text>;

  return (
    <div>
      <Title level={4}>Transition Entity</Title>
      <Space wrap>
        <Button type="primary" disabled={disabled} onClick={onSaveLoopback}>Save (loopback)</Button>
        {transitions.map((t: any) => (
          <Button key={t.name} disabled={disabled} onClick={() => onFire(t.name)}>{t.name}</Button>
        ))}
        {transitions.length === 0 && <Text type="secondary">No manual transitions from this state</Text>}
      </Space>
    </div>
  );
};
