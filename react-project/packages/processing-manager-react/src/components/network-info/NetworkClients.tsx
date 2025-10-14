/**
 * Network Clients Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabNetworkInfo/PmNetworkClients.vue
 */

import React from 'react';
import { NetworkClients as NetworkClientsComponent } from '@cyoda/http-api-react';
import { usePlatformCommonNetInfoClients } from '../../hooks';

export const NetworkClients: React.FC = () => {
  const getNetInfoClientsRequest = () => {
    return usePlatformCommonNetInfoClients();
  };

  return (
    <div>
      <NetworkClientsComponent getNetInfoClientsRequestFn={getNetInfoClientsRequest} />
    </div>
  );
};

export default NetworkClients;

