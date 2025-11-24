/**
 * Summary Power Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabSummary/PmShardsDetailTabSummaryPower.vue
 */

import React, { useEffect, useState } from 'react';
import { Card, Tag } from 'antd';
import { useParams } from 'react-router-dom';
import { useProcessingStore } from '../../stores';
import './SummaryPower.scss';

export const SummaryPower: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [up, setUp] = useState<boolean | null>(null);
  const nodes = useProcessingStore((state) => state.nodesProcessing);

  useEffect(() => {
    const loadServiceStatus = async () => {
      if (nodes && nodes.length > 0) {
        const node = nodes.find((el: any) => el.hostname === name);
        if (node?.grafana) {
          // TODO: Implement loadUp from grafana store
          // For now, set to null (unknown)
          setUp(null);
        }
      }
    };

    loadServiceStatus();
  }, [nodes, name]);

  const getStatusTag = () => {
    if (up === null) {
      return <Tag color="default">Unknown</Tag>;
    }
    if (up) {
      return <Tag color="success">Running</Tag>;
    }
    return <Tag color="error">Stop</Tag>;
  };

  return (
    <Card
      className="summary-power-card"
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Power</span>
          {getStatusTag()}
        </div>
      }
      style={{ marginBottom: 16 }}
    />
  );
};

export default SummaryPower;

