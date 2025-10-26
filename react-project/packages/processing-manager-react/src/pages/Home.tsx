/**
 * Home Page
 * Migrated from @cyoda/processing-manager/src/views/Home.vue
 * Redesigned to integrate with saas-app layout
 */

import { Card, Typography, Row, Col, Statistic } from 'antd';
import { ClusterOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useClusterStats } from '../hooks';

const { Title, Paragraph } = Typography;

export default function Home() {
  const { data, isLoading } = useClusterStats();

  const onlineNodes = data?.pmNodes?.filter((node: any) => node.status === 'ONLINE').length || 0;
  const offlineNodes = data?.pmNodes?.filter((node: any) => node.status === 'OFFLINE').length || 0;
  const totalNodes = data?.pmNodes?.length || 0;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Processing</Title>
      <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
        Monitor and manage data processing operations, nodes, and transactions.
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Nodes"
              value={totalNodes}
              prefix={<ClusterOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Online Nodes"
              value={onlineNodes}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Offline Nodes"
              value={offlineNodes}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Nodes (1)" style={{ marginBottom: '24px' }}>
        <Paragraph>
          View and manage processing nodes in your cluster. Click on a node to see detailed information,
          metrics, and transaction history.
        </Paragraph>
      </Card>
    </div>
  );
}

