/**
 * Resources Component
 * Displays resource pool information with progress bars
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingManagers/PmResources.vue
 */

import React from 'react';
import { Card, Progress } from 'antd';
import './Resources.scss';

interface PoolInfo {
  type: string;
  available: number;
  poolSize: number;
  size: number;
}

interface ResourcesProps {
  poolInfo: PoolInfo[];
}

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getUsed = (resource: PoolInfo): number => {
  return resource.poolSize - resource.available;
};

const getPercentage = (resource: PoolInfo): number => {
  const used = getUsed(resource);
  return Math.ceil((used / resource.poolSize) * 100);
};

const getStatus = (resource: PoolInfo): 'success' | 'exception' | 'normal' => {
  const percentage = getPercentage(resource);
  if (percentage < 50) {
    return 'success';
  }
  if (percentage < 80) {
    return 'normal';
  }
  return 'exception';
};

export const Resources: React.FC<ResourcesProps> = ({ poolInfo }) => {
  return (
    <Card title="Resources" style={{ marginBottom: 16 }}>
      {poolInfo.map((resource) => (
        <div key={resource.type} className="progress-container">
          <div className="title">{capitalize(resource.type)}</div>
          <Progress
            percent={getPercentage(resource)}
            status={getStatus(resource)}
            strokeWidth={10}
            showInfo={false}
          />
          <div className="labels">
            <span>{resource.available}/{resource.poolSize}</span>
            <span className="bold">{resource.size}</span>
          </div>
        </div>
      ))}
    </Card>
  );
};

export default Resources;

