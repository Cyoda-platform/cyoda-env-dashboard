/**
 * Loaded Shards Distribution Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo/PmLoadedShardsDistribution.vue
 */

import React from 'react';
import { LoadedShardsDistribution as LoadedShardsDistributionComponent } from '@cyoda/http-api-react';
import { usePlatformCommonZkInfoLoadedShardsDistribution } from '../../hooks';

interface LoadedShardsDistributionProps {
  clusterState?: any;
  clusterStateShardsDistr?: any;
}

export const LoadedShardsDistribution: React.FC<LoadedShardsDistributionProps> = ({
  clusterState = {},
  clusterStateShardsDistr = {},
}) => {
  const getZkInfoLoadedShardsDistributionRequest = () => {
    return usePlatformCommonZkInfoLoadedShardsDistribution();
  };

  return (
    <div>
      <LoadedShardsDistributionComponent
        clusterState={clusterState}
        clusterStateShardsDistr={clusterStateShardsDistr}
        getZkInfoLoadedShardsDistributionRequestFn={getZkInfoLoadedShardsDistributionRequest}
      />
    </div>
  );
};

export default LoadedShardsDistribution;

