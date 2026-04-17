/**
 * WorkflowsTable — Stage-B presentation component.
 *
 * Receives an array of WorkflowSummary plus per-row action handlers from the page.
 * The Delete button is disabled when only one workflow remains (≥1 invariant)
 * to surface the constraint client-side; the gateway also enforces it.
 */

import React from 'react';
import { Table, Button, Space, Tag, Empty, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { WorkflowSummary } from '../../gateways';

export interface WorkflowsTableProps {
  workflows: WorkflowSummary[];
  loading: boolean;
  /**
   * Workflow names currently being activated/deactivated. The corresponding
   * row's Activate/Deactivate button is disabled while in this set, preventing
   * double-clicks that could overlap loadWorkflow + updateWorkflow round-trips.
   */
  pendingActiveNames?: ReadonlySet<string>;
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
  pendingActiveNames,
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
            <Button
              size="small"
              loading={pendingActiveNames?.has(row.name)}
              disabled={pendingActiveNames?.has(row.name)}
              onClick={() => onDeactivate(row.name)}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              size="small"
              loading={pendingActiveNames?.has(row.name)}
              disabled={pendingActiveNames?.has(row.name)}
              onClick={() => onActivate(row.name)}
            >
              Activate
            </Button>
          )}
          {onlyOne ? (
            // Disabled <button> elements don't fire mouse events in most
            // browsers, so antd Tooltip needs a wrapper element with hover
            // capture. Spec §5.4 calls for a tooltip; native title doesn't
            // fire on disabled buttons and looks foreign vs the rest of the
            // app's antd Tooltips.
            <Tooltip title="A model must have at least one workflow — cannot delete the last one.">
              <span style={{ display: 'inline-block', cursor: 'not-allowed' }}>
                <Button
                  size="small"
                  danger
                  disabled
                  style={{ pointerEvents: 'none' }}
                  onClick={() => onDelete(row.name)}
                >
                  Delete
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Button size="small" danger onClick={() => onDelete(row.name)}>
              Delete
            </Button>
          )}
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
      // Pagination intentionally off — workflow counts per model are small in
      // practice (typically <20). Reconsider above ~50 rows.
      pagination={false}
    />
  );
};
