/**
 * Pending Tasks Count Component
 * Displays the count of pending tasks
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingManagers/PmPendingTasksCount.vue
 */

import React from 'react';
import { Card, Statistic } from 'antd';
import './PendingTasksCount.scss';

interface PendingTasksCountProps {
  pendingTaskCount: number;
}

export const PendingTasksCount: React.FC<PendingTasksCountProps> = ({ pendingTaskCount }) => {
  return (
    <Card title="Pending Tasks count" className="pending-tasks-card" style={{ marginBottom: 24 }}>
      <Statistic value={pendingTaskCount} />
    </Card>
  );
};

export default PendingTasksCount;

