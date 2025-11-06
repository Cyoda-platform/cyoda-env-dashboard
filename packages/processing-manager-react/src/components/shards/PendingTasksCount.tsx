/**
 * Pending Tasks Count Component
 * Displays the count of pending tasks
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingManagers/PmPendingTasksCount.vue
 */

import React from 'react';
import { Card, Statistic } from 'antd';

interface PendingTasksCountProps {
  pendingTaskCount: number;
}

export const PendingTasksCount: React.FC<PendingTasksCountProps> = ({ pendingTaskCount }) => {
  return (
    <Card title="Pending Tasks count" style={{ marginBottom: 16 }}>
      <Statistic value={pendingTaskCount} />
    </Card>
  );
};

export default PendingTasksCount;

