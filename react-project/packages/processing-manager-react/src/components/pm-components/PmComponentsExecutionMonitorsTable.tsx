/**
 * PM Components Execution Monitors Table
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsExecutionMonitors/PmShardsDetailTabPmComponentsExecutionMonitorsTable.vue
 */

import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface ExecutionMonitor {
  index: number;
  name: string;
  entityId: string;
  entityClass: string;
  expectedThreadsCount: number;
  lastAccessTime: string;
  processFinished: boolean;
  processingThreadsCount: number;
  finishedThreadsCount: number;
}

interface PmComponentsExecutionMonitorsTableProps {
  tableData: ExecutionMonitor[];
}

export const PmComponentsExecutionMonitorsTable: React.FC<PmComponentsExecutionMonitorsTableProps> = ({
  tableData = [],
}) => {
  const columns: ColumnsType<ExecutionMonitor> = [
    {
      title: '№',
      dataIndex: 'index',
      key: 'index',
      width: 200,
      fixed: 'left',
      sorter: (a, b) => a.index - b.index,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'EntityId',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 200,
      sorter: (a, b) => a.entityId.localeCompare(b.entityId),
    },
    {
      title: 'Entity Class',
      dataIndex: 'entityClass',
      key: 'entityClass',
      width: 200,
      sorter: (a, b) => a.entityClass.localeCompare(b.entityClass),
    },
    {
      title: 'ExpectedThreadsCount',
      dataIndex: 'expectedThreadsCount',
      key: 'expectedThreadsCount',
      width: 250,
      sorter: (a, b) => a.expectedThreadsCount - b.expectedThreadsCount,
    },
    {
      title: 'LastAccessTime',
      dataIndex: 'lastAccessTime',
      key: 'lastAccessTime',
      width: 200,
      sorter: (a, b) => a.lastAccessTime.localeCompare(b.lastAccessTime),
    },
    {
      title: 'processFinished',
      dataIndex: 'processFinished',
      key: 'processFinished',
      width: 200,
      sorter: (a, b) => Number(a.processFinished) - Number(b.processFinished),
      render: (value) => String(value),
    },
    {
      title: 'ProcessingThreadsCount',
      dataIndex: 'processingThreadsCount',
      key: 'processingThreadsCount',
      width: 250,
      sorter: (a, b) => a.processingThreadsCount - b.processingThreadsCount,
    },
    {
      title: 'FinishedThreadsCount',
      dataIndex: 'finishedThreadsCount',
      key: 'finishedThreadsCount',
      width: 220,
      sorter: (a, b) => a.finishedThreadsCount - b.finishedThreadsCount,
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="index"
        bordered
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          position: ['bottomCenter'],
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default PmComponentsExecutionMonitorsTable;

