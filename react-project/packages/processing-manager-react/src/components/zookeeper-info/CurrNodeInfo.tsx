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
          <Descriptions.Item label="Node Name">
            {(nodeInfo as any)?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Host">
            {(nodeInfo as any)?.host || '-'}
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
          <Descriptions.Item label="State">
            {(nodeInfo as any)?.state ? (
              <Tag color={(nodeInfo as any).state === 'RUNNING' ? 'green' : 'default'}>
                {(nodeInfo as any).state}
              </Tag>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Leader">
            {(nodeInfo as any)?.leader ? (
              <Tag color="blue">Leader</Tag>
            ) : (
              <Tag>Follower</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default CurrNodeInfo;

