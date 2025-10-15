/**
 * Network Info Server Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabNetworkInfo/PmNetworkInfoServer.vue
 */

import React from 'react';
import { Card, Descriptions, Spin } from 'antd';
import { useNetworkServerInfo } from '../../hooks/usePlatformCommon';

export const NetworkInfoServer: React.FC = () => {
  const { data: serverInfo, isLoading } = useNetworkServerInfo();

  if (isLoading) {
    return <Spin />;
  }

  return (
    <div>
      <Card title="Server Information" bordered={false}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Hostname">
            {(serverInfo as any)?.hostname || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="IP Address">
            {(serverInfo as any)?.ip || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Port">
            {(serverInfo as any)?.port || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Version">
            {(serverInfo as any)?.version || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default NetworkInfoServer;

