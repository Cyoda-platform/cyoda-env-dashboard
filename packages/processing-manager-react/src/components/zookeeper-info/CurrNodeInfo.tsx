/**
 * Current Node Info Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo/PmCurrNodeInfo.vue
 */

import React from 'react';
import { Spin } from 'antd';
import { useZkCurrNodeInfo } from '../../hooks/usePlatformCommon';
import './CurrNodeInfo.scss';

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
    <div className="curr-node-info">
      <h1 className="label">Node info</h1>
      <div className="wrap-box">
        <div className="title">
          <span className="type-class">TYPE:</span>&nbsp;
          <span className="green">{(nodeInfo as any)?.type || '-'}</span>
        </div>
        <div className="row-flex">
          <div>
            <strong>BaseUrl:</strong><br/>
            {(nodeInfo as any)?.baseUrl || '-'}
          </div>
          <div>
            <strong>Host:</strong><br/>
            {(nodeInfo as any)?.host || '-'}
          </div>
          <div>
            <strong>Notifications Port:</strong><br/>
            {(nodeInfo as any)?.notificationsPort || '-'}
          </div>
          <div>
            <strong>Processing Node:</strong><br/>
            {(nodeInfo as any)?.processingNode !== undefined
              ? ((nodeInfo as any).processingNode ? 'Yes' : 'No')
              : '-'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrNodeInfo;

