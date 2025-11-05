/**
 * Time Statistics Time Stat Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTimeStatistics/PmShardsDetailTabTimeStatisticsTimeStat.vue
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Input, Table, Row, Col } from 'antd';
import { useStatsTime } from '../../hooks';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import './TimeStatisticsTimeStat.scss';

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
  const storage = useMemo(() => new HelperStorage(), []);
  const [searchText, setSearchText] = useState('');
  const { data, isLoading } = useStatsTime({});

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('timeStatsTime:columnWidths', {});
    const defaultWidths = {
      key: 500, numCalls: 130, min: 130, avg: 130, max: 130, last: 130, total: 130,
      from000To001MsCnt: 130, from001To010MsCnt: 130, from010To050MsCnt: 130,
      from050To100MsCnt: 130, from100To500MsCnt: 130, from500To999MsCnt: 130,
      from01To02SecCnt: 130, from02To10SecCnt: 130, more10SecCnt: 130,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('timeStatsTime:columnWidths', columnWidths);
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

  const transformTime = useCallback((time: number, row: TimeStatData) => {
    return `${(time / row.measure).toFixed(0)}(${row.measureDesc})`;
  }, []);

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!searchText) return data;

    return data.filter((row: TimeStatData) =>
      Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [data, searchText]);

  const columns: ColumnsType<TimeStatData> = useMemo(() => [
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
      render: (min: number, record: TimeStatData) => transformTime(min, record),
    },
    {
      title: 'Avg',
      dataIndex: 'avg',
      key: 'avg',
      width: columnWidths.avg,
      sorter: (a, b) => a.avg - b.avg,
      onHeaderCell: () => ({ width: columnWidths.avg, onResize: handleResize('avg') }),
      render: (avg: number, record: TimeStatData) => transformTime(avg, record),
    },
    {
      title: 'Max',
      dataIndex: 'max',
      key: 'max',
      width: columnWidths.max,
      sorter: (a, b) => a.max - b.max,
      onHeaderCell: () => ({ width: columnWidths.max, onResize: handleResize('max') }),
      render: (max: number, record: TimeStatData) => transformTime(max, record),
    },
    {
      title: 'Last',
      dataIndex: 'last',
      key: 'last',
      width: columnWidths.last,
      sorter: (a, b) => a.last - b.last,
      onHeaderCell: () => ({ width: columnWidths.last, onResize: handleResize('last') }),
      render: (last: number, record: TimeStatData) => transformTime(last, record),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: columnWidths.total,
      sorter: (a, b) => a.total - b.total,
      onHeaderCell: () => ({ width: columnWidths.total, onResize: handleResize('total') }),
      render: (total: number) => `${total}(s)`,
    },
    {
      title: '0 to 1Ms',
      dataIndex: 'from000To001MsCnt',
      key: 'from000To001MsCnt',
      width: columnWidths.from000To001MsCnt,
      sorter: (a, b) => a.from000To001MsCnt - b.from000To001MsCnt,
      onHeaderCell: () => ({ width: columnWidths.from000To001MsCnt, onResize: handleResize('from000To001MsCnt') }),
    },
    {
      title: '1 to 10Ms',
      dataIndex: 'from001To010MsCnt',
      key: 'from001To010MsCnt',
      width: columnWidths.from001To010MsCnt,
      sorter: (a, b) => a.from001To010MsCnt - b.from001To010MsCnt,
      onHeaderCell: () => ({ width: columnWidths.from001To010MsCnt, onResize: handleResize('from001To010MsCnt') }),
    },
    {
      title: '10 to 50Ms',
      dataIndex: 'from010To050MsCnt',
      key: 'from010To050MsCnt',
      width: columnWidths.from010To050MsCnt,
      sorter: (a, b) => a.from010To050MsCnt - b.from010To050MsCnt,
      onHeaderCell: () => ({ width: columnWidths.from010To050MsCnt, onResize: handleResize('from010To050MsCnt') }),
    },
    {
      title: '50 to 100Ms',
      dataIndex: 'from050To100MsCnt',
      key: 'from050To100MsCnt',
      width: columnWidths.from050To100MsCnt,
      sorter: (a, b) => a.from050To100MsCnt - b.from050To100MsCnt,
      onHeaderCell: () => ({ width: columnWidths.from050To100MsCnt, onResize: handleResize('from050To100MsCnt') }),
    },
    {
      title: '100 to 500Ms',
      dataIndex: 'from100To500MsCnt',
      key: 'from100To500MsCnt',
      width: columnWidths.from100To500MsCnt,
      sorter: (a, b) => a.from100To500MsCnt - b.from100To500MsCnt,
      onHeaderCell: () => ({ width: columnWidths.from100To500MsCnt, onResize: handleResize('from100To500MsCnt') }),
    },
    {
      title: '500 to 999Ms',
      dataIndex: 'from500To999MsCnt',
      key: 'from500To999MsCnt',
      width: columnWidths.from500To999MsCnt,
      sorter: (a, b) => a.from500To999MsCnt - b.from500To999MsCnt,
      onHeaderCell: () => ({ width: columnWidths.from500To999MsCnt, onResize: handleResize('from500To999MsCnt') }),
    },
    {
      title: '1 to 2Sec',
      dataIndex: 'from01To02SecCnt',
      key: 'from01To02SecCnt',
      width: columnWidths.from01To02SecCnt,
      sorter: (a, b) => a.from01To02SecCnt - b.from01To02SecCnt,
      onHeaderCell: () => ({ width: columnWidths.from01To02SecCnt, onResize: handleResize('from01To02SecCnt') }),
    },
    {
      title: '2 to 10Sec',
      dataIndex: 'from02To10SecCnt',
      key: 'from02To10SecCnt',
      width: columnWidths.from02To10SecCnt,
      sorter: (a, b) => a.from02To10SecCnt - b.from02To10SecCnt,
      onHeaderCell: () => ({ width: columnWidths.from02To10SecCnt, onResize: handleResize('from02To10SecCnt') }),
    },
    {
      title: 'more 10 Sec',
      dataIndex: 'more10SecCnt',
      key: 'more10SecCnt',
      width: columnWidths.more10SecCnt,
      sorter: (a, b) => a.more10SecCnt - b.more10SecCnt,
      onHeaderCell: () => ({ width: columnWidths.more10SecCnt, onResize: handleResize('more10SecCnt') }),
    },
  ], [columnWidths, handleResize, transformTime]);

  return (
    <div className="time-statistics-time-stat">
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

export default TimeStatisticsTimeStat;

