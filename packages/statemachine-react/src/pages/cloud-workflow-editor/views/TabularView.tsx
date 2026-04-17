import React, { useContext, useMemo, useState } from 'react';
import { Button, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { WorkflowEditorStoreContext, useWorkflowEditorStore } from '../storeContext';
import { TransitionEditDrawer } from '../TransitionEditDrawer';

interface Row {
  stateName: string;
  index: number;
  transitionName: string;
  next: string;
  manual: boolean;
  disabled: boolean;
  processorCount: number;
  hasCriterion: boolean;
  rowKey: string;
}

export const TabularView: React.FC = () => {
  const store = useContext(WorkflowEditorStoreContext)!;
  const states = useWorkflowEditorStore((s) => s.current?.states ?? {});
  const stateNames = useMemo(() => Object.keys(states), [states]);
  const rows = useMemo(() => {
    const out: Row[] = [];
    for (const [stateName, state] of Object.entries(states)) {
      (state.transitions ?? []).forEach((t, index) => {
        out.push({
          stateName, index,
          transitionName: t.name,
          next: t.next,
          manual: t.manual,
          disabled: t.disabled ?? false,
          processorCount: (t.processors ?? []).length,
          hasCriterion: !!t.criterion,
          rowKey: `${stateName}/${index}`,
        });
      });
    }
    return out;
  }, [states]);

  const [editing, setEditing] = useState<{ stateName: string; index: number } | null>(null);
  const [addPickerOpen, setAddPickerOpen] = useState(false);
  const [addState, setAddState] = useState<string | null>(null);

  const onAdd = () => {
    if (!addState) return;
    store.getState().addTransition(addState);
    const newIndex = (store.getState().current!.states[addState].transitions ?? []).length - 1;
    setAddPickerOpen(false);
    setAddState(null);
    setEditing({ stateName: addState, index: newIndex });
  };

  const columns = [
    { title: '#', dataIndex: 'index', render: (_: any, _row: Row, i: number) => i + 1, width: 50 },
    { title: 'State', dataIndex: 'stateName' },
    { title: 'Name', dataIndex: 'transitionName' },
    {
      title: 'Mode', dataIndex: 'manual',
      render: (v: boolean) => v ? <Tag color="orange">Manual</Tag> : <Tag color="cyan">Auto</Tag>,
    },
    {
      title: 'Status', dataIndex: 'disabled',
      render: (v: boolean) => v ? <Tag color="red">Disabled</Tag> : null,
    },
    { title: 'Next', dataIndex: 'next' },
    {
      title: 'Processors', dataIndex: 'processorCount',
      render: (n: number) => <Tag>{n}</Tag>,
    },
    {
      title: 'Criterion', dataIndex: 'hasCriterion',
      render: (v: boolean) => v ? 'Yes' : 'No',
    },
    {
      title: 'Actions',
      render: (_: any, row: Row) => (
        <Space>
          <Button size="small" onClick={() => setEditing({ stateName: row.stateName, index: row.index })}>Edit</Button>
          <Popconfirm
            title="Delete this transition?"
            okText="OK"
            cancelText="Cancel"
            onConfirm={() => store.getState().deleteTransition(row.stateName, row.index)}
          >
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button onClick={() => setAddPickerOpen(true)}>+ Add transition</Button>
      <Table
        dataSource={rows}
        columns={columns as any}
        rowKey="rowKey"
        pagination={false}
        size="small"
      />
      <TransitionEditDrawer
        open={editing !== null}
        stateName={editing?.stateName ?? null}
        transitionIndex={editing?.index ?? null}
        onClose={() => setEditing(null)}
      />
      <Modal
        open={addPickerOpen}
        onCancel={() => { setAddPickerOpen(false); setAddState(null); }}
        onOk={onAdd}
        okText="Add"
        title="Add transition"
      >
        <div>Pick the state this transition leaves from:</div>
        <Select
          style={{ width: '100%', marginTop: 8 }}
          value={addState}
          onChange={setAddState}
          options={stateNames.map((n) => ({ value: n, label: n }))}
        />
      </Modal>
    </Space>
  );
};
