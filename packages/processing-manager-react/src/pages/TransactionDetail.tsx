/**
 * Transaction Detail Page
 * Migrated from @cyoda/processing-manager/src/views/TransactionDetail.vue
 */

import { Card, Tabs, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

import { useParams, useNavigate } from 'react-router-dom';
import {
  TransitionDetailStatistics,
  TransitionDetailStatisticsTransactionMembers,
  TransitionDetailStatisticsTransactionEvents,
} from '../components/transition-detail';

export default function TransactionDetail() {
  const { name, transactionId } = useParams<{ name: string; transactionId: string }>();
  const navigate = useNavigate();

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
      label: 'Transaction main statistics',
      children: <TransitionDetailStatistics />,
    },
    {
      key: 'members',
      label: 'Transaction members',
      children: <TransitionDetailStatisticsTransactionMembers />,
    },
    {
      key: 'events',
      label: 'Transaction events',
      children: <TransitionDetailStatisticsTransactionEvents />,
    },
  ];

  return (
    
      <div style={{ padding: '24px' }}>
        <Breadcrumb
          items={breadcrumbItems}
          style={{ marginBottom: 16 }}
        />

        <Card variant="borderless">
          <Tabs
            defaultActiveKey="statistics"
            items={tabItems}
          />
        </Card>
      </div>
    
  );
}

