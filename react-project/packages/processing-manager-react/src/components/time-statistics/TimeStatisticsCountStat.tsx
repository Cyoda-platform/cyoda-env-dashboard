/**
 * Time Statistics Count Stat Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTimeStatistics/PmShardsDetailTabTimeStatisticsCountStat.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table } from 'antd';
import { useStatsCount } from '../../hooks';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import './TimeStatisticsCountStat.scss';

interface CountStatData {
  key: string;
  numCalls: number;
  min: number;
  avg: number;
  max: number;
  last: number;
  total: number;
}

export const TimeStatisticsCountStat: React.FC = () => {
  const storage = useMemo(() => new HelperStorage(), []);
  const { data, isLoading } = useStatsCount({});

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('timeStatsCount:columnWidths', {});
    const defaultWidths = {
      key: 500,
      numCalls: 130,
      min: 130,
      avg: 130,
      max: 130,
      last: 130,
      total: 130,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('timeStatsCount:columnWidths', columnWidths);
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

  const columns: ColumnsType<CountStatData> = useMemo(() => [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      width: columnWidths.key,
      fixed: 'left',
      sorter: (a, b) => a.key.localeCompare(b.key),
      onHeaderCell: () => ({ width: columnWidths.key, onResize: handleResize('key') }),
    },
    {
      title: 'Num Calls',
      dataIndex: 'numCalls',
      key: 'numCalls',
      width: columnWidths.numCalls,
      sorter: (a, b) => a.numCalls - b.numCalls,
      onHeaderCell: () => ({ width: columnWidths.numCalls, onResize: handleResize('numCalls') }),
    },
    {
      title: 'Min',
      dataIndex: 'min',
      key: 'min',
      width: columnWidths.min,
      sorter: (a, b) => a.min - b.min,
      onHeaderCell: () => ({ width: columnWidths.min, onResize: handleResize('min') }),
    },
    {
      title: 'Avg',
      dataIndex: 'avg',
      key: 'avg',
      width: columnWidths.avg,
      sorter: (a, b) => a.avg - b.avg,
      onHeaderCell: () => ({ width: columnWidths.avg, onResize: handleResize('avg') }),
    },
    {
      title: 'Max',
      dataIndex: 'max',
      key: 'max',
      width: columnWidths.max,
      sorter: (a, b) => a.max - b.max,
      onHeaderCell: () => ({ width: columnWidths.max, onResize: handleResize('max') }),
    },
    {
      title: 'Last',
      dataIndex: 'last',
      key: 'last',
      width: columnWidths.last,
      sorter: (a, b) => a.last - b.last,
      onHeaderCell: () => ({ width: columnWidths.last, onResize: handleResize('last') }),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: columnWidths.total,
      sorter: (a, b) => a.total - b.total,
      onHeaderCell: () => ({ width: columnWidths.total, onResize: handleResize('total') }),
    },
  ], [columnWidths, handleResize]);

  return (
    <div className="time-statistics-count-stat">
      <Table
        columns={columns}
        dataSource={Array.isArray(data) ? data : []}
        rowKey="key"
        loading={isLoading}
        bordered
        scroll={{ x: 1000 }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          showSizeChanger: true,
          defaultPageSize: 10,
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

export default TimeStatisticsCountStat;

