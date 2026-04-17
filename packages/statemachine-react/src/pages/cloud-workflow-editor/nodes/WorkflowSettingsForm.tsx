import React, { useContext } from 'react';
import { Form, Input, Select, Space, Switch, Typography } from 'antd';
import { WorkflowEditorStoreContext, useWorkflowEditorStore } from '../storeContext';
import { QueryConditionEditor } from '../../../components/cloud-workflows/QueryConditionEditor';

const { Title } = Typography;

export const WorkflowSettingsForm: React.FC = () => {
  const store = useContext(WorkflowEditorStoreContext)!;
  const doc = useWorkflowEditorStore((s) => s.current);
  if (!doc) return null;

  const update = (patch: any) => store.getState().updateWorkflowProps(patch);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Title level={4}>Workflow settings</Title>
      <Form layout="vertical">
        <Form.Item label="Name">
          <Input aria-label="Name" value={doc.name} onChange={(e) => update({ name: e.target.value })} />
        </Form.Item>
        <Form.Item label="Description">
          <Input.TextArea aria-label="Description" value={doc.desc ?? ''} onChange={(e) => update({ desc: e.target.value })} rows={2} />
        </Form.Item>
        <Form.Item label="Version">
          <Input value={doc.version} onChange={(e) => update({ version: e.target.value })} />
        </Form.Item>
        <Form.Item label="Initial state">
          <Select
            style={{ width: 240 }}
            value={doc.initialState}
            onChange={(v) => update({ initialState: v })}
            options={Object.keys(doc.states).map((n) => ({ value: n, label: n }))}
          />
        </Form.Item>
        <Form.Item label="Active">
          <Switch checked={doc.active ?? false} onChange={(v) => update({ active: v })} />
        </Form.Item>
        <Form.Item label="Workflow-level criterion (optional)">
          <QueryConditionEditor
            value={doc.criterion}
            onChange={(c) => update({ criterion: c })}
          />
        </Form.Item>
      </Form>
    </Space>
  );
};
