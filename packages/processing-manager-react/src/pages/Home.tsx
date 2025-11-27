/**
 * Home Page
 * Migrated from @cyoda/processing-manager/src/views/Home.vue
 * Redesigned to integrate with saas-app layout
 */

import { Card, Typography, Row, Col, Statistic, Spin, Alert } from 'antd';
import { ClusterOutlined, CheckCircleOutlined, CloseCircleOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useClusterStats } from '../hooks';
import { useNavigate } from 'react-router-dom';
import './Home.scss';

const { Title, Paragraph } = Typography;

interface NodeData {
  hostname: string;
  baseUrl: string;
  status: string;
  version?: string;
  uptime?: number;
  grafana?: any;
}

// Helper function to check if node is online
// If status is not provided or unknown, we check if node has baseUrl (means it's reachable)
// Otherwise we check if status indicates online state
const isNodeOnline = (status?: string, baseUrl?: string): boolean => {
  // If no status provided, check if node has baseUrl (means it's in the cluster and reachable)
  if (!status || status === 'Unknown') {
    return !!baseUrl;
  }

  const upperStatus = status.toUpperCase();
  // Check for various online status values
  return upperStatus === 'ONLINE' ||
         upperStatus === 'RUNNING' ||
         upperStatus === 'UP' ||
         upperStatus === 'ACTIVE';
};

export default function Home() {
  const { data, isLoading, error } = useClusterStats();
  const navigate = useNavigate();

  const onlineNodes = data?.pmNodes?.filter((node: any) => isNodeOnline(node.status, node.baseUrl)).length || 0;
  const offlineNodes = data?.pmNodes?.filter((node: any) => !isNodeOnline(node.status, node.baseUrl)).length || 0;
  const totalNodes = data?.pmNodes?.length || 0;

  const handleNodeClick = (hostname: string) => {
    navigate(`/processing-ui/nodes/${hostname}`);
  };

  const nodes: NodeData[] = data?.pmNodes?.map((node: any) => ({
    hostname: node.hostname || node.name,
    baseUrl: node.baseUrl || '-',
    status: node.status || 'Unknown',
    version: node.version,
    uptime: node.uptime,
    grafana: node.grafana,
  })) || [];

  return (
    <div className="processing-home">
      <h1 className="page-title">Processing</h1>
      <Paragraph className="page-description">
        Monitor and manage data processing operations, nodes, and transactions.
      </Paragraph>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={8}>
          <Card variant="borderless">
            <Statistic
              title="Total Nodes"
              value={totalNodes}
              prefix={<ClusterOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless">
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
          <Card variant="borderless">
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

      <div className="nodes-section">
        <div className="nodes-header">
          <h3>Nodes ({totalNodes})</h3>
        </div>

        {isLoading && (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        )}

        {error && (
          <div className="error-container">
            <Alert
              message="Error"
              description="Failed to load cluster statistics"
              type="error"
              showIcon
            />
          </div>
        )}

        {data && nodes.length > 0 && (
          <div className="nodes-list">
            {nodes.map((node, index) => {
              const isOnline = isNodeOnline(node.status, node.baseUrl);

              // Build description with node details
              const descriptionParts = [];
              if (node.baseUrl && node.baseUrl !== '-') {
                descriptionParts.push(`URL: ${node.baseUrl}`);
              }
              if (node.version) {
                descriptionParts.push(`Version: ${node.version}`);
              }
              if (node.status) {
                descriptionParts.push(`Status: ${node.status}`);
              }

              const description = descriptionParts.length > 0
                ? descriptionParts.join(' • ')
                : (node.grafana ? 'Connected to Grafana' : 'This IP is not connected to Grafana');

              return (
                <div
                  key={index}
                  className="node-item"
                  onClick={() => handleNodeClick(node.hostname)}
                >
                  <Row align="middle" style={{ minHeight: '50px', padding: '10px 0' }}>
                    <Col flex="none" style={{ marginRight: '16px' }}>
                      <div className={`status-indicator ${isOnline ? 'active' : 'deactive'}`}></div>
                    </Col>
                    <Col flex="none" style={{ marginRight: '16px' }}>
                      <DatabaseOutlined style={{ fontSize: '20px' }} />
                    </Col>
                    <Col flex="auto">
                      <div className="node-title">{node.hostname || 'Unknown Node'}</div>
                      <div className="node-description">{description}</div>
                    </Col>
                  </Row>
                </div>
              );
            })}
          </div>
        )}

        {data && nodes.length === 0 && !isLoading && (
          <div className="no-nodes">
            No nodes available
          </div>
        )}
      </div>
    </div>
  );
}

