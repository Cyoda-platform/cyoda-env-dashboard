/**
 * Shards Detail Tab - Composite Indexes
 * Tab showing composite indexes information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabCompositeIndexes.vue
 */

import React from 'react';
import { Card } from 'antd';
import { CompositeIndexesWrapper } from '../composite-indexes';

export const ShardsDetailTabCompositeIndexes: React.FC = () => {
  return (
    <Card>
      <h3>Composite Indexes</h3>
      <CompositeIndexesWrapper />
    </Card>
  );
};

export default ShardsDetailTabCompositeIndexes;

