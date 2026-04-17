import React, { useContext, useState } from 'react';
import { App, Button, Collapse, Form, Input, Modal, Select, Space, Switch, Typography } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { WorkflowEditorStoreContext, useWorkflowEditorStore } from '../storeContext';
import { ProcessorRow } from './ProcessorRow';
import { QueryConditionEditor } from '../../../components/cloud-workflows/QueryConditionEditor';

const { Title } = Typography;

export interface TransitionFormProps {
  stateName: string;
  transitionIndex: number;
}

export const TransitionForm: React.FC<TransitionFormProps> = ({ stateName, transitionIndex }) => {
  const store = useContext(WorkflowEditorStoreContext)!;
  const t = useWorkflowEditorStore((s) => s.current?.states[stateName]?.transitions?.[transitionIndex]);
  const stateNames = useWorkflowEditorStore(useShallow((s) => Object.keys(s.current?.states ?? {})));
  const [pickerOpen, setPickerOpen] = useState(false);
  if (!t) return null;

  const update = (patch: any) => store.getState().updateTransition(stateName, transitionIndex, patch);
  const addProc = (type: 'externalized' | 'scheduled') => {
    store.getState().addProcessor(stateName, transitionIndex, {
      type, name: '',
      ...(type === 'scheduled' ? { config: { delayMs: 1000, transition: t.name } } : {}),
    } as any);
    setPickerOpen(false);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>Transition</Title>
      <Form layout="vertical">
        <Form.Item label="Name">
          <Input value={t.name} onChange={(e) => update({ name: e.target.value })} />
        </Form.Item>
        <Form.Item label="Next state">
          <Select
            style={{ width: 240 }}
            value={t.next}
            onChange={(v) => update({ next: v })}
            options={stateNames.map((n) => ({ value: n, label: n }))}
          />
        </Form.Item>
        <Form.Item label="Manual">
          <Switch checked={t.manual} onChange={(v) => update({ manual: v })} />
        </Form.Item>
        <Form.Item label="Disabled">
          <Switch checked={t.disabled ?? false} onChange={(v) => update({ disabled: v })} />
        </Form.Item>
        <Form.Item label="Criterion (optional)">
          <QueryConditionEditor
            value={t.criterion}
            onChange={(c) => store.getState().setTransitionCriterion(stateName, transitionIndex, c)}
          />
        </Form.Item>
      </Form>

      <Title level={5}>Processors</Title>
      <Collapse
        defaultActiveKey={(t.processors?.length ?? 0) > 0 ? ['0'] : []}
        items={(t.processors ?? []).map((p, i) => ({
          key: String(i),
          label: `${p.type ?? 'externalized'}: ${p.name || '(unnamed)'}`,
          children: <ProcessorRow stateName={stateName} transitionIndex={transitionIndex} processorIndex={i} />,
        }))}
      />
      <Button onClick={() => setPickerOpen(true)}>+ Add processor</Button>

      {pickerOpen && (
        <Modal open={pickerOpen} onCancel={() => setPickerOpen(false)} footer={null} title="Add processor" destroyOnHidden>
          <Space>
            <Button onClick={() => addProc('externalized')}>externalized</Button>
            <Button onClick={() => addProc('scheduled')}>scheduled</Button>
          </Space>
        </Modal>
      )}
    </Space>
  );
};
