/**
 * Tasks Page
 * Main tasks list page with filters and grid
 * Migrated from: .old_project/packages/tasks/src/views/tasks/index/Tasks.vue
 */

import React from 'react';
import { Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import './Tasks.scss';

export const Tasks: React.FC = () => {
  return (
    <div className="tasks-page">
      <h1 className="page-title">Tasks</h1>

      <Alert
        message="Feature Not Available"
        description="This feature is currently under development and not yet available. Please check back later."
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        style={{ marginTop: 24 }}
      />
    </div>
  );
};

