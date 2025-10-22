/**
 * Mock API Toggle Component
 *
 * Provides a UI control to enable/disable mock API for testing
 */

import React, { useState, useEffect } from 'react';
import { Switch, Card, Typography, Space, Tag, Alert, Button } from 'antd';
import { ExperimentOutlined, ApiOutlined, MinusOutlined, ExpandOutlined } from '@ant-design/icons';
import { enableMockApi, disableMockApi, isMockApiEnabled, TEST_NODE_NAME } from '../mocks';

const { Text, Title } = Typography;

export function MockApiToggle() {
  const [enabled, setEnabled] = useState(isMockApiEnabled());
  const [minimized, setMinimized] = useState(false);

  // Sync state with mock API on mount
  useEffect(() => {
    setEnabled(isMockApiEnabled());
  }, []);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      enableMockApi();
    } else {
      disableMockApi();
    }
    setEnabled(checked);
  };

  const handleMinimize = () => {
    setMinimized(!minimized);
  };

  return (
    <Card
      size="small"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: minimized ? 200 : 350,
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'width 0.3s ease',
      }}
      extra={
        <Button
          type="text"
          size="small"
          icon={minimized ? <ExpandOutlined /> : <MinusOutlined />}
          onClick={handleMinimize}
          style={{ padding: '4px 8px' }}
        />
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <ExperimentOutlined style={{ fontSize: 20, color: enabled ? '#52c41a' : '#8c8c8c' }} />
          <Title level={5} style={{ margin: 0 }}>
            Test Mode
          </Title>
          <Switch
            checked={enabled}
            onChange={handleToggle}
            checkedChildren="ON"
            unCheckedChildren="OFF"
          />
        </Space>

        {!minimized && enabled && (
          <>
            <Alert
              message="Mock API Enabled"
              description={`All API calls will return mock data for testing. Test node: ${TEST_NODE_NAME}`}
              type="success"
              showIcon
              icon={<ApiOutlined />}
              style={{ marginTop: 8 }}
            />

            <Space wrap>
              <Tag color="green">Cluster Stats</Tag>
              <Tag color="green">Shards</Tag>
              <Tag color="green">Transactions</Tag>
              <Tag color="green">Events</Tag>
              <Tag color="green">ZooKeeper</Tag>
              <Tag color="green">Network</Tag>
              <Tag color="green">Caches</Tag>
              <Tag color="green">Components</Tag>
            </Space>

            <Text type="secondary" style={{ fontSize: 12 }}>
              Navigate to <Text code>/processing-ui/nodes/{TEST_NODE_NAME}</Text> to test all tabs
            </Text>
          </>
        )}

        {!minimized && !enabled && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Enable test mode to use mock data for testing all Processing Manager features
          </Text>
        )}
      </Space>
    </Card>
  );
}

