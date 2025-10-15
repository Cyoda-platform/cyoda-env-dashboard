/**
 * Shards Detail Tab - Processing Manager
 * Main tab showing processing manager information including shards, tasks, and resources
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabProcessingManager.vue
 */

import React from 'react';
import { Row, Col, Spin, Alert } from 'antd';
import { useSummary } from '../../hooks/useProcessing';
import { ActualShards } from './ActualShards';
import { Tasks } from './Tasks';
import { PendingTasksCount } from './PendingTasksCount';
import { Resources } from './Resources';

export const ShardsDetailTabProcessingManager: React.FC = () => {
  const { data, isLoading, error } = useSummary();

  // Show UI even without data - just with empty tables
  const actualShardsTable = (data?.actualShards || []).map((el: any) => ({
    ...el,
    shardId: parseInt(el.shardId, 10),
  }));

  return (
    <div>
      {isLoading && (
        <Alert message="Loading..." type="info" style={{ marginBottom: 16 }} />
      )}
      {error && (
        <Alert
          message="Error loading summary"
          description={String(error)}
          type="error"
          style={{ marginBottom: 16 }}
        />
      )}
      {!data && !isLoading && (
        <Alert
          message="No backend connection"
          description="Connect to a Cyoda backend API to see live data. The UI is shown below with empty tables."
          type="info"
          style={{ marginBottom: 16 }}
        />
      )}
      <Row gutter={16}>
        <Col sm={18}>
          <ActualShards actualShardsTable={actualShardsTable} />
          <Tasks
            tasksByEntity={data?.tasksByEntity || []}
            runningTaskCount={data?.runningTaskCount || 0}
            lastTaskFinishTime={data?.lastTaskFinishTime || ''}
          />
        </Col>
        <Col sm={6}>
          <PendingTasksCount pendingTaskCount={data?.pendingTaskCount || 0} />
          <Resources poolInfo={data?.poolInfo || []} />
        </Col>
      </Row>
    </div>
  );
};

export default ShardsDetailTabProcessingManager;

