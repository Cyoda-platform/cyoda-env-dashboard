/**
 * TaskDetailSkeleton Component
 * Skeleton loading state for task detail page
 */

import React from 'react';
import { Card, Skeleton, Row, Col, Space } from 'antd';

export const TaskDetailSkeleton: React.FC = () => {
  return (
    <div role="status" aria-live="polite" aria-label="Loading task details">
      <Card
        title={
          <Space>
            <Skeleton.Button active size="small" style={{ width: 80 }} />
            <Skeleton.Input active size="small" style={{ width: 200 }} />
          </Space>
        }
        extra={
          <Space>
            <Skeleton.Button active size="small" style={{ width: 60 }} />
          </Space>
        }
      >
        <Row gutter={24}>
          {/* Left Column - Form Skeleton */}
          <Col span={16} style={{ borderRight: '1px solid #f0f0f0', paddingRight: 24 }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Col>

          {/* Right Column - Entity Info Skeleton */}
          <Col span={8}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default TaskDetailSkeleton;

