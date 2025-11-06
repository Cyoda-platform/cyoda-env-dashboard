/**
 * Entity Viewer Demo Page
 * Demonstrates the Entity Viewer component functionality
 */

import React from 'react';
import { PageEntityViewer } from '@cyoda/http-api-react';
import { Card, Typography, Space, Alert } from 'antd';

const { Title, Paragraph } = Typography;

const EntityViewerDemo: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>Entity Viewer Demo</Title>
          <Paragraph>
            The Entity Viewer allows you to explore entity class structures, relationships, and properties
            in an interactive, draggable interface.
          </Paragraph>
          
          <Alert
            message="Demo Mode"
            description="This demo uses mock data. In production, it will connect to the actual API endpoints."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Title level={4}>Features:</Title>
          <ul>
            <li>Select entity classes from dropdown</li>
            <li>Toggle between dynamic and non-dynamic entities</li>
            <li>Drag entity boxes around the canvas</li>
            <li>Zoom in/out controls</li>
            <li>View entity properties and relationships</li>
            <li>Delete entities with confirmation</li>
          </ul>
        </Card>

        <Card>
          <PageEntityViewer />
        </Card>
      </Space>
    </div>
  );
};

export default EntityViewerDemo;

