import React, { useContext } from 'react';
import { Form, Input, InputNumber, Select, Switch, Button } from 'antd';
import { WorkflowEditorStoreContext, useWorkflowEditorStore } from '../storeContext';

export interface ProcessorRowProps {
  stateName: string;
  transitionIndex: number;
  processorIndex: number;
}

export const ProcessorRow: React.FC<ProcessorRowProps> = ({ stateName, transitionIndex, processorIndex }) => {
  const store = useContext(WorkflowEditorStoreContext)!;
  const p = useWorkflowEditorStore(
    (s) => s.current?.states[stateName]?.transitions?.[transitionIndex]?.processors?.[processorIndex],
  );
  if (!p) return null;
  const update = (patch: any) => store.getState().updateProcessor(stateName, transitionIndex, processorIndex, patch);
  const updateConfig = (cfgPatch: any) => update({ config: { ...((p as any).config ?? {}), ...cfgPatch } });

  return (
    <Form layout="vertical">
      <Form.Item label="Name">
        <Input value={p.name} onChange={(e) => update({ name: e.target.value })} />
      </Form.Item>
      <Form.Item label="Execution mode">
        <Select
          style={{ width: 200 }}
          value={p.executionMode ?? 'ASYNC_NEW_TX'}
          onChange={(v) => update({ executionMode: v })}
          options={[
            { value: 'SYNC', label: 'SYNC' },
            { value: 'ASYNC_SAME_TX', label: 'ASYNC_SAME_TX' },
            { value: 'ASYNC_NEW_TX', label: 'ASYNC_NEW_TX' },
          ]}
        />
      </Form.Item>
      {p.type === 'externalized' && (
        <>
          <Form.Item label="Attach entity">
            <Switch checked={(p as any).config?.attachEntity ?? false} onChange={(v) => updateConfig({ attachEntity: v })} />
          </Form.Item>
          <Form.Item label="Calculation node tags">
            <Input value={(p as any).config?.calculationNodesTags ?? ''} onChange={(e) => updateConfig({ calculationNodesTags: e.target.value })} />
          </Form.Item>
          <Form.Item label="Response timeout (ms)">
            <InputNumber value={(p as any).config?.responseTimeoutMs ?? null} onChange={(v) => updateConfig({ responseTimeoutMs: v ?? undefined })} />
          </Form.Item>
        </>
      )}
      {p.type === 'scheduled' && (
        <>
          <Form.Item label="Delay (ms)">
            <InputNumber value={(p as any).config?.delayMs ?? null} onChange={(v) => updateConfig({ delayMs: v ?? undefined })} />
          </Form.Item>
          <Form.Item label="Timeout (ms)">
            <InputNumber value={(p as any).config?.timeoutMs ?? null} onChange={(v) => updateConfig({ timeoutMs: v ?? undefined })} />
          </Form.Item>
          <Form.Item label="Transition to fire">
            <Input value={(p as any).config?.transition ?? ''} onChange={(e) => updateConfig({ transition: e.target.value })} />
          </Form.Item>
        </>
      )}
      <Button danger onClick={() => store.getState().deleteProcessor(stateName, transitionIndex, processorIndex)}>
        Remove processor
      </Button>
    </Form>
  );
};
