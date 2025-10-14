/**
 * Network Info Server Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabNetworkInfo/PmNetworkInfoServer.vue
 */

import React from 'react';
import { NetworkInfoServer as NetworkInfoServerComponent } from '@cyoda/http-api-react';
import { usePlatformCommonNetInfoServer } from '../../hooks';

export const NetworkInfoServer: React.FC = () => {
  const getNetInfoServerRequest = () => {
    return usePlatformCommonNetInfoServer();
  };

  return (
    <div>
      <NetworkInfoServerComponent getNetInfoServerRequestFn={getNetInfoServerRequest} />
    </div>
  );
};

export default NetworkInfoServer;

