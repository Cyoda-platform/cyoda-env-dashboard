/**
 * Nodes Page
 * Migrated from @cyoda/processing-manager/src/views/Nodes.vue
 */

import { Card, Typography, Spin, Alert } from 'antd';
import { BaseLayout } from '@cyoda/ui-lib-react';
import { useClusterStats } from '../hooks';

const { Title } = Typography;

export default function Nodes() {
  const { data, isLoading, error } = useClusterStats();

  return (
    <BaseLayout>
      <div style={{ padding: '24px' }}>
        <Card>
          <Title level={2}>Processing Nodes</Title>
          
          {isLoading && <Spin size="large" />}
          
          {error && (
            <Alert
              message="Error"
              description="Failed to load cluster statistics"
              type="error"
              showIcon
            />
          )}
          
          {data && (
            <div>
              <p>Total Nodes: {data.totalNodes}</p>
              <p>Running Nodes: {data.runningNodes}</p>
              <p>Stopped Nodes: {data.stoppedNodes}</p>
              <p>Error Nodes: {data.errorNodes}</p>
            </div>
          )}
        </Card>
      </div>
    </BaseLayout>
  );
}

