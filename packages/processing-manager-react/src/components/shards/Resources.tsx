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

/**
 * Format resource name from uppercase to title case
 * Examples:
 * - "MAIN-DEFAULT" -> "Main-Default"
 * - "TRANSACTION_EXEC_SEQ" -> "Transaction Exec Seq"
 * - "SYSTEM" -> "System"
 */
const formatResourceName = (str: string): string => {
  // Replace underscores with spaces, preserve hyphens
  return str
    .toLowerCase()
    .replace(/_/g, ' ')
    .split(/(\s+|-)/) // Split by spaces or hyphens but keep the separators
    .map(part => {
      // Only capitalize words, not separators
      if (part.trim() && part !== '-') {
        return part.charAt(0).toUpperCase() + part.slice(1);
      }
      return part;
    })
    .join('');
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
    <Card title="Resources" className="resources-card">
      {poolInfo.map((resource) => (
        <div key={resource.type} className="progress-container">
          <div className="title">{formatResourceName(resource.type)}</div>
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

