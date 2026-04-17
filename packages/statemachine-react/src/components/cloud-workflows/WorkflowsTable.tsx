/**
 * WorkflowsTable — Stage-B presentation component.
 *
 * Receives an array of WorkflowSummary plus per-row action handlers from the page.
 * The Delete button is disabled when only one workflow remains (≥1 invariant)
 * to surface the constraint client-side; the gateway also enforces it.
 */

import React from 'react';
import { Table, Button, Space, Tag, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { WorkflowSummary } from '../../gateways';

export interface WorkflowsTableProps {
  workflows: WorkflowSummary[];
  loading: boolean;
  onEdit: (name: string) => void;
  onDuplicate: (name: string) => void;
  onRename: (name: string) => void;
  onDeactivate: (name: string) => void;
  onActivate: (name: string) => void;
  onDelete: (name: string) => void;
}

export const WorkflowsTable: React.FC<WorkflowsTableProps> = ({
  workflows,
  loading,
  onEdit,
  onDuplicate,
  onRename,
  onDeactivate,
  onActivate,
  onDelete,
}) => {
  const onlyOne = workflows.length === 1;

  const columns: ColumnsType<WorkflowSummary> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'desc',
      key: 'desc',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (v?: boolean) =>
        v ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
    },
    {
      title: 'Initial state',
      dataIndex: 'initialState',
      key: 'initialState',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_v, row) => (
        <Space>
          <Button size="small" onClick={() => onEdit(row.name)}>
            Edit
          </Button>
          <Button size="small" onClick={() => onDuplicate(row.name)}>
            Duplicate
          </Button>
          <Button size="small" onClick={() => onRename(row.name)}>
            Rename
          </Button>
          {row.active ? (
            <Button size="small" onClick={() => onDeactivate(row.name)}>
              Deactivate
            </Button>
          ) : (
            <Button size="small" onClick={() => onActivate(row.name)}>
              Activate
            </Button>
          )}
          <Button
            size="small"
            danger
            disabled={onlyOne}
            title={
              onlyOne
                ? 'A model must have at least one workflow — cannot delete the last one.'
                : undefined
            }
            onClick={() => onDelete(row.name)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (workflows.length === 0 && !loading) {
    return <Empty description="No workflows in this model" />;
  }

  return (
    <Table
      rowKey="name"
      columns={columns}
      dataSource={workflows}
      loading={loading}
      pagination={false}
    />
  );
};
