/**
 * Current Node Info Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo/PmCurrNodeInfo.vue
 */

import React from 'react';
import { CurrNodeInfo as CurrNodeInfoComponent } from '@cyoda/http-api-react';
import { usePlatformCommonZkInfoCurrNodeInfo } from '../../hooks';

interface CurrNodeInfoProps {
  clusterStateCurrentNode?: any;
}

export const CurrNodeInfo: React.FC<CurrNodeInfoProps> = ({
  clusterStateCurrentNode = {},
}) => {
  const getZkInfoCurrNodeInfoRequest = () => {
    return usePlatformCommonZkInfoCurrNodeInfo();
  };

  return (
    <div>
      <CurrNodeInfoComponent
        getZkInfoCurrNodeInfoRequestFn={getZkInfoCurrNodeInfoRequest}
        clusterStateCurrentNode={clusterStateCurrentNode}
      />
    </div>
  );
};

export default CurrNodeInfo;

