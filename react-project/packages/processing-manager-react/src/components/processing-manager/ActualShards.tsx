/**
 * Actual Shards Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingManagers/PmActualShards.vue
 */

import React from 'react';
import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface ShardRow {
  shardId: string;
  state: string;
  processesCount: number;
}

interface ActualShardsProps {
  actualShardsTable: ShardRow[];
}

export const ActualShards: React.FC<ActualShardsProps> = ({ actualShardsTable = [] }) => {
  const columns: ColumnsType<ShardRow> = [
    {
      title: 'Shard',
      dataIndex: 'shardId',
      key: 'shardId',
      sorter: (a, b) => a.shardId.localeCompare(b.shardId),
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
    <Card title="Actual shards">
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

