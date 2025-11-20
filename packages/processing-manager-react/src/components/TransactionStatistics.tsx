/**
 * Transaction Statistics Component
 *
 * Displays comprehensive statistics and metrics for a transaction including:
 * - Transaction status with color-coded indicators
 * - Member counts by entity type
 * - Processing duration and timing information
 * - Success/failure rates
 * - Detailed transaction metadata
 *
 * @component
 *
 * @example
 * ```tsx
 * import { TransactionStatistics } from '@cyoda/processing-manager-react';
 *
 * function TransactionDetail({ transaction }: { transaction: Transaction }) {
 *   return (
 *     <div>
 *       <h1>Transaction {transaction.id}</h1>
 *       <TransactionStatistics transaction={transaction} />
 *     </div>
 *   );
 * }
 * ```
 */

import { Card, Row, Col, Statistic, Tag, Descriptions } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { Transaction } from '../types';

/**
 * Props for TransactionStatistics component
 */
interface TransactionStatisticsProps {
  /** Transaction data to display */
  transaction: Transaction;
}

/**
 * TransactionStatistics Component
 *
 * Renders a comprehensive statistics card for a transaction with visual indicators,
 * metrics, and detailed information organized in a responsive grid layout.
 *
 * @param props - Component props
 * @returns Transaction statistics card
 */
export default function TransactionStatistics({ transaction }: TransactionStatisticsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'RUNNING':
        return 'processing';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'FAILED':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'RUNNING':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={true} style={{ height: '100%' }}>
            <Statistic
              title="Status"
              value={transaction.status || '0'}
              prefix={getStatusIcon(transaction.status)}
              valueStyle={{ fontSize: '16px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={true} style={{ height: '100%' }}>
            <Statistic
              title="Duration"
              value={formatDuration(transaction.duration)}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ fontSize: '16px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={true} style={{ height: '100%' }}>
            <Statistic
              title="Start Time"
              value={transaction.startTime ? new Date(transaction.startTime).toLocaleString() : 'Invalid Date'}
              valueStyle={{ fontSize: '13px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={true} style={{ height: '100%' }}>
            <Statistic
              title="End Time"
              value={transaction.endTime ? new Date(transaction.endTime).toLocaleString() : 'In Progress'}
              valueStyle={{ fontSize: '13px' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Transaction Details" bordered={true}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
          <Descriptions.Item label="Transaction ID">
            {transaction.id}
          </Descriptions.Item>

          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(transaction.status)}>
              {transaction.status}
            </Tag>
          </Descriptions.Item>

          {transaction.entityId && (
            <Descriptions.Item label="Entity ID">
              {transaction.entityId}
            </Descriptions.Item>
          )}

          {transaction.entityType && (
            <Descriptions.Item label="Entity Type">
              <Tag>{transaction.entityType}</Tag>
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Start Time">
            {transaction.startTime ? new Date(transaction.startTime).toLocaleString() : '-'}
          </Descriptions.Item>

          <Descriptions.Item label="End Time">
            {transaction.endTime ? new Date(transaction.endTime).toLocaleString() : '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Duration">
            {formatDuration(transaction.duration)}
          </Descriptions.Item>

          {transaction.user && (
            <Descriptions.Item label="User" icon={<UserOutlined />}>
              {transaction.user}
            </Descriptions.Item>
          )}

          {transaction.error && (
            <Descriptions.Item label="Error" span={2}>
              <span style={{ color: '#ff4d4f' }}>{transaction.error}</span>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );
}

