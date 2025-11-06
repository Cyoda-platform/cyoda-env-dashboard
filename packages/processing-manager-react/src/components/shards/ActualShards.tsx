/**
 * Actual Shards Component
 * Displays a table of actual shards with their status and running processes
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingManagers/PmActualShards.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import './ActualShards.scss';

interface ActualShard {
  shardId: number;
  state: string;
  processesCount: number;
}

interface ActualShardsProps {
  actualShardsTable: ActualShard[];
}

export const ActualShards: React.FC<ActualShardsProps> = ({ actualShardsTable }) => {
  const storage = useMemo(() => new HelperStorage(), []);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('actualShards:columnWidths', {});
    const defaultWidths = {
      shardId: 150,
      state: 150,
      processesCount: 200,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('actualShards:columnWidths', columnWidths);
    }
  }, [columnWidths, storage]);

  // Handle column resize
  const handleResize = useCallback((key: string) => {
    return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      setColumnWidths((prev) => {
        const oldWidth = prev[key];
        const newWidth = size.width;
        const delta = newWidth - oldWidth;

        const otherKeys = Object.keys(prev).filter(k => k !== key);
        if (otherKeys.length === 0) {
          return { ...prev, [key]: newWidth };
        }

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

  const columns: ColumnsType<ActualShard> = useMemo(() => [
    {
      title: 'Shard',
      dataIndex: 'shardId',
      key: 'shardId',
      width: columnWidths.shardId,
      sorter: (a, b) => a.shardId - b.shardId,
      onHeaderCell: () => ({
        width: columnWidths.shardId,
        onResize: handleResize('shardId'),
      }),
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      width: columnWidths.state,
      sorter: (a, b) => a.state.localeCompare(b.state),
      onHeaderCell: () => ({
        width: columnWidths.state,
        onResize: handleResize('state'),
      }),
    },
    {
      title: 'Running Processes',
      dataIndex: 'processesCount',
      key: 'processesCount',
      width: columnWidths.processesCount,
      sorter: (a, b) => a.processesCount - b.processesCount,
      onHeaderCell: () => ({
        width: columnWidths.processesCount,
        onResize: handleResize('processesCount'),
      }),
    },
  ], [columnWidths, handleResize]);

  return (
    <Card title="Actual shards" className="actual-shards" style={{ marginBottom: 24 }}>
      <Table
        columns={columns}
        dataSource={actualShardsTable}
        rowKey="shardId"
        bordered
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          position: ['bottomCenter'],
        }}
      />
    </Card>
  );
};

export default ActualShards;

