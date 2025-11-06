/**
 * Transactions Executing Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsExecuting.vue
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Form, InputNumber, Button, Table, Row, Col, Card } from 'antd';
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useExecTransactionsInfo } from '../../hooks';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import './TransactionsExecuting.scss';

interface TransactionData {
  index: number;
  id: string;
  time: string;
}

export const TransactionsExecuting: React.FC = () => {
  const storage = useMemo(() => new HelperStorage(), []);
  const [limit, setLimit] = useState(100);
  const [updateInterval, setUpdateInterval] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data, refetch } = useExecTransactionsInfo({ limit });

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('transactionsExecuting:columnWidths', {});
    const defaultWidths = {
      index: 100,
      id: 300,
      time: 300,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('transactionsExecuting:columnWidths', columnWidths);
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

  const tableData: TransactionData[] = Array.isArray(data)
    ? data.map((item: any, index: number) => ({
        index: index + 1,
        id: item.id,
        time: item.time,
      }))
    : [];

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

  const columns: ColumnsType<TransactionData> = useMemo(() => [
    {
      title: '№',
      dataIndex: 'index',
      key: 'index',
      width: columnWidths.index,
      fixed: 'left',
      sorter: (a, b) => a.index - b.index,
      onHeaderCell: () => ({
        width: columnWidths.index,
        onResize: handleResize('index'),
      }),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: columnWidths.id,
      sorter: (a, b) => a.id.localeCompare(b.id),
      onHeaderCell: () => ({
        width: columnWidths.id,
        onResize: handleResize('id'),
      }),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      width: columnWidths.time,
      sorter: (a, b) => a.time.localeCompare(b.time),
      onHeaderCell: () => ({
        width: columnWidths.time,
        onResize: handleResize('time'),
      }),
    },
  ], [columnWidths, handleResize]);

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
              <Form.Item label=" ">
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
              </Form.Item>
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

export default TransactionsExecuting;

