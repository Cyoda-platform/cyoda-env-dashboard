/**
 * Loaded Shards Distribution Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo/PmLoadedShardsDistribution.vue
 */

import React from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useZkShardsDistribution } from '../../hooks/usePlatformCommon';

interface ShardDistribution {
  shardId: number;
  node: string;
  state: string;
  documentsCount: number;
  size?: string;
}

interface LoadedShardsDistributionProps {
  clusterState?: any;
  clusterStateShardsDistr?: any;
}

export const LoadedShardsDistribution: React.FC<LoadedShardsDistributionProps> = ({
  clusterState = {},
  clusterStateShardsDistr = {},
}) => {
  const { data: shardsData = [], isLoading } = useZkShardsDistribution();

  const columns: ColumnsType<ShardDistribution> = [
    {
      title: 'Shard ID',
      dataIndex: 'shardId',
      key: 'shardId',
      sorter: (a, b) => a.shardId - b.shardId,
    },
    {
      title: 'Node',
      dataIndex: 'node',
      key: 'node',
      sorter: (a, b) => a.node.localeCompare(b.node),
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: (state: string) => {
        const color = state === 'STARTED' ? 'green' : state === 'STOPPED' ? 'red' : 'orange';
        return <Tag color={color}>{state || 'UNKNOWN'}</Tag>;
      },
    },
    {
      title: 'Documents',
      dataIndex: 'documentsCount',
      key: 'documentsCount',
      sorter: (a, b) => a.documentsCount - b.documentsCount,
      render: (count: number) => count?.toLocaleString() || 0,
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: string) => size || '-',
    },
  ];

  return (
    <div>
      <h3>Loaded Shards Distribution</h3>
      <Table
        columns={columns}
        dataSource={Array.isArray(shardsData) ? shardsData : []}
        rowKey="shardId"
        bordered
        loading={isLoading}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />
    </div>
  );
};

export default LoadedShardsDistribution;

