/**
 * Events Table Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionDetail/Events/EventsTable.vue
 */

import React from 'react';
import { Card, Table, Spin } from 'antd';
import { Link, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

interface EventRow {
  createTime: string;
  doneTime: string;
  errorTime: string;
  totalTimeMillis: number;
  queueName: string;
  shardId: string;
  status: string;
  timeUUID: string;
  entityClassName: string;
  entityId: string;
  entityHasErrors: boolean;
  errorEventTimeUUID: string;
  coreDataClassName: string;
  versionCheckResult: string;
}

interface EventsTableProps {
  tableData: EventRow[];
  isLoading?: boolean;
}

export const EventsTable: React.FC<EventsTableProps> = ({ tableData, isLoading = false }) => {
  const { name } = useParams<{ name: string }>();

  const columns: ColumnsType<EventRow> = [
    {
      title: 'Create Time',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
    },
    {
      title: 'Done Time',
      dataIndex: 'doneTime',
      key: 'doneTime',
      width: 170,
    },
    {
      title: 'Error Time',
      dataIndex: 'errorTime',
      key: 'errorTime',
      width: 170,
    },
    {
      title: 'Total Time(ms)',
      dataIndex: 'totalTimeMillis',
      key: 'totalTimeMillis',
      width: 170,
    },
    {
      title: 'Queue',
      dataIndex: 'queueName',
      key: 'queueName',
      width: 400,
    },
    {
      title: 'Shard',
      dataIndex: 'shardId',
      key: 'shardId',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 200,
    },
    {
      title: 'Time UUID',
      dataIndex: 'timeUUID',
      key: 'timeUUID',
      width: 330,
      render: (timeUUID: string, record: EventRow) => (
        <Link
          to={`/nodes/${name}/event-view?queue=${record.queueName}&shard=${record.shardId}&timeUUID=${timeUUID}`}
        >
          {timeUUID}
        </Link>
      ),
    },
    {
      title: 'Entity Class',
      dataIndex: 'entityClassName',
      key: 'entityClassName',
      width: 350,
    },
    {
      title: 'Entity ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 330,
    },
    {
      title: 'Has Errors',
      dataIndex: 'entityHasErrors',
      key: 'entityHasErrors',
      width: 150,
      render: (hasErrors: boolean) => (hasErrors ? 'Yes' : 'No'),
    },
    {
      title: 'Error Event Time UUID',
      dataIndex: 'errorEventTimeUUID',
      key: 'errorEventTimeUUID',
      width: 330,
    },
    {
      title: 'Core Event Data Class',
      dataIndex: 'coreDataClassName',
      key: 'coreDataClassName',
      width: 350,
    },
    {
      title: 'Client Event Data Class',
      dataIndex: 'versionCheckResult',
      key: 'versionCheckResult',
      width: 350,
    },
  ];

  return (
    <Card title="Transaction Events">
      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="timeUUID"
          bordered
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Spin>
    </Card>
  );
};

export default EventsTable;

