/**
 * TasksGridSkeleton Component
 * Skeleton loading state for tasks grid
 */

import React from 'react';
import { Card, Skeleton, Table } from 'antd';

export const TasksGridSkeleton: React.FC = () => {
  // Create skeleton columns
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: () => <Skeleton.Input active size="small" style={{ width: 150 }} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: () => <Skeleton.Input active size="small" style={{ width: 100 }} />,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: () => <Skeleton.Input active size="small" style={{ width: 120 }} />,
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignee',
      key: 'assignee',
      render: () => <Skeleton.Input active size="small" style={{ width: 150 }} />,
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      render: () => <Skeleton.Input active size="small" style={{ width: 120 }} />,
    },
    {
      title: 'Operations',
      dataIndex: 'operations',
      key: 'operations',
      render: () => <Skeleton.Button active size="small" />,
    },
  ];

  // Create skeleton data
  const data = Array.from({ length: 5 }, (_, index) => ({
    key: index,
    title: '',
    status: '',
    priority: '',
    assignee: '',
    created: '',
    operations: '',
  }));

  return (
    <div className="tasks-grid" role="status" aria-live="polite" aria-label="Loading tasks">
      <div>
        <h2>Tasks</h2>
      </div>
      <div className="wrap-table">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          rowKey="key"
        />
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Skeleton.Button active size="small" style={{ width: 200 }} />
        </div>
      </div>
    </div>
  );
};

export default TasksGridSkeleton;

