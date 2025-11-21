/**
 * Shards Detail Tab - Network Info
 * Tab showing network information
 * Migrated from @cyoda/http-api/src/views/NetworkInfoView.vue
 */

import React from 'react';
import { NetworkInfoServer, NetworkClients } from '../network-info';
import './ShardsDetailTabNetworkInfo.scss';

export const ShardsDetailTabNetworkInfo: React.FC = () => {
  return (
    <div className="network-info-view">
      <h1 className="heading h1">Network Info</h1>
      <NetworkInfoServer />
      <hr />
      <NetworkClients />
    </div>
  );
};

export default ShardsDetailTabNetworkInfo;

