/**
 * Loaded Shards Distribution Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo/PmLoadedShardsDistribution.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table, Descriptions } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import { useZkShardsDistribution } from '../../hooks/usePlatformCommon';
import './LoadedShardsDistribution.scss';

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
  const storage = useMemo(() => new HelperStorage(), []);
  const { data: shardsData, isLoading } = useZkShardsDistribution();

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('loadedShardsDistribution:columnWidths', {});
    const defaultWidths = {
      id: 200,
      shardsByNodes: 600,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('loadedShardsDistribution:columnWidths', columnWidths);
    }
  }, [columnWidths, storage]);

  const handleResize = useCallback((key: string) => {
    return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      setColumnWidths((prev) => {
        const oldWidth = prev[key];
        const newWidth = size.width;
        const delta = newWidth - oldWidth;
        const otherKeys = Object.keys(prev).filter(k => k !== key);
        if (otherKeys.length === 0) return { ...prev, [key]: newWidth };
        const totalOtherWidth = otherKeys.reduce((sum, k) => sum + prev[k], 0);
        const newWidths = { ...prev, [key]: newWidth };
        otherKeys.forEach(k => {
          const proportion = prev[k] / totalOtherWidth;
          const adjustment = delta * proportion;
          newWidths[k] = Math.max(50, prev[k] - adjustment);
        });
        return newWidths;
      });
    };
  }, []);

  // Transform the data from { nodesIds: [...], shardsByNodes: {...} } to table rows
  const tableData = useMemo(() => {
    if (!shardsData || !(shardsData as any).nodesIds) return [];

    const data = shardsData as any;
    return data.nodesIds.map((id: string) => ({
      id,
      shardsByNodes: data.shardsByNodes[id]?.join(', ') || '',
    }));
  }, [shardsData]);

  const columns: ColumnsType<TableDataRow> = useMemo(() => [
    {
      title: 'Nodes ID',
      dataIndex: 'id',
      key: 'id',
      width: columnWidths.id,
      sorter: (a, b) => a.id.localeCompare(b.id),
      onHeaderCell: () => ({ width: columnWidths.id, onResize: handleResize('id') }),
    },
    {
      title: 'Shards By Nodes',
      dataIndex: 'shardsByNodes',
      key: 'shardsByNodes',
      width: columnWidths.shardsByNodes,
      onHeaderCell: () => ({ width: columnWidths.shardsByNodes, onResize: handleResize('shardsByNodes') }),
    },
  ], [columnWidths, handleResize]);

  return (
    <div className="loaded-shards-distribution">
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
          showTotal: (total) => `Total ${total}`,
          position: ['bottomCenter'],
        }}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />
    </div>
  );
};

export default LoadedShardsDistribution;

