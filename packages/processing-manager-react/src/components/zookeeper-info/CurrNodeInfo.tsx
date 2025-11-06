/**
 * Current Node Info Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo/PmCurrNodeInfo.vue
 */

import React from 'react';
import { Card, Descriptions, Tag, Spin } from 'antd';
import { useZkCurrNodeInfo } from '../../hooks/usePlatformCommon';

interface CurrNodeInfoProps {
  clusterStateCurrentNode?: any;
}

export const CurrNodeInfo: React.FC<CurrNodeInfoProps> = ({
  clusterStateCurrentNode = {},
}) => {
  const { data: nodeInfo, isLoading } = useZkCurrNodeInfo();

  if (isLoading) {
    return <Spin />;
  }

  return (
    <div>
      <Card title="Current Node Information" bordered={false}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Node ID">
            {(nodeInfo as any)?.nodeId || (nodeInfo as any)?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Hostname">
            {(nodeInfo as any)?.hostname || (nodeInfo as any)?.host || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="IP Address">
            {(nodeInfo as any)?.ip || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Port">
            {(nodeInfo as any)?.port || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Version">
            {(nodeInfo as any)?.version || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {(nodeInfo as any)?.status || (nodeInfo as any)?.state ? (
              <Tag color={(nodeInfo as any).status === 'ONLINE' || (nodeInfo as any).state === 'RUNNING' ? 'green' : 'default'}>
                {(nodeInfo as any).status || (nodeInfo as any).state}
              </Tag>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Uptime">
            {(nodeInfo as any)?.uptime ? `${Math.floor((nodeInfo as any).uptime / 1000 / 60)} minutes` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="JVM Version">
            {(nodeInfo as any)?.jvmVersion || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default CurrNodeInfo;

