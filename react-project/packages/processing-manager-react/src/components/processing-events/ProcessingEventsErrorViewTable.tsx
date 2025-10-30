/**
 * Processing Events Error View Table Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmProcessingEventsErrorView/Component/PmProcessingEventsErrorViewTable.vue
 */

import React from 'react';
import { Table } from 'antd';
import { Link, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

interface ErrorEventRow {
  queueName: string;
  createTime: string;
  doneTime: string;
  errorTime: string;
  shardId: string;
  status: string;
  timeUUID: string;
  entityId: string;
  entityHasErrors: boolean;
  errorEventTimeUUID: string;
  coreDataClassName: string;
  clientDataClassName: string;
}

interface ProcessingEventsErrorViewTableProps {
  tableData: ErrorEventRow[];
}

export const ProcessingEventsErrorViewTable: React.FC<ProcessingEventsErrorViewTableProps> = ({
  tableData,
}) => {
  const { name } = useParams<{ name: string }>();

  const columns: ColumnsType<ErrorEventRow> = [
    {
      title: 'Queue',
      dataIndex: 'queueName',
      key: 'queueName',
      width: 400,
      fixed: 'left',
      sorter: (a, b) => a.queueName.localeCompare(b.queueName),
    },
    {
      title: 'Create Time',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      fixed: 'left',
      sorter: (a, b) => a.createTime.localeCompare(b.createTime),
    },
    {
      title: 'Done Time',
      dataIndex: 'doneTime',
      key: 'doneTime',
      width: 200,
      sorter: (a, b) => (a.doneTime || '').localeCompare(b.doneTime || ''),
    },
    {
      title: 'Error Time',
      dataIndex: 'errorTime',
      key: 'errorTime',
      width: 200,
      sorter: (a, b) => (a.errorTime || '').localeCompare(b.errorTime || ''),
    },
    {
      title: 'Shard',
      dataIndex: 'shardId',
      key: 'shardId',
      width: 100,
      sorter: (a, b) => a.shardId.localeCompare(b.shardId),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: 'Time-UUID',
      dataIndex: 'timeUUID',
      key: 'timeUUID',
      width: 200,
      sorter: (a, b) => a.timeUUID.localeCompare(b.timeUUID),
      render: (timeUUID: string, record: ErrorEventRow) => (
        <Link
          to={`/nodes/${name}/event-view?queue=${record.queueName}&shard=${record.shardId}&timeUUID=${timeUUID}`}
        >
          {timeUUID}
        </Link>
      ),
    },
    {
      title: 'Entity-Class',
      dataIndex: 'queueName',
      key: 'entityClass',
      width: 200,
      sorter: (a, b) => a.queueName.localeCompare(b.queueName),
    },
    {
      title: 'Entity-ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 200,
      sorter: (a, b) => (a.entityId || '').localeCompare(b.entityId || ''),
    },
    {
      title: 'Has Errors',
      dataIndex: 'entityHasErrors',
      key: 'entityHasErrors',
      width: 150,
      sorter: (a, b) => Number(a.entityHasErrors) - Number(b.entityHasErrors),
      render: (hasErrors: boolean) => (hasErrors ? 'Yes' : 'No'),
    },
    {
      title: 'Error Event Time-UUID',
      dataIndex: 'errorEventTimeUUID',
      key: 'errorEventTimeUUID',
      width: 250,
      sorter: (a, b) => (a.errorEventTimeUUID || '').localeCompare(b.errorEventTimeUUID || ''),
    },
    {
      title: 'Core-Event-Data-Class',
      dataIndex: 'coreDataClassName',
      key: 'coreDataClassName',
      width: 250,
      sorter: (a, b) => (a.coreDataClassName || '').localeCompare(b.coreDataClassName || ''),
    },
    {
      title: 'Client-Event-Data-Class',
      dataIndex: 'clientDataClassName',
      key: 'clientDataClassName',
      width: 250,
      sorter: (a, b) => (a.clientDataClassName || '').localeCompare(b.clientDataClassName || ''),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      rowKey="timeUUID"
      bordered
      scroll={{ x: 2800 }}
      pagination={{
        pageSizeOptions: ['5', '10', '15', '20', '50'],
        defaultPageSize: 10,
        showSizeChanger: true,
        position: ['bottomCenter'],
      }}
    />
  );
};

export default ProcessingEventsErrorViewTable;

