/**
 * Actual Shards Component
 * Displays a table of actual shards with their status and running processes
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingManagers/PmActualShards.vue
 */

import React from 'react';
import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface ActualShard {
  shardId: number;
  state: string;
  processesCount: number;
}

interface ActualShardsProps {
  actualShardsTable: ActualShard[];
}

export const ActualShards: React.FC<ActualShardsProps> = ({ actualShardsTable }) => {
  const columns: ColumnsType<ActualShard> = [
    {
      title: 'Shard',
      dataIndex: 'shardId',
      key: 'shardId',
      sorter: (a, b) => a.shardId - b.shardId,
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      sorter: (a, b) => a.state.localeCompare(b.state),
    },
    {
      title: 'Running Processes',
      dataIndex: 'processesCount',
      key: 'processesCount',
      sorter: (a, b) => a.processesCount - b.processesCount,
    },
  ];

  return (
    <Card title="Actual shards" style={{ marginBottom: 16 }}>
      <Table
        columns={columns}
        dataSource={actualShardsTable}
        rowKey="shardId"
        bordered
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />
    </Card>
  );
};

export default ActualShards;

