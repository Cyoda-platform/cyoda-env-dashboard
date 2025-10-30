/**
 * Time Statistics Count Stat Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTimeStatistics/PmShardsDetailTabTimeStatisticsCountStat.vue
 */

import React from 'react';
import { Table } from 'antd';
import { useStatsCount } from '../../hooks';
import type { ColumnsType } from 'antd/es/table';

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
  const { data, isLoading } = useStatsCount({});

  const columns: ColumnsType<CountStatData> = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      width: 500,
      fixed: 'left',
      sorter: (a, b) => a.key.localeCompare(b.key),
    },
    {
      title: 'Num Calls',
      dataIndex: 'numCalls',
      key: 'numCalls',
      width: 130,
      sorter: (a, b) => a.numCalls - b.numCalls,
    },
    {
      title: 'Min',
      dataIndex: 'min',
      key: 'min',
      width: 130,
      sorter: (a, b) => a.min - b.min,
    },
    {
      title: 'Avg',
      dataIndex: 'avg',
      key: 'avg',
      width: 130,
      sorter: (a, b) => a.avg - b.avg,
    },
    {
      title: 'Max',
      dataIndex: 'max',
      key: 'max',
      width: 130,
      sorter: (a, b) => a.max - b.max,
    },
    {
      title: 'Last',
      dataIndex: 'last',
      key: 'last',
      width: 130,
      sorter: (a, b) => a.last - b.last,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 130,
      sorter: (a, b) => a.total - b.total,
    },
  ];

  return (
    <div>
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
      />
    </div>
  );
};

export default TimeStatisticsCountStat;

