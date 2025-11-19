/**
 * Polling Info Component
 * Displays polling information with filtering
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingEvents/PmPollingInfo.vue
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Table, Form, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import { usePollingInfo } from '../../hooks/useProcessing';
import _ from 'lodash';
import './PollingInfo.scss';

interface PollingInfoItem {
  shardId: string;
  queueType: string;
  processing: string;
  lastEmptyPollings: number;
  maxTimeout: number;
  lastDelayTime: string;
  lastPollingTime: string;
}

const createUniqMap = (prop: string, data: any[]): { label: string; value: any }[] => {
  const uniqueValues = Array.from(new Set(data.map(item => item[prop])));
  return uniqueValues.map(value => ({ label: String(value), value }));
};

export const PollingInfo: React.FC = () => {
  const storage = useMemo(() => new HelperStorage(), []);
  const { data, isLoading } = usePollingInfo();
  const [shardFilter, setShardFilter] = useState<string | undefined>(undefined);
  const [queueTypeFilter, setQueueTypeFilter] = useState<string | undefined>(undefined);
  const [processingFilter, setProcessingFilter] = useState<string | undefined>(undefined);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const defaultWidths = {
      shardId: 100,
      queueType: 350,
      processing: 140,
      lastEmptyPollings: 200,
      maxTimeout: 150,
      lastDelayTime: 200,
      lastPollingTime: 200,
    };
    // Always use default widths (ignore saved values for now)
    return defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('pollingInfo:columnWidths', columnWidths);
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

  const pollingInfoTable = useMemo(() => {
    if (!data || typeof data !== 'object') return [];
    const result: PollingInfoItem[] = [];
    try {
      Object.values(data).forEach((pollingInfoEl: any) => {
        if (pollingInfoEl && typeof pollingInfoEl === 'object') {
          Object.values(pollingInfoEl).forEach((el: any) => {
            if (el && typeof el === 'object') {
              result.push({
                ...el,
                processing: el.processing != null ? el.processing.toString() : '',
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('Error processing polling info data:', error);
    }
    return result;
  }, [data]);

  const shardIdFilterData = useMemo(() => {
    const options = pollingInfoTable.map((el) => ({
      label: el.shardId,
      value: el.shardId,
    }));
    return _.uniqBy(options, 'value');
  }, [pollingInfoTable]);

  const queueTypeOptions = useMemo(() => {
    return createUniqMap('queueType', pollingInfoTable);
  }, [pollingInfoTable]);

  const processingOptions = useMemo(() => {
    return createUniqMap('processing', pollingInfoTable);
  }, [pollingInfoTable]);

  const filteredData = useMemo(() => {
    return pollingInfoTable.filter((row) => {
      const matchesShard = !shardFilter || row.shardId === shardFilter;
      const matchesQueueType = !queueTypeFilter || row.queueType === queueTypeFilter;
      const matchesProcessing = !processingFilter || row.processing === processingFilter;
      return matchesShard && matchesQueueType && matchesProcessing;
    });
  }, [pollingInfoTable, shardFilter, queueTypeFilter, processingFilter]);

  const columns: ColumnsType<PollingInfoItem> = useMemo(() => [
    {
      title: 'Shard',
      dataIndex: 'shardId',
      key: 'shardId',
      width: columnWidths.shardId,
      fixed: 'left',
      sorter: (a, b) => a.shardId.localeCompare(b.shardId),
      onHeaderCell: () => ({ width: columnWidths.shardId, onResize: handleResize('shardId') }),
    },
    {
      title: 'Entity Type',
      dataIndex: 'queueType',
      key: 'queueType',
      width: columnWidths.queueType,
      sorter: (a, b) => a.queueType.localeCompare(b.queueType),
      onHeaderCell: () => ({ width: columnWidths.queueType, onResize: handleResize('queueType') }),
    },
    {
      title: 'Processing',
      dataIndex: 'processing',
      key: 'processing',
      width: columnWidths.processing,
      sorter: (a, b) => a.processing.localeCompare(b.processing),
      onHeaderCell: () => ({ width: columnWidths.processing, onResize: handleResize('processing') }),
    },
    {
      title: 'Last Empty Pollings count',
      dataIndex: 'lastEmptyPollings',
      key: 'lastEmptyPollings',
      width: columnWidths.lastEmptyPollings,
      sorter: (a, b) => a.lastEmptyPollings - b.lastEmptyPollings,
      onHeaderCell: () => ({ width: columnWidths.lastEmptyPollings, onResize: handleResize('lastEmptyPollings') }),
    },
    {
      title: 'Max Timeout',
      dataIndex: 'maxTimeout',
      key: 'maxTimeout',
      width: columnWidths.maxTimeout,
      sorter: (a, b) => a.maxTimeout - b.maxTimeout,
      onHeaderCell: () => ({ width: columnWidths.maxTimeout, onResize: handleResize('maxTimeout') }),
    },
    {
      title: 'Last Delay Time',
      dataIndex: 'lastDelayTime',
      key: 'lastDelayTime',
      width: columnWidths.lastDelayTime,
      sorter: (a, b) => a.lastDelayTime.localeCompare(b.lastDelayTime),
      onHeaderCell: () => ({ width: columnWidths.lastDelayTime, onResize: handleResize('lastDelayTime') }),
    },
    {
      title: 'Last Polling Time',
      dataIndex: 'lastPollingTime',
      key: 'lastPollingTime',
      width: columnWidths.lastPollingTime,
      sorter: (a, b) => a.lastPollingTime.localeCompare(b.lastPollingTime),
      onHeaderCell: () => ({ width: columnWidths.lastPollingTime, onResize: handleResize('lastPollingTime') }),
    },
  ], [columnWidths, handleResize]);

  return (
    <div className="polling-info">
      <Form layout="vertical">
        <h3>Filter</h3>
        <Row gutter={20}>
          <Col span={8}>
            <Form.Item label="Shard">
              <Select
                value={shardFilter}
                onChange={setShardFilter}
                placeholder="Select shard"
                allowClear
                showSearch
                options={shardIdFilterData}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Queue">
              <Select
                value={queueTypeFilter}
                onChange={setQueueTypeFilter}
                placeholder="Select queue"
                allowClear
                showSearch
                options={queueTypeOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Processing">
              <Select
                value={processingFilter}
                onChange={setProcessingFilter}
                placeholder="Select processing"
                allowClear
                showSearch
                options={processingOptions}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={(record) => `${record.shardId}-${record.queueType}`}
        bordered
        loading={isLoading}
        scroll={{ x: 1340 }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          position: ['bottomCenter'],
          showTotal: (total) => `Total ${total}`,
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

export default PollingInfo;

