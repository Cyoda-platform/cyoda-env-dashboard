/**
 * Shards Detail Tab - Network Info
 * Tab showing network information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabNetworkInfo.vue
 */

import React from 'react';
import { Card } from 'antd';
import { NetworkInfoServer, NetworkClients } from '../network-info';

export const ShardsDetailTabNetworkInfo: React.FC = () => {
  return (
    <Card>
      <h3>Network Info</h3>
      <NetworkInfoServer />
      <hr style={{ margin: '24px 0' }} />
      <NetworkClients />
    </Card>
  );
};

export default ShardsDetailTabNetworkInfo;

