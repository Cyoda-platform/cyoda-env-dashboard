/**
 * PM Components Execution Queues Info
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsExecutionQueuesInfo.vue
 */

import React, { useMemo } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface ExecutionQueue {
  executorName: string;
  index: number;
  queueSize: number;
  details: string;
}

export const PmComponentsExecutionQueuesInfo: React.FC = () => {
  const tableData = useMemo<ExecutionQueue[]>(() => {
    return [];
  }, []);

  const columns: ColumnsType<ExecutionQueue> = [
    {
      title: 'Executor Name',
      dataIndex: 'executorName',
      key: 'executorName',
      width: 200,
      fixed: 'left',
      sorter: (a, b) => a.executorName.localeCompare(b.executorName),
    },
    {
      title: 'Index',
      dataIndex: 'index',
      key: 'index',
      sorter: (a, b) => a.index - b.index,
    },
    {
      title: 'Queue size',
      dataIndex: 'queueSize',
      key: 'queueSize',
      sorter: (a, b) => a.queueSize - b.queueSize,
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      sorter: (a, b) => a.details.localeCompare(b.details),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="executorName"
        bordered
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />
    </div>
  );
};

export default PmComponentsExecutionQueuesInfo;

