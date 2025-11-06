/**
 * Resources Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingManagers/PmResources.vue
 */

import React from 'react';
import { Card, Progress } from 'antd';
import './Resources.scss';

interface ResourceInfo {
  type: string;
  available: number;
  poolSize: number;
  size: number;
}

interface ResourcesProps {
  poolInfo: ResourceInfo[];
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

export const Resources: React.FC<ResourcesProps> = ({ poolInfo = [] }) => {
  const getUsed = (resource: ResourceInfo) => {
    return resource.poolSize - resource.available;
  };

  const getPercentage = (resource: ResourceInfo) => {
    const used = getUsed(resource);
    return Math.ceil((used / resource.poolSize) * 100);
  };

  const getStatus = (resource: ResourceInfo): 'success' | 'normal' | 'exception' => {
    const percentage = getPercentage(resource);
    if (percentage < 30) {
      return 'success';
    }
    if (percentage < 50) {
      return 'success';
    }
    if (percentage < 80) {
      return 'normal';
    }
    return 'exception';
  };

  return (
    <Card title="Resources">
      {poolInfo.map((resource) => (
        <div key={resource.type} className="progress-container">
          <div className="title">{formatResourceName(resource.type)}</div>
          <Progress
            percent={getPercentage(resource)}
            status={getStatus(resource)}
            strokeWidth={10}
            showInfo={false}
          />
          <div className="labels d-flex justify-content-between">
            <div>
              {resource.available}/{resource.poolSize}
            </div>
            <div className="bold">{resource.size}</div>
          </div>
        </div>
      ))}
    </Card>
  );
};

export default Resources;

