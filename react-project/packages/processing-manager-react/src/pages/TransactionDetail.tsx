/**
 * Transaction Detail Page
 * Migrated from @cyoda/processing-manager/src/views/TransactionDetail.vue
 */

import { Card, Typography, Tabs, Spin, Alert, Breadcrumb } from 'antd';
import { HomeOutlined, DatabaseOutlined } from '@ant-design/icons';

import { useParams, useNavigate } from 'react-router-dom';
import { useTransaction } from '../hooks';
import {
  TransactionStatistics,
  TransactionMembersTable,
  TransactionEventsTable,
} from '../components';

const { Title } = Typography;

export default function TransactionDetail() {
  const { name, transactionId } = useParams<{ name: string; transactionId: string }>();
  const navigate = useNavigate();
  const { data: transaction, isLoading, error } = useTransaction(transactionId!);

  if (isLoading) {
    return (
      
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" tip="Loading transaction details..." />
        </div>
      
    );
  }

  if (error || !transaction) {
    return (
      
        <div style={{ padding: '24px' }}>
          <Alert
            message="Error"
            description="Failed to load transaction details"
            type="error"
            showIcon
          />
        </div>
      
    );
  }

  const breadcrumbItems = [
    {
      title: (
        <span>
          <HomeOutlined />
          <span style={{ marginLeft: 8 }}>Processing</span>
        </span>
      ),
      onClick: () => navigate('/processing-ui'),
    },
    {
      title: 'Nodes',
      onClick: () => navigate('/processing-ui/nodes'),
    },
    {
      title: name,
      onClick: () => navigate(`/processing-ui/nodes/${name}`),
    },
    {
      title: `Transaction ${transactionId}`,
    },
  ];

  const tabItems = [
    {
      key: 'statistics',
      label: (
        <span>
          <DatabaseOutlined />
          Statistics
        </span>
      ),
      children: <TransactionStatistics transaction={transaction} />,
    },
    {
      key: 'members',
      label: 'Members',
      children: <TransactionMembersTable transactionId={transactionId!} />,
    },
    {
      key: 'events',
      label: 'Events',
      children: <TransactionEventsTable transactionId={transactionId!} />,
    },
  ];

  return (
    
      <div style={{ padding: '24px' }}>
        <Breadcrumb
          items={breadcrumbItems}
          style={{ marginBottom: 16 }}
        />

        <Card>
          <Title level={2}>Transaction Detail</Title>
          <p style={{ color: '#666', marginBottom: 24 }}>
            Node: <strong>{name}</strong> | Transaction ID: <strong>{transactionId}</strong>
          </p>

          <Tabs
            defaultActiveKey="statistics"
            items={tabItems}
            size="large"
          />
        </Card>
      </div>
    
  );
}

