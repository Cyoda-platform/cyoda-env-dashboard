/**
 * Transactions Executing Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsExecuting.vue
 */

import React, { useState, useEffect, useRef } from 'react';
import { Form, InputNumber, Button, Table, Row, Col, Card } from 'antd';
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useExecTransactionsInfo } from '../../hooks';
import type { ColumnsType } from 'antd/es/table';
import './TransactionsExecuting.scss';

interface TransactionData {
  index: number;
  id: string;
  time: string;
}

export const TransactionsExecuting: React.FC = () => {
  const [limit, setLimit] = useState(100);
  const [updateInterval, setUpdateInterval] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data, refetch } = useExecTransactionsInfo({ limit });

  const tableData: TransactionData[] = data?.map((item: any, index: number) => ({
    index: index + 1,
    id: item.id,
    time: item.time,
  })) || [];

  const runInterval = () => {
    if (intervalRef.current) return;
    
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      refetch();
    }, updateInterval * 1000);
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopInterval();
    };
  }, []);

  const columns: ColumnsType<TransactionData> = [
    {
      title: '№',
      dataIndex: 'index',
      key: 'index',
      width: 100,
      fixed: 'left',
      sorter: (a, b) => a.index - b.index,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      sorter: (a, b) => a.time.localeCompare(b.time),
    },
  ];

  return (
    <div className="pm-shards-detail-tab-transactions-executing">
      <Card>
        <Form layout="vertical" className="form">
          <h3>Settings</h3>
          <Row gutter={20}>
            <Col span={6}>
              <Form.Item label="Limit">
                <InputNumber
                  min={1}
                  value={limit}
                  onChange={(value) => setLimit(value || 100)}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Update Interval (seconds)">
                <InputNumber
                  min={1}
                  value={updateInterval}
                  onChange={(value) => setUpdateInterval(value || 2)}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6} className="wrap-button">
              {isRunning ? (
                <Button
                  type="default"
                  danger
                  onClick={stopInterval}
                  icon={<StopOutlined />}
                >
                  Stop
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={runInterval}
                  icon={<PlayCircleOutlined />}
                >
                  Start
                </Button>
              )}
            </Col>
          </Row>
        </Form>
      </Card>

      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="id"
        bordered
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          showSizeChanger: true,
          defaultPageSize: 10,
        }}
      />
    </div>
  );
};

export default TransactionsExecuting;

