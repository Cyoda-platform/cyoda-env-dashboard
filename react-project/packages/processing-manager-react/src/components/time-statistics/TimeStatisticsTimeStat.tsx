/**
 * Time Statistics Time Stat Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTimeStatistics/PmShardsDetailTabTimeStatisticsTimeStat.vue
 */

import React, { useState, useMemo } from 'react';
import { Input, Table, Row, Col } from 'antd';
import { useStatsTime } from '../../hooks';
import type { ColumnsType } from 'antd/es/table';

interface TimeStatData {
  key: string;
  numCalls: number;
  min: number;
  avg: number;
  max: number;
  last: number;
  total: number;
  measure: number;
  measureDesc: string;
  from000To001MsCnt: number;
  from001To010MsCnt: number;
  from010To050MsCnt: number;
  from050To100MsCnt: number;
  from100To500MsCnt: number;
  from500To999MsCnt: number;
  from01To02SecCnt: number;
  from02To10SecCnt: number;
  more10SecCnt: number;
}

export const TimeStatisticsTimeStat: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const { data, isLoading } = useStatsTime({});

  const transformTime = (time: number, row: TimeStatData) => {
    return `${(time / row.measure).toFixed(0)}(${row.measureDesc})`;
  };

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!searchText) return data;

    return data.filter((row: TimeStatData) =>
      Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [data, searchText]);

  const columns: ColumnsType<TimeStatData> = [
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
      render: (min: number, record: TimeStatData) => transformTime(min, record),
    },
    {
      title: 'Avg',
      dataIndex: 'avg',
      key: 'avg',
      width: 130,
      sorter: (a, b) => a.avg - b.avg,
      render: (avg: number, record: TimeStatData) => transformTime(avg, record),
    },
    {
      title: 'Max',
      dataIndex: 'max',
      key: 'max',
      width: 130,
      sorter: (a, b) => a.max - b.max,
      render: (max: number, record: TimeStatData) => transformTime(max, record),
    },
    {
      title: 'Last',
      dataIndex: 'last',
      key: 'last',
      width: 130,
      sorter: (a, b) => a.last - b.last,
      render: (last: number, record: TimeStatData) => transformTime(last, record),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 130,
      sorter: (a, b) => a.total - b.total,
      render: (total: number) => `${total}(s)`,
    },
    {
      title: '0 to 1Ms',
      dataIndex: 'from000To001MsCnt',
      key: 'from000To001MsCnt',
      width: 130,
      sorter: (a, b) => a.from000To001MsCnt - b.from000To001MsCnt,
    },
    {
      title: '1 to 10Ms',
      dataIndex: 'from001To010MsCnt',
      key: 'from001To010MsCnt',
      width: 130,
      sorter: (a, b) => a.from001To010MsCnt - b.from001To010MsCnt,
    },
    {
      title: '10 to 50Ms',
      dataIndex: 'from010To050MsCnt',
      key: 'from010To050MsCnt',
      width: 130,
      sorter: (a, b) => a.from010To050MsCnt - b.from010To050MsCnt,
    },
    {
      title: '50 to 100Ms',
      dataIndex: 'from050To100MsCnt',
      key: 'from050To100MsCnt',
      width: 150,
      sorter: (a, b) => a.from050To100MsCnt - b.from050To100MsCnt,
    },
    {
      title: '100 to 500Ms',
      dataIndex: 'from100To500MsCnt',
      key: 'from100To500MsCnt',
      width: 150,
      sorter: (a, b) => a.from100To500MsCnt - b.from100To500MsCnt,
    },
    {
      title: '500 to 999Ms',
      dataIndex: 'from500To999MsCnt',
      key: 'from500To999MsCnt',
      width: 150,
      sorter: (a, b) => a.from500To999MsCnt - b.from500To999MsCnt,
    },
    {
      title: '1 to 2Sec',
      dataIndex: 'from01To02SecCnt',
      key: 'from01To02SecCnt',
      width: 130,
      sorter: (a, b) => a.from01To02SecCnt - b.from01To02SecCnt,
    },
    {
      title: '2 to 10Sec',
      dataIndex: 'from02To10SecCnt',
      key: 'from02To10SecCnt',
      width: 130,
      sorter: (a, b) => a.from02To10SecCnt - b.from02To10SecCnt,
    },
    {
      title: 'more 10 Sec',
      dataIndex: 'more10SecCnt',
      key: 'more10SecCnt',
      width: 150,
      sorter: (a, b) => a.more10SecCnt - b.more10SecCnt,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <Row>
          <Col span={10}>
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search"
            />
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="key"
        loading={isLoading}
        bordered
        scroll={{ x: 2000 }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          showSizeChanger: true,
          defaultPageSize: 10,
        }}
      />
    </div>
  );
};

export default TimeStatisticsTimeStat;

