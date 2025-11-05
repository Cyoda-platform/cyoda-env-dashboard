/**
 * Actual Shards Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingManagers/PmActualShards.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import './ActualShards.scss';

interface ShardRow {
  shardId: string;
  state: string;
  processesCount: number;
}

interface ActualShardsProps {
  actualShardsTable: ShardRow[];
}

export const ActualShards: React.FC<ActualShardsProps> = ({ actualShardsTable = [] }) => {
  const storage = useMemo(() => new HelperStorage(), []);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('pmActualShards:columnWidths', {});
    const defaultWidths = { shardId: 200, state: 200, processesCount: 200 };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('pmActualShards:columnWidths', columnWidths);
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

  const columns: ColumnsType<ShardRow> = useMemo(() => [
    {
      title: 'Shard',
      dataIndex: 'shardId',
      key: 'shardId',
      width: columnWidths.shardId,
      sorter: (a, b) => a.shardId.localeCompare(b.shardId),
      onHeaderCell: () => ({ width: columnWidths.shardId, onResize: handleResize('shardId') }),
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      width: columnWidths.state,
      sorter: (a, b) => a.state.localeCompare(b.state),
      onHeaderCell: () => ({ width: columnWidths.state, onResize: handleResize('state') }),
    },
    {
      title: 'Running Processes',
      dataIndex: 'processesCount',
      key: 'processesCount',
      width: columnWidths.processesCount,
      sorter: (a, b) => a.processesCount - b.processesCount,
      onHeaderCell: () => ({ width: columnWidths.processesCount, onResize: handleResize('processesCount') }),
    },
  ], [columnWidths, handleResize]);

  return (
    <Card title="Actual shards" className="pm-actual-shards">
      <Table
        columns={columns}
        dataSource={actualShardsTable}
        rowKey="shardId"
        bordered
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          position: ['bottomCenter'],
        }}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />
    </Card>
  );
};

export default ActualShards;

