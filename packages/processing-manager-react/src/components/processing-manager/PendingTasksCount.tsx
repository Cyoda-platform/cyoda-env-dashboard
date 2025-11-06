/**
 * Pending Tasks Count Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingManagers/PmPendingTasksCount.vue
 */

import React from 'react';
import { Card } from 'antd';

interface PendingTasksCountProps {
  pendingTaskCount: number;
}

export const PendingTasksCount: React.FC<PendingTasksCountProps> = ({ pendingTaskCount = 0 }) => {
  return <Card title="Pending Tasks count">{pendingTaskCount}</Card>;
};

export default PendingTasksCount;

