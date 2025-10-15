/**
 * Polling Info Component
 * Displays polling information with filtering
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingEvents/PmPollingInfo.vue
 */

import React, { useState, useMemo } from 'react';
import { Table, Form, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { usePollingInfo } from '../../hooks/useProcessing';
import _ from 'lodash';

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
  const { data, isLoading } = usePollingInfo();
  const [shardFilter, setShardFilter] = useState<string | undefined>(undefined);
  const [queueTypeFilter, setQueueTypeFilter] = useState<string | undefined>(undefined);
  const [processingFilter, setProcessingFilter] = useState<string | undefined>(undefined);

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

  const columns: ColumnsType<PollingInfoItem> = [
    {
      title: 'Shard',
      dataIndex: 'shardId',
      key: 'shardId',
      width: 300,
      fixed: 'left',
      sorter: (a, b) => a.shardId.localeCompare(b.shardId),
    },
    {
      title: 'Entity Type',
      dataIndex: 'queueType',
      key: 'queueType',
      width: 300,
      sorter: (a, b) => a.queueType.localeCompare(b.queueType),
    },
    {
      title: 'Processing',
      dataIndex: 'processing',
      key: 'processing',
      width: 130,
      sorter: (a, b) => a.processing.localeCompare(b.processing),
    },
    {
      title: 'Last Empty Pollings count',
      dataIndex: 'lastEmptyPollings',
      key: 'lastEmptyPollings',
      width: 300,
      sorter: (a, b) => a.lastEmptyPollings - b.lastEmptyPollings,
    },
    {
      title: 'Max Timeout',
      dataIndex: 'maxTimeout',
      key: 'maxTimeout',
      width: 400,
      sorter: (a, b) => a.maxTimeout - b.maxTimeout,
    },
    {
      title: 'Last Delay Time',
      dataIndex: 'lastDelayTime',
      key: 'lastDelayTime',
      width: 400,
      sorter: (a, b) => a.lastDelayTime.localeCompare(b.lastDelayTime),
    },
    {
      title: 'Last Polling Time',
      dataIndex: 'lastPollingTime',
      key: 'lastPollingTime',
      width: 400,
      sorter: (a, b) => a.lastPollingTime.localeCompare(b.lastPollingTime),
    },
  ];

  return (
    <div>
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
            <Form.Item label="Entity Type">
              <Select
                value={queueTypeFilter}
                onChange={setQueueTypeFilter}
                placeholder="Select entity type"
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
        scroll={{ x: 2000 }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />
    </div>
  );
};

export default PollingInfo;

