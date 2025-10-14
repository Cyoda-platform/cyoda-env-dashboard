/**
 * Loaded Online Nodes Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo/PmLoadedOnlineNodes.vue
 */

import React from 'react';
import { LoadedOnlineNodes as LoadedOnlineNodesComponent } from '@cyoda/http-api-react';
import { usePlatformCommonZkInfoLoadedOnlineNodes } from '../../hooks';

interface LoadedOnlineNodesProps {
  clusterStateClientNodes?: any;
}

export const LoadedOnlineNodes: React.FC<LoadedOnlineNodesProps> = ({
  clusterStateClientNodes = {},
}) => {
  const getZkInfoLoadedOnlineNodesRequest = () => {
    return usePlatformCommonZkInfoLoadedOnlineNodes();
  };

  return (
    <div>
      <LoadedOnlineNodesComponent
        getZkInfoLoadedOnlineNodesRequestFn={getZkInfoLoadedOnlineNodesRequest}
        clusterStateClientNodes={clusterStateClientNodes}
      />
    </div>
  );
};

export default LoadedOnlineNodes;

