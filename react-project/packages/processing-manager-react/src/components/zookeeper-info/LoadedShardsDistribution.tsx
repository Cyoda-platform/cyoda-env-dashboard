/**
 * Loaded Shards Distribution Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo/PmLoadedShardsDistribution.vue
 */

import React, { useMemo } from 'react';
import { Table, Descriptions } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useZkShardsDistribution } from '../../hooks/usePlatformCommon';

interface TableDataRow {
  id: string;
  shardsByNodes: string;
}

interface LoadedShardsDistributionProps {
  clusterState?: any;
  clusterStateShardsDistr?: any;
}

export const LoadedShardsDistribution: React.FC<LoadedShardsDistributionProps> = ({
  clusterState = {},
  clusterStateShardsDistr = {},
}) => {
  const { data: shardsData, isLoading } = useZkShardsDistribution();

  // Transform the data from { nodesIds: [...], shardsByNodes: {...} } to table rows
  const tableData = useMemo(() => {
    if (!shardsData || !(shardsData as any).nodesIds) return [];

    const data = shardsData as any;
    return data.nodesIds.map((id: string) => ({
      id,
      shardsByNodes: data.shardsByNodes[id]?.join(', ') || '',
    }));
  }, [shardsData]);

  const columns: ColumnsType<TableDataRow> = [
    {
      title: 'Nodes ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Shards By Nodes',
      dataIndex: 'shardsByNodes',
      key: 'shardsByNodes',
    },
  ];

  return (
    <div>
      <h3>Loaded Shards Distribution</h3>
      {shardsData && (shardsData as any).id && (
        <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
          <Descriptions.Item label="ID">
            {(shardsData as any).id || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Dispatcher Node ID">
            {(shardsData as any).dispatcherNodeId || '-'}
          </Descriptions.Item>
        </Descriptions>
      )}
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="id"
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

